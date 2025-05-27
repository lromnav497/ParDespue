import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- Importa useLocation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faClock, 
  faLock, 
  faUnlock,
  faBoxArchive
} from '@fortawesome/free-solid-svg-icons';
import PasswordModal from '../components/modals/PasswordModal'; // importa el modal

const MisCapsulas = () => {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [capsulas, setCapsulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // { type, capsula }
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

  const handleDelete = async (capsuleId) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta cápsula?')) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const res = await fetch(`/api/capsules/${capsuleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    });
    if (res.ok) {
      setCapsulas(prev => prev.filter(c => c.Capsule_ID !== capsuleId));
      alert('Cápsula eliminada correctamente');
    } else {
      const data = await res.json();
      alert(data.message || 'No se pudo eliminar');
    }
  };

  // Función para verificar contraseña (puedes hacer un endpoint real, aquí es ejemplo)
  const checkPassword = async (capsula, password) => {
    // Simula petición al backend
    const res = await fetch(`/api/capsules/${capsula.Capsule_ID}/check-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid;
  };

  // Handler general para acciones protegidas
  const handleProtectedAction = (type, capsula) => {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    if (type === 'ver' && apertura > ahora) {
      alert(`Esta cápsula aún no está disponible. Fecha de apertura: ${apertura.toLocaleDateString()}`);
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    // Si es privada y no es el creador, no dejar pasar
    if (capsula.Privacy === 'private' && user?.id !== capsula.Creator_User_ID) {
      alert('Solo el creador puede acceder a esta cápsula privada.');
      return;
    }
    // Si tiene contraseña, pide contraseña
    if (capsula.Password) {
      setPendingAction({ type, capsula });
      setShowPasswordModal(true);
      setPasswordError('');
      return;
    }
    // Si no, ejecuta la acción directamente
    ejecutarAccion(type, capsula);
  };

  // Ejecuta la acción después de validar contraseña
  const ejecutarAccion = (type, capsula) => {
    if (type === 'ver') navigate(`/vercapsula/${capsula.Capsule_ID}`);
    if (type === 'editar') navigate(`/editarcapsula/${capsula.Capsule_ID}`);
    if (type === 'eliminar') handleDelete(capsula.Capsule_ID);
  };

  // Cuando el usuario envía la contraseña
  const handlePasswordSubmit = async (password) => {
    const { type, capsula } = pendingAction;
    const ok = await checkPassword(capsula, password);
    if (ok) {
      setShowPasswordModal(false);
      ejecutarAccion(type, capsula);
    } else {
      setPasswordError('Contraseña incorrecta');
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
                onClick={e => {
                  e.stopPropagation();
                  handleProtectedAction('ver', capsula);
                }}
              >
                <div className="relative">
                  <img 
                    src={capsula.imagen || "https://picsum.photos/400/300"} 
                    alt={capsula.Title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 right-4 flex gap-2">
                    {getEstado(capsula) === 'programada' && (
                      <button
                        className="p-2 bg-[#1a1a4a] rounded-full text-[#F5E050] hover:bg-[#3d3d9e]"
                        onClick={e => {
                          e.stopPropagation();
                          handleProtectedAction('editar', capsula);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                    )}
                    {capsula.Creator_User_ID === userId && (
                      <button
                        className="p-2 bg-[#1a1a4a] rounded-full text-red-500 hover:bg-[#3d3d9e]"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(capsula.Capsule_ID);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
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
                    <p className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faBoxArchive} />
                      Categoría: {
                        (capsula.Category && typeof capsula.Category === 'object' && capsula.Category.Name) ||
                        (typeof capsula.Category === 'string' && capsula.Category) ||
                        capsula.Category_Name ||
                        'Sin categoría'
                      }
                    </p>
                    <p className="text-gray-400">{capsula.Content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal de contraseña */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />
    </div>
  );
};

export default MisCapsulas;