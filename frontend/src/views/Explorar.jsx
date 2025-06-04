// filepath: d:\xampp\htdocs\DES\ParDespue\frontend\src\views\Explorar.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth } from '../helpers/fetchWithAuth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const Explorar = () => {
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('todas');
  const [categories, setCategories] = useState(['todas', 'familia', 'viajes', 'trabajo', 'amigos']); // Add more categories as needed

  useEffect(() => {
    const fetchCapsules = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth('/api/capsules/public');
        const data = await res.json();
        setCapsules(data.capsulas);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchCapsules();
  }, []);

  const filteredCapsules = capsules.filter(capsule => {
    const matchesCategory = activeCategory === 'todas' || capsule.Category?.Name === activeCategory;
    const matchesSearch = (
      capsule.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capsule.Tags.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capsule.Creator_User_ID.toString().includes(searchTerm) // Assuming Creator_User_ID is a string
    );
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl text-[#F5E050] passero-font mb-6">Explorar Cápsulas</h1>

      {/* Search Bar */}
      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Buscar por título, usuario, etiquetas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow p-2 border border-gray-300 rounded-l"
        />
        <button className="bg-[#F5E050] text-[#2E2E7A] px-4 rounded-r">
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-full whitespace-nowrap
              ${activeCategory === category 
                ? 'bg-[#F5E050] text-[#2E2E7A]' 
                : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e]'}`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid of Capsules */}
      {loading ? (
        <div className="text-center text-[#F5E050]">Cargando cápsulas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsules.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400">No hay cápsulas que coincidan con tu búsqueda.</div>
          ) : (
            filteredCapsules.map(capsule => (
              <div key={capsule.Capsule_ID} className="bg-[#2E2E7A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer">
                <img 
                  src={capsule.Cover_Image || 'https://picsum.photos/400/300'} // Fallback image
                  alt={capsule.Title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-[#F5E050] passero-font text-xl mb-2">{capsule.Title}</h3>
                  <p className="text-gray-300">{capsule.Description}</p>
                  <p className="text-gray-400">Creada: {new Date(capsule.Creation_Date).toLocaleDateString()}</p>
                  <p className="text-gray-400">Se abre: {new Date(capsule.Opening_Date).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Explorar;