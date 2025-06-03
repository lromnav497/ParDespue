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
    <div className="container mx-auto px-4 py-8 text-white">
      <h2 className="text-2xl text-[#F5E050] mb-6">Bandeja de Notificaciones</h2>
      {notificaciones.length === 0 ? (
        <div>No tienes notificaciones.</div>
      ) : (
        <ul className="space-y-4">
          {notificaciones.map(n => (
            <li key={n.Notification_ID} className="bg-[#1a1a4a] p-4 rounded-lg">
              <div className="font-bold">{n.Message}</div>
              <div className="text-xs text-gray-400">{new Date(n.Sent_Date).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notificaciones;