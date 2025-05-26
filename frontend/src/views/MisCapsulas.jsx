import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- Importa useLocation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faClock, 
  faLock, 
  faUnlock 
} from '@fortawesome/free-solid-svg-icons';

const MisCapsulas = () => {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [capsulas, setCapsulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // <-- Hook para leer el state

  // Al montar, si viene filtro en location.state, actívalo
  useEffect(() => {
    if (location.state?.filter) {
      setActiveFilter(location.state.filter);
    }
  }, [location.state]);

  const user = JSON.parse(localStorage.getItem('user')); // Asegúrate que la clave sea 'user'
  const userId = user?.id; // Esto será 8 si el usuario está logueado

  useEffect(() => {
    const fetchCapsulas = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/capsules/user/${userId}`);
        const data = await res.json();
        setCapsulas(data);
        console.log('Cápsulas recibidas:', data); // <-- Agrega esto
      } catch (err) {
        setCapsulas([]);
      }
      setLoading(false);
    };
    fetchCapsulas();
  }, [userId]);

  function getEstado(capsula) {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    if (apertura > ahora) return 'programada';
    return 'abierta';
  }

  const filteredCapsulas = activeFilter === 'todas'
    ? capsulas
    : capsulas.filter(c => getEstado(c) === activeFilter);

  const filtros = [
    { value: 'todas', label: 'Todas' },
    { value: 'abierta', label: 'Abiertas' },
    { value: 'programada', label: 'Programadas' }
  ];

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/capsules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Cápsula eliminada correctamente');
        navigate('/capsulas');
      } else {
        const error = await res.json();
        alert(error.message || 'Error al eliminar la cápsula');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-[#F5E050] passero-font">Mis Cápsulas del Tiempo</h1>
        <button
          className="bg-[#F5E050] text-[#2E2E7A] px-6 py-3 rounded-full 
            hover:bg-[#e6d047] transition-all flex items-center gap-2"
          onClick={() => navigate('/crear-capsula')}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Cápsula
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {filtros.map(filtro => (
          <button
            key={filtro.value}
            onClick={() => setActiveFilter(filtro.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap
              ${activeFilter === filtro.value 
                ? 'bg-[#F5E050] text-[#2E2E7A]' 
                : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e]'}`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Grid de cápsulas */}
      {loading ? (
        <div className="text-center text-[#F5E050]">Cargando cápsulas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsulas.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400">No tienes cápsulas.</div>
          ) : (
            filteredCapsulas.map(capsula => (
              <div
                key={capsula.Capsule_ID}
                className="bg-[#2E2E7A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer"
                onClick={() => navigate(`/vercapsula/${capsula.Capsule_ID}`)}
              >
                <div className="relative">
                  <img 
                    src={capsula.imagen || "https://picsum.photos/400/300"} 
                    alt={capsula.Title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      className="p-2 bg-[#1a1a4a] rounded-full text-[#F5E050] hover:bg-[#3d3d9e]"
                      onClick={e => {
                        e.stopPropagation();
                        navigate(`/editarcapsula/${capsula.Capsule_ID}`); // <-- Navega a la edición
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className="p-2 bg-[#1a1a4a] rounded-full text-red-500 hover:bg-[#3d3d9e]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(capsula.Capsule_ID);
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-[#F5E050] passero-font text-xl mb-2">
                    {capsula.Title}
                  </h3>
                  
                  <div className="space-y-2 text-sm text-gray-300">
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faClock} />
                      Creada: {new Date(capsula.Creation_Date).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={getEstado(capsula) === 'abierta' ? faUnlock : faClock} />
                      Se abre: {new Date(capsula.Opening_Date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-400">{capsula.Content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MisCapsulas;