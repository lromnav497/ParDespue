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
    <div className="container mx-auto p-8">
      <h1 className="text-2xl mb-4">Todas las cápsulas</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-2 md:gap-4 items-center">
        <input
          type="text"
          placeholder="Buscar por título o descripción..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="px-3 py-2 rounded border border-gray-300 text-black w-full md:w-1/3"
        />
        {loading && <span className="text-[#F5E050]">Cargando...</span>}
      </div>
      {error && (
        <div className="mb-4 text-red-400 font-bold">{error}</div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-[#2E2E7A] text-white text-xs">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Creación</th>
              <th>Apertura</th>
              <th>Privacidad</th>
              <th>Password</th>
              <th>Creador ID</th>
              <th>Tags</th>
              <th>Categoría ID</th>
              <th>Portada (URL)</th>
              <th>Vistas</th>
              <th>Likes</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {capsulasFiltradas.length > 0 ? (
              capsulasFiltradas.map(c => (
                <tr key={c.Capsule_ID}>
                  <td>{c.Capsule_ID}</td>
                  <td>{c.Title}</td>
                  <td>{c.Description}</td>
                  <td>{c.Creation_Date ? new Date(c.Creation_Date).toLocaleString() : ''}</td>
                  <td>{c.Opening_Date ? new Date(c.Opening_Date).toLocaleString() : ''}</td>
                  <td>{c.Privacy}</td>
                  <td>{c.Password}</td>
                  <td>{c.Creator_User_ID}</td>
                  <td>{c.Tags}</td>
                  <td>{c.Category_ID}</td>
                  <td style={{ maxWidth: 120, wordBreak: 'break-all' }}>
                    {c.Cover_Image || 'Sin imagen'}
                  </td>
                  <td>{c.Views}</td>
                  <td>{c.Likes}</td>
                  <td>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded mr-2"
                      onClick={() => window.location.href = `/editarcapsula/${c.Capsule_ID}`}
                      title="Editar"
                    >
                      Editar
                    </button>
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
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
                <td colSpan={14} className="text-center">
                  {error ? 'No tienes permisos o ha ocurrido un error.' : 'No hay cápsulas.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodasLasCapsulas;