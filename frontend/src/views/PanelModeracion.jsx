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
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gradient-to-br from-[#23235b] via-[#2E2E7A] to-[#1a1a4a] animate-fade-in">
      <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-[#F5E050] drop-shadow animate-fade-in-down">
        Panel de Moderación
      </h1>
      <div className="overflow-x-auto rounded-xl shadow-2xl bg-[#2E2E7A] animate-fade-in-up">
        <table className="min-w-full divide-y divide-[#3d3d9e]">
          <thead className="bg-[#23235b]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#F5E050] uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#F5E050] uppercase tracking-wider">Nombre</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#F5E050] uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#F5E050] uppercase tracking-wider">Rol</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-[#F5E050] uppercase tracking-wider">Baneado</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-[#F5E050] uppercase tracking-wider">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#3d3d9e]">
            {usuarios.map((u, idx) => (
              <tr
                key={u.User_ID}
                className="hover:bg-[#23235b] transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <td className="px-4 py-3">{u.User_ID}</td>
                <td className="px-4 py-3">{u.Name}</td>
                <td className="px-4 py-3 break-all">{u.Email}</td>
                <td className="px-4 py-3">{u.Role}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold transition-all duration-300
                    ${u.VerificationToken === 'banned'
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-green-600 text-white'}`}>
                    {u.VerificationToken === 'banned' ? 'Sí' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {u.VerificationToken === 'banned'
                    ? (
                      <button
                        onClick={() => desbanear(u.User_ID)}
                        className="bg-green-500 hover:bg-green-400 text-white px-3 py-1 rounded-full shadow transition-all duration-200 animate-bounce-slow"
                      >
                        Desbanear
                      </button>
                    )
                    : (
                      <button
                        onClick={() => banear(u.User_ID)}
                        className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-full shadow transition-all duration-200 animate-bounce-slow"
                      >
                        Banear
                      </button>
                    )
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 0.8s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-8px);}
          }
        `}
      </style>
    </div>
  );
};
export default PanelModeracion;