import { useEffect, useState } from 'react';

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/notifications/all', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setNotificaciones);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] animate-fade-in">
      <h2 className="text-2xl md:text-3xl text-[#F5E050] mb-8 passero-font text-center animate-fade-in-down drop-shadow-lg">
        Bandeja de Notificaciones
      </h2>
      {notificaciones.length === 0 ? (
        <div className="text-center text-gray-300 animate-fade-in-up">No tienes notificaciones.</div>
      ) : (
        <ul className="space-y-6 max-w-2xl mx-auto animate-fade-in-up">
          {notificaciones.map(n => (
            <li
              key={n.Notification_ID}
              className="bg-[#1a1a4a] p-6 rounded-xl shadow-lg border-l-4 border-[#F5E050] transition-transform duration-200 hover:scale-[1.02] group relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="w-3 h-3 rounded-full bg-[#F5E050] animate-bounce-slow"></span>
                <div className="font-bold text-white group-hover:text-[#F5E050] transition-colors">{n.Message}</div>
              </div>
              <div className="text-xs text-gray-400 mb-2">{new Date(n.Sent_Date).toLocaleString()}</div>
              {n.Capsule_ID && (
                <button
                  className="mt-2 bg-[#F5E050] text-[#2E2E7A] px-5 py-2 rounded-full font-bold hover:bg-[#e6d047] transition-all shadow group-hover:scale-105"
                  onClick={() => {
                    localStorage.setItem('highlight_capsule', n.Capsule_ID);
                    window.location.href = '/capsulas';
                  }}
                >
                  Ver cápsula
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
};

export default Notificaciones;