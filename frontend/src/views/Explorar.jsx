import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faHeart, 
  faEye, 
  faClock 
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
  if (capsula.Cover_Image) {
    return capsula.Cover_Image.startsWith('http')
      ? capsula.Cover_Image
      : `http://44.209.31.187:3000/api${capsula.Cover_Image}`;
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
  useEffect(() => {
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
      setCapsulas(data.capsulas || []);
      setTotalPages(data.totalPages || 1);
      setLoading(false);
    };
    fetchCapsulas();
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barra de búsqueda y filtros */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
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
                text-white focus:outline-none focus:border-[#F5E050]"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategory(cat.id)}
                className={`px-4 py-2 rounded-full whitespace-nowrap
                  ${selectedCategory === cat.id 
                    ? 'bg-[#F5E050] text-[#2E2E7A]' 
                    : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e]'
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
        <div className="text-center text-white py-10">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capsulas.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400">No se encontraron cápsulas.</div>
          ) : (
            capsulas.map(capsula => (
              <Link
                key={capsula.id}
                to={`/vercapsula/${capsula.id}`}
                onClick={e => {
                  const ahora = new Date();
                  const apertura = new Date(capsula.fechaApertura);
                  if (apertura > ahora) {
                    e.preventDefault();
                    alert(`Esta cápsula aún no está disponible. Fecha de apertura: ${apertura.toLocaleDateString()}`);
                  }
                }}
                className="bg-[#2E2E7A] rounded-xl overflow-hidden shadow-lg hover:transform hover:scale-105 transition-all block"
                style={{ textDecoration: 'none' }}
              >
                <img 
                  src={getImageUrl(capsula)} 
                  alt={capsula.titulo}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-[#F5E050] passero-font text-xl mb-2">
                    {capsula.titulo}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Por {capsula.autor} ({capsula.email})
                  </p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {capsula.tags?.map(tag => (
                      <span key={tag} className="bg-[#F5E050] text-[#2E2E7A] px-2 py-1 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faHeart} className="mr-1 text-pink-500" />
                        {capsula.likes}
                      </span>
                      <span className="flex items-center">
                        <FontAwesomeIcon icon={faEye} className="mr-1" />
                        {capsula.vistas}
                      </span>
                    </div>
                    <span className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      Se abre: {new Date(capsula.fechaApertura).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Paginación */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => setPage(pageNum)}
            className={`w-10 h-10 rounded-full flex items-center justify-center
              ${pageNum === page
                ? 'bg-[#F5E050] text-[#2E2E7A]'
                : 'bg-[#1a1a4a] text-white hover:bg-[#F5E050] hover:text-[#2E2E7A]'
              }`}
          >
            {pageNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Explorar;