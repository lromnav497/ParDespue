import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

const TodasLasCapsulas = () => {
  const [capsulas, setCapsulas] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
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
      });
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl mb-4">Todas las cápsulas</h1>
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
              <th>Portada</th>
              <th>Vistas</th>
              <th>Likes</th>
            </tr>
          </thead>
          <tbody>
            {capsulas.length > 0 ? (
              capsulas.map(c => (
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
                  <td>
                    {c.Cover_Image ? (
                      <img src={c.Cover_Image} alt="Portada" style={{ width: 40, height: 40, objectFit: 'cover' }} />
                    ) : 'Sin imagen'}
                  </td>
                  <td>{c.Views}</td>
                  <td>{c.Likes}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="text-center">
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