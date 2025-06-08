import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

const TodasLasCapsulas = () => {
  const [capsulas, setCapsulas] = useState([]);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(false);

  // Cargar todas las cápsulas
  const cargarCapsulas = async () => {
    setLoading(true);
    fetchWithAuth('/api/capsules/all')
      .then(async res => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || 'Error al cargar las cápsulas');
          setCapsulas([]);
        } else {
          const data = await res.json();
          setCapsulas(Array.isArray(data) ? data : []);
          setError('');
        }
      })
      .catch(() => {
        setError('No se pudo conectar con el servidor');
        setCapsulas([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarCapsulas();
  }, []);

  // Eliminar cápsula
  const eliminarCapsula = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar esta cápsula?')) return;
    setLoading(true);
    const res = await fetchWithAuth(`/api/capsules/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setCapsulas(capsulas => capsulas.filter(c => c.Capsule_ID !== id));
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.message || 'No se pudo eliminar la cápsula');
    }
    setLoading(false);
  };

  // Buscar cápsulas por título o descripción
  const capsulasFiltradas = capsulas.filter(c =>
    (c.Title || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.Description || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mx-auto px-2 md:px-6 py-8 min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] animate-fade-in">
      <h1 className="text-3xl md:text-4xl text-[#F5E050] passero-font mb-8 text-center animate-fade-in-down drop-shadow-lg">
        Todas las cápsulas
      </h1>
      <div className="mb-6 flex flex-col md:flex-row gap-2 md:gap-4 items-center justify-center animate-fade-in-up">
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="px-4 py-2 rounded-full border border-[#3d3d9e] bg-[#1a1a4a]/80 text-white w-full md:w-1/3 focus:outline-none focus:border-[#F5E050] shadow-inner focus:shadow-[#F5E050]/20 transition-all duration-200"
        />
        {loading && <span className="text-[#F5E050] animate-pulse">Cargando...</span>}
      </div>
      {error && (
        <div className="mb-4 text-red-400 font-bold text-center animate-pulse">{error}</div>
      )}
      <div className="overflow-x-auto animate-fade-in rounded-xl shadow-2xl">
        <table className="min-w-full bg-[#2E2E7A]/90 text-white text-xs md:text-sm rounded-xl shadow-xl overflow-hidden">
          <thead>
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Título</th>
              <th className="px-3 py-2">Descripción</th>
              <th className="px-3 py-2">Creación</th>
              <th className="px-3 py-2">Apertura</th>
              <th className="px-3 py-2">Privacidad</th>
              <th className="px-3 py-2">Password</th>
              <th className="px-3 py-2">Creador</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Portada</th>
              <th className="px-3 py-2">Vistas</th>
              <th className="px-3 py-2">Likes</th>
              <th className="px-3 py-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {capsulasFiltradas.length > 0 ? (
              capsulasFiltradas.map((c, idx) => (
                <tr
                  key={c.Capsule_ID}
                  className="transition-colors duration-200 hover:bg-[#23235b]/80 group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <td className="px-3 py-2">{c.Capsule_ID}</td>
                  <td className="px-3 py-2 font-semibold group-hover:text-[#F5E050] transition">{c.Title}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{c.Description}</td>
                  <td className="px-3 py-2">{c.Creation_Date ? new Date(c.Creation_Date).toLocaleString() : ''}</td>
                  <td className="px-3 py-2">{c.Opening_Date ? new Date(c.Opening_Date).toLocaleString() : ''}</td>
                  <td className="px-3 py-2 capitalize">{c.Privacy}</td>
                  <td className="px-3 py-2">{c.Password ? <span className="text-[#F5E050] font-bold">Sí</span> : 'No'}</td>
                  <td className="px-3 py-2">{c.Creator_User_ID}</td>
                  <td className="px-3 py-2 max-w-[120px] break-words">{c.Tags}</td>
                  <td className="px-3 py-2">{c.Category_ID}</td>
                  <td className="px-3 py-2 max-w-[120px] break-words">
                    {c.Cover_Image
                      ? <img src={c.Cover_Image} alt="Portada" className="w-16 h-10 object-cover rounded shadow-md mx-auto" />
                      : <span className="text-gray-400">Sin imagen</span>
                    }
                  </td>
                  <td className="px-3 py-2">{c.Views}</td>
                  <td className="px-3 py-2">{c.Likes}</td>
                  <td className="px-3 py-2 flex flex-col md:flex-row gap-2 items-center justify-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-full transition-all duration-200 shadow focus:ring-2 focus:ring-blue-400 focus:outline-none scale-100 hover:scale-105 animate-bounce-slow"
                      onClick={() => window.location.href = `/editarcapsula/${c.Capsule_ID}`}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded-full transition-all duration-200 shadow focus:ring-2 focus:ring-red-400 focus:outline-none scale-100 hover:scale-105 animate-shake"
                      onClick={() => eliminarCapsula(c.Capsule_ID)}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={14} className="text-center py-8">
                  {error ? 'No tienes permisos o ha ocurrido un error.' : 'No hay cápsulas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 0.7s; }
          .animate-bounce-slow { animation: bounce 2.5s infinite; }
          .animate-shake:active { animation: shake 0.5s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-8px); }
            80% { transform: translateX(8px); }
            100% { transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
};

export default TodasLasCapsulas;