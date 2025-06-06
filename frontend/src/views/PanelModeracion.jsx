import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

const PanelModeracion = () => {
  const [usuarios, setUsuarios] = useState([]);
  useEffect(() => {
    fetchWithAuth('/api/users/all')
      .then(res => res.json())
      .then(setUsuarios);
  }, []);

  const banear = async (id) => {
    await fetchWithAuth(`/api/users/${id}/ban`, { method: 'PUT' });
    setUsuarios(usuarios => usuarios.map(u => u.User_ID === id ? { ...u, VerificationToken: 'banned' } : u));
  };
  const desbanear = async (id) => {
    await fetchWithAuth(`/api/users/${id}/unban`, { method: 'PUT' });
    setUsuarios(usuarios => usuarios.map(u => u.User_ID === id ? { ...u, VerificationToken: null } : u));
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl mb-4">Panel de Moderación</h1>
      <table className="min-w-full bg-[#2E2E7A] text-white">
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Baneado</th><th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.User_ID}>
              <td>{u.User_ID}</td>
              <td>{u.Name}</td>
              <td>{u.Email}</td>
              <td>{u.Role}</td>
              <td>
                {u.VerificationToken === 'banned' ? 'Sí' : 'No'}
              </td>
              <td>
                {u.VerificationToken === 'banned'
                  ? <button onClick={() => desbanear(u.User_ID)} className="bg-green-600 px-2 py-1 rounded">Desbanear</button>
                  : <button onClick={() => banear(u.User_ID)} className="bg-red-600 px-2 py-1 rounded">Banear</button>
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default PanelModeracion;