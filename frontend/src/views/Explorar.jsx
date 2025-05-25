import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faSearch, 
  faFilter, 
  faHeart, 
  faEye, 
  faClock 
} from '@fortawesome/free-solid-svg-icons';

const Explorar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  // Datos de ejemplo - Reemplazar con datos reales de la API
  const capsulas = [
    {
      id: 1,
      titulo: "Memorias de 2023",
      autor: "Juan Pérez",
      categoria: "recuerdos",
      fechaApertura: "2025-01-01",
      likes: 156,
      vistas: 302,
      imagen: "https://picsum.photos/400/300"
    },
    // ... más cápsulas
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas' },
    { id: 'recuerdos', nombre: 'Recuerdos' },
    { id: 'mensajes', nombre: 'Mensajes' },
    { id: 'celebraciones', nombre: 'Celebraciones' },
    { id: 'legados', nombre: 'Legados' }
  ];

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
              placeholder="Buscar cápsulas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg 
                text-white focus:outline-none focus:border-[#F5E050]"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {capsulas.map(capsula => (
          <div 
            key={capsula.id}
            className="bg-[#2E2E7A] rounded-xl overflow-hidden shadow-lg hover:transform hover:scale-105 transition-all"
          >
            <img 
              src={capsula.imagen} 
              alt={capsula.titulo}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-[#F5E050] passero-font text-xl mb-2">
                {capsula.titulo}
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Por {capsula.autor}
              </p>
              
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
          </div>
        ))}
      </div>

      {/* Paginación */}
      <div className="mt-8 flex justify-center gap-2">
        {[1, 2, 3, 4, 5].map(page => (
          <button
            key={page}
            className="w-10 h-10 rounded-full flex items-center justify-center
              bg-[#1a1a4a] text-white hover:bg-[#F5E050] hover:text-[#2E2E7A]"
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Explorar;