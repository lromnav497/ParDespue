import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

const TodasLasCapsulas = () => {
  const [capsulas, setCapsulas] = useState([]);
  useEffect(() => {
    fetchWithAuth('/api/capsules/all')
      .then(res => res.json())
      .then(setCapsulas);
  }, []);
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl mb-4">Todas las cápsulas</h1>
      <table className="min-w-full bg-[#2E2E7A] text-white">
        <thead>
          <tr>
            <th>ID</th><th>Título</th><th>Creador</th><th>Email</th><th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          {capsulas.map(c => (
            <tr key={c.Capsule_ID}>
              <td>{c.Capsule_ID}</td>
              <td>{c.Title}</td>
              <td>{c.CreatorName}</td>
              <td>{c.CreatorEmail}</td>
              <td>{new Date(c.Creation_Date).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
export default TodasLasCapsulas;