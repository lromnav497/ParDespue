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
import starIcon from '/icons/star.svg'; // Usa la ruta pública
import galaxyIcon from '/icons/galaxy.svg'; // Agrega la galaxia

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

// Estrellas y galaxias flotantes SOLO en el fondo del grid de cápsulas
const NUM_STARS = 24;
const NUM_GALAXIES = 8;

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Estrellas flotantes SOLO en el fondo del grid de cápsulas
const FloatingStars = () => (
  <div className="pointer-events-none absolute inset-0 z-0">
    {/* Estrellas */}
    {Array.from({ length: NUM_STARS }).map((_, i) => {
      const top = getRandom(0, 95);
      const left = getRandom(0, 95);
      const size = getRandom(12, 32); // px
      const duration = getRandom(6, 18); // segundos
      const delay = getRandom(0, 12); // segundos
      const moveX = getRandom(-40, 40); // px
      const moveY = getRandom(-40, 40); // px
      // Aleatorio: blanco o dorado
      const isGold = Math.random() < 0.5;
      const filter = isGold
        ? 'drop-shadow(0 0 8px #F5E050) brightness(1.2) sepia(1) hue-rotate(10deg) saturate(2)'
        : 'drop-shadow(0 0 8px #fff) brightness(2)';
      return (
        <img
          key={`star-${i}`}
          src={starIcon}
          alt=""
          className="absolute opacity-80 animate-star-float"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            '--move-x': `${moveX}px`,
            '--move-y': `${moveY}px`,
            zIndex: 1,
            pointerEvents: 'none',
            filter
          }}
        />
      );
    })}
    {/* Galaxias */}
    {Array.from({ length: NUM_GALAXIES }).map((_, i) => {
      const top = getRandom(0, 95);
      const left = getRandom(0, 95);
      const size = getRandom(32, 56); // px
      const duration = getRandom(12, 28); // segundos
      const delay = getRandom(0, 16); // segundos
      const moveX = getRandom(-60, 60); // px
      const moveY = getRandom(-60, 60); // px
      // Aleatorio: blanco o dorado
      const isGold = Math.random() < 0.5;
      const filter = isGold
        ? 'drop-shadow(0 0 16px #F5E050) brightness(1.2) sepia(1) hue-rotate(10deg) saturate(2)'
        : 'drop-shadow(0 0 16px #fff) brightness(2)';
      return (
        <img
          key={`galaxy-${i}`}
          src={galaxyIcon}
          alt=""
          className="absolute opacity-60 animate-star-float"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            '--move-x': `${moveX}px`,
            '--move-y': `${moveY}px`,
            zIndex: 1,
            pointerEvents: 'none',
            filter
          }}
        />
      );
    })}
  </div>
);

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [capsulas, setCapsulas] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch cápsulas públicas with filters and pagination
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
      {/* Fondo estrellado */}
      <FloatingStars />
      <div className="relative z-10">
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
          <div className="relative my-8">
            <FloatingStars />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
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
                  
                  // NUEVO DISEÑO DE CÁPSULA ESPACIAL
                  return (
                    <div
                      key={capsula.id}
                      className={`relative flex flex-col items-center justify-between overflow-visible transition-all duration-300 group space-capsule-card
                        ${disabled ? 'opacity-60 pointer-events-none select-none' : 'hover:scale-105'}
                      `}
                      style={{ textDecoration: 'none' }}
                    >
                      <Link
                        to={`/vercapsula/${capsula.id}`}
                        tabIndex={disabled ? -1 : 0}
                        aria-disabled={disabled}
                        style={{ pointerEvents: disabled ? 'none' : 'auto', width: '100%' }}
                      >
                        {/* Cuerpo de la cápsula espacial */}
                        <div className="relative flex flex-col items-center w-full">
                          {/* Cúpula */}
                          <div className="w-36 h-12 bg-gradient-to-b from-[#F5E050] to-[#3d3d9e] rounded-t-full shadow-lg z-10" />
                          {/* Imagen de portada como ventana grande */}
                          <div className="relative w-36 h-36 flex items-center justify-center -mt-8 z-20">
                            {/* Fondo circular detrás de la imagen */}
                            <div className="absolute w-full h-full rounded-full border-4 border-[#F5E050] bg-[#23235b] shadow-inner z-0" />
                            <img
                              src={getImageUrl(capsula)}
                              alt={capsula.titulo}
                              className="w-32 h-32 object-cover rounded-full border-2 border-[#3d3d9e] shadow-lg z-10 bg-[#23235b]"
                              style={{ backgroundColor: "#23235b" }}
                            />
                          </div>
                          {/* Cuerpo principal */}
                          <div className="w-44 bg-gradient-to-br from-[#23235b] via-[#2E2E7A] to-[#1a1a4a] border-2 border-[#F5E050] rounded-b-3xl rounded-t-xl shadow-2xl flex flex-col items-center pt-6 pb-6 px-4 relative z-10 -mt-4">
                            <h3 className="text-[#F5E050] passero-font text-lg mb-2 text-center group-hover:underline transition-all">
                              {capsula.titulo}
                            </h3>
                            <p className="text-gray-300 text-sm mb-2 line-clamp-2 text-center">{capsula.descripcion}</p>
                            <div className="flex flex-wrap gap-1 mb-2 justify-center">
                              {capsula.tags?.map(tag => (
                                <span key={tag} className="bg-[#F5E050] text-[#2E2E7A] px-2 py-0.5 rounded text-xs animate-fade-in">{tag}</span>
                              ))}
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-400 w-full mb-2">
                              <span className="bg-[#3d3d9e] text-white px-2 py-0.5 rounded">{capsula.categoria}</span>
                              <span className="flex items-center">
                                <FontAwesomeIcon icon={faHeart} className="mr-1 text-pink-500 animate-fade-in" />
                                {capsula.likes ?? capsula.Likes ?? 0}
                              </span>
                              <span className="flex items-center">
                                <FontAwesomeIcon icon={faEye} className="mr-1 animate-fade-in" />
                                {capsula.views ?? capsula.Views ?? 0}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400 w-full">
                              <span>
                                {new Date(capsula.fechaCreacion).toLocaleDateString()}
                              </span>
                              <span>
                                {apertura.toLocaleDateString()}
                              </span>
                            </div>
                            <div className="mt-2 text-xs text-[#F5E050] font-semibold text-center">
                              {capsula.autor || 'Desconocido'}
                            </div>
                          </div>
                          {/* Fuego de propulsión */}
                          <div className="w-16 h-10 bg-gradient-to-b from-[#F5E050] via-[#e6d047] to-transparent rounded-b-full blur-sm opacity-80 animate-capsule-fire -mt-3" />
                        </div>
                        {/* Overlay de bloqueo */}
                        {disabled && (
                          <div
                            className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-20 animate-fade-in rounded-b-3xl rounded-t-xl pointer-events-none"
                            style={{
                              pointerEvents: 'none',
                              borderRadius: '1.5rem 1.5rem 1.5rem 1.5rem / 2.5rem 2.5rem 1.5rem 1.5rem'
                            }}
                          >
                            <FontAwesomeIcon icon={faLock} className="text-3xl text-[#F5E050] mb-2 animate-bounce-slow" />
                            <span className="text-[#F5E050] text-xs font-bold flex items-center gap-2 text-center">
                              No disponible hasta {apertura.toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                })
              )}
            </div>
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
          .animate-star-float {
            animation-name: starFloat;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
            animation-direction: alternate;
          }
          @keyframes starFloat {
            0% { 
              opacity: 0; 
              transform: translate(0, 0) scale(1) rotate(0deg); 
            }
            10% { opacity: 0.7; }
            40% { opacity: 1; }
            50% { 
              transform: translate(var(--move-x, 0), var(--move-y, 0)) scale(1.1) rotate(10deg); 
              opacity: 0.9; 
            }
            60% { opacity: 1; }
            90% { opacity: 0.7; }
            100% { 
              opacity: 0; 
              transform: translate(0, 0) scale(0.95) rotate(-10deg); 
            }
          }
          .animate-spin-slow {
            animation: spin 8s linear infinite;
          }
          @keyframes spin {
            100% { transform: rotate(360deg);}
          }
          .space-capsule-card {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            min-height: 340px;
            margin-bottom: 10px;
          }
          .animate-capsule-fire {
            animation: capsuleFire 1.2s infinite alternate;
          }
          @keyframes capsuleFire {
            0% { opacity: 0.7; transform: scaleY(1) translateY(0);}
            50% { opacity: 1; transform: scaleY(1.2) translateY(6px);}
            100% { opacity: 0.5; transform: scaleY(0.8) translateY(-2px);}
          }
        `}
      </style>
    </div>
  );
};

export default Explorar;