import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faHeart, 
  faEye, 
  faClock,
  faLock
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const categorias = [
  { id: 'todas', nombre: 'Todas' },
  { id: 'Family', nombre: 'Familia' },
  { id: 'Travel', nombre: 'Viajes' },
  { id: 'Events', nombre: 'Eventos' },
  { id: 'Memories', nombre: 'Memorias' },
  { id: 'Others', nombre: 'Otros' }
];

const PAGE_SIZE = 9;

function getImageUrl(capsula) {
  if (capsula.cover_image) {
    return capsula.cover_image.startsWith('http')
      ? capsula.cover_image
      : `http://44.209.31.187:3000/api${capsula.cover_image}`;
  } else {
    // Imagen por defecto si no hay portada
    return "https://picsum.photos/400/300";
  }
}

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [capsulas, setCapsulas] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch cápsulas públicas con filtros y paginación
  const fetchCapsulas = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page,
      pageSize: PAGE_SIZE,
      category: selectedCategory !== 'todas' ? selectedCategory : '',
      search: searchTerm
    });
    const res = await fetch(`/api/capsules/public?${params.toString()}`);
    const data = await res.json();
    console.log(data.capsulas); // <-- Añade esto
    setCapsulas(data.capsulas || []);
    setTotalPages(data.totalPages || 1);
    setLoading(false);
  };

  useEffect(() => {
    fetchCapsulas();
  }, [searchTerm, selectedCategory, page]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCapsulas();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [searchTerm, selectedCategory, page]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchCapsulas();
    }, 20000); // cada 20 segundos

    return () => clearInterval(intervalId);
  }, [searchTerm, selectedCategory, page]);

  // Handler para el buscador
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Handler para filtro de categoría
  const handleCategory = (catId) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'administrator';

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] animate-fade-in">
      {/* Barra de búsqueda y filtros */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center animate-fade-in-down">
          <div className="relative w-full md:w-96">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar por título, usuario, email, tags, fecha..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg 
                text-white focus:outline-none focus:border-[#F5E050] shadow-inner focus:shadow-[#F5E050]/20 transition-all duration-200"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-200
                  ${selectedCategory === cat.id 
                    ? 'bg-[#F5E050] text-[#2E2E7A] scale-105 shadow-lg'
                    : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e] hover:scale-105'
                  }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de cápsulas */}
      {loading ? (
        <div className="text-center text-white py-10 animate-pulse">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {capsulas.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 animate-fade-in-up">No se encontraron cápsulas.</div>
          ) : (
            capsulas.map(capsula => {
              const ahora = new Date();
              const apertura = new Date(capsula.fechaApertura);
              const disabled = apertura > ahora;
              const isPremium = user?.premium;
              const puedeEditar = (isPremium && disabled) || isAdmin;
              const puedeEliminar = isPremium || !disabled || isAdmin;
              
              return (
                <div
                  key={capsula.id}
                  className={`relative bg-[#2E2E7A] rounded-xl overflow-hidden shadow-xl transition-all duration-300 block group
                    ${disabled ? 'opacity-60 pointer-events-none select-none' : 'hover:scale-105'}
                  `}
                  style={{ textDecoration: 'none' }}
                >
                  <Link
                    to={`/vercapsula/${capsula.id}`}
                    tabIndex={disabled ? -1 : 0}
                    aria-disabled={disabled}
                    style={{ pointerEvents: disabled ? 'none' : 'auto' }}
                  >
                    <div className="relative">
                      <img 
                        src={getImageUrl(capsula)} 
                        alt={capsula.titulo}
                        className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {disabled && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 animate-fade-in">
                          <FontAwesomeIcon icon={faLock} className="text-4xl text-[#F5E050] mb-2 animate-bounce-slow" />
                          <span className="text-[#F5E050] text-sm font-bold flex items-center gap-2">
                            No disponible hasta {apertura.toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-[#F5E050] passero-font text-xl mb-2 group-hover:underline transition-all">
                        {capsula.titulo}
                      </h3>
                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">{capsula.descripcion}</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {capsula.tags?.map(tag => (
                          <span key={tag} className="bg-[#F5E050] text-[#2E2E7A] px-2 py-1 rounded text-xs animate-fade-in">{tag}</span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                        <span className="bg-[#3d3d9e] text-white px-2 py-1 rounded">{capsula.categoria}</span>
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faHeart} className="mr-1 text-pink-500 animate-fade-in" />
                            {capsula.likes ?? capsula.Likes ?? 0}
                          </span>
                          <span className="flex items-center">
                            <FontAwesomeIcon icon={faEye} className="mr-1 animate-fade-in" />
                            {capsula.views ?? capsula.Views ?? 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>
                          Creada: {new Date(capsula.fechaCreacion).toLocaleDateString()}
                        </span>
                        <span>
                          Se abre: {apertura.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-[#F5E050] font-semibold">
                        Creador: {capsula.autor || 'Desconocido'}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Paginación */}
      <div className="mt-8 flex justify-center gap-2 animate-fade-in-up">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-200
              ${pageNum === page
                ? 'bg-[#F5E050] text-[#2E2E7A] scale-110 shadow-lg'
                : 'bg-[#1a1a4a] text-white hover:bg-[#F5E050] hover:text-[#2E2E7A] hover:scale-105'
              }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
};

export default Explorar;