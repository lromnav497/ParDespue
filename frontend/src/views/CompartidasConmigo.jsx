import { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBoxArchive, faUsers, faLock, faEye } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const CompartidasConmigo = () => {
  const [capsulas, setCapsulas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    fetch(`/api/recipients/capsule-shared/${user.id}`)
      .then(res => res.json())
      .then(data => setCapsulas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] py-8 animate-fade-in">
      <div className="container mx-auto px-2 md:px-4">
        <h1 className="text-3xl md:text-4xl text-[#F5E050] passero-font mb-8 drop-shadow-lg text-center">
          Cápsulas compartidas conmigo
        </h1>
        {loading ? (
          <div className="text-center text-[#F5E050] py-10 animate-pulse">Cargando...</div>
        ) : capsulas.length === 0 ? (
          <div className="text-center text-gray-300 py-10 animate-fade-in-up">
            No tienes cápsulas compartidas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {capsulas.map(capsula => (
              <div
                key={capsula.Capsule_ID}
                className="bg-[#2E2E7A] rounded-xl p-6 shadow-xl flex flex-col gap-4 animate-fade-in-up hover:scale-105 transition-transform"
              >
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={faBoxArchive} className="text-[#F5E050] text-2xl" />
                  <h2 className="text-xl text-[#F5E050] passero-font">{capsula.Title}</h2>
                </div>
                <div className="text-gray-300">{capsula.Description}</div>
                <div className="flex gap-4 items-center text-sm">
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faUsers} /> Grupo
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faLock} /> {capsula.Privacy === 'group' ? 'Compartida' : capsula.Privacy}
                  </span>
                  <span className="flex items-center gap-1">
                    <FontAwesomeIcon icon={faEye} /> {capsula.RoleName}
                  </span>
                </div>
                <Link
                  to={`/capsulas/${capsula.Capsule_ID}`}
                  className="mt-2 inline-block bg-[#F5E050] text-[#2E2E7A] px-6 py-2 rounded-full font-bold hover:bg-[#e6d047] transition-all shadow"
                >
                  Ver cápsula
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
        `}
      </style>
    </div>
  );
};

export default CompartidasConmigo;