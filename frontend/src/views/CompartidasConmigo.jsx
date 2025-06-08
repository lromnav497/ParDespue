import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faUnlock,
  faLock,
  faBoxArchive,
  faEdit,
  faEye
} from '@fortawesome/free-solid-svg-icons';
import Modal from '../components/modals/Modal';

const CompartidasConmigo = () => {
  const [capsulas, setCapsulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const [plan, setPlan] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  // Obtener el plan del usuario
  useEffect(() => {
    const fetchPlan = async () => {
      const token = localStorage.getItem('token') || user?.token;
      if (!token) return setPlan(null);
      try {
        const res = await fetch('/api/subscriptions/my-plan', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return setPlan(null);
        const data = await res.json();
        let planName = null;
        if (data.suscripcion && data.suscripcion.nombre) {
          planName = String(data.suscripcion.nombre).toLowerCase();
        } else if (data.plan) {
          planName = String(data.plan).toLowerCase();
        }
        setPlan(planName);
      } catch {
        setPlan(null);
      }
    };
    fetchPlan();
  }, [user]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/recipients/capsule-shared/${userId}`)
      .then(res => res.json())
      .then(data => setCapsulas(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [userId]);

  function getEstado(capsula) {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    if (apertura > ahora) return 'programada';
    return 'abierta';
  }

  // Visual igual que MisCapsulas
  const randomImages = [
    "https://picsum.photos/id/1015/400/300",
    "https://picsum.photos/id/1016/400/300",
    "https://picsum.photos/id/1018/400/300",
    "https://picsum.photos/id/1020/400/300",
    "https://picsum.photos/id/1024/400/300",
    "https://picsum.photos/id/1025/400/300",
    "https://picsum.photos/id/1027/400/300",
    "https://picsum.photos/id/1035/400/300",
    "https://picsum.photos/id/1041/400/300",
    "https://picsum.photos/id/1043/400/300"
  ];
  const usedImages = new Set();
  function getUniqueRandomImage() {
    let available = randomImages.filter(img => !usedImages.has(img));
    if (available.length === 0) {
      usedImages.clear();
      available = [...randomImages];
    }
    const img = available[Math.floor(Math.random() * available.length)];
    usedImages.add(img);
    return img;
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-8 min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-down">
        <h1 className="text-3xl md:text-4xl text-[#F5E050] passero-font drop-shadow-lg text-center md:text-left">
          Cápsulas compartidas conmigo
        </h1>
      </div>
      {loading ? (
        <div className="text-center text-[#F5E050] animate-pulse py-10">Cargando cápsulas...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up">
          {capsulas.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400 animate-fade-in-up">No tienes cápsulas compartidas.</div>
          ) : (
            capsulas.map((capsula, idx) => {
              const ahora = new Date();
              const apertura = new Date(capsula.Opening_Date);
              const disabled = apertura > ahora;
              let imageUrl;
              if (capsula.Cover_Image) {
                imageUrl = capsula.Cover_Image.startsWith('http')
                  ? capsula.Cover_Image
                  : `http://44.209.31.187:3000/api${capsula.Cover_Image}`;
              } else {
                imageUrl = getUniqueRandomImage();
              }
              // Permisos
              const puedeEditar = capsula.RoleName === 'Collaborator' && plan === 'premium';
              return (
                <div
                  key={capsula.Capsule_ID}
                  className={`bg-[#2E2E7A] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-default relative group`}
                  tabIndex={-1}
                >
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={capsula.Title}
                      className={`w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105 ${disabled ? 'opacity-60' : ''}`}
                      draggable={false}
                      style={{ userSelect: 'none', pointerEvents: 'none' }}
                    />
                    {/* Overlay de "No disponible" */}
                    {disabled && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10 select-none pointer-events-none animate-fade-in">
                        <FontAwesomeIcon icon={faLock} className="text-4xl text-[#F5E050] mb-2 animate-bounce-slow" />
                        <span className="text-[#F5E050] text-sm font-bold flex items-center gap-2">
                          No disponible hasta {apertura.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {/* Botones de acción */}
                    <div className="absolute top-4 right-4 flex gap-2 z-30">
                      {capsula.RoleName === 'Collaborator' && plan !== 'premium' && (
                        <span className="bg-yellow-400 text-[#2E2E7A] px-3 py-1 rounded-full font-bold text-xs">
                          Solo premium puede editar
                        </span>
                      )}
                      {puedeEditar && disabled && (
                        <button
                          className="p-2 bg-[#1a1a4a] rounded-full text-[#F5E050] hover:bg-[#3d3d9e] shadow-lg transition-all scale-100 hover:scale-110"
                          style={{ opacity: 1, pointerEvents: 'auto' }}
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/editarcapsula/${capsula.Capsule_ID}`);
                          }}
                          title="Editar"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}
                    </div>
                    {/* Botón invisible para ver la cápsula */}
                    {!disabled && (
                      <button
                        className="absolute inset-0 w-full h-full z-10"
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={e => {
                          e.stopPropagation();
                          navigate(`/vercapsula/${capsula.Capsule_ID}`);
                        }}
                        aria-label="Ver cápsula"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-[#F5E050] passero-font text-xl mb-2 group-hover:underline transition-all">
                      {capsula.Title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faClock} />
                        Creada: {new Date(capsula.Creation_Date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={getEstado(capsula) === 'abierta' ? faUnlock : faClock} />
                        Se abre: {new Date(capsula.Opening_Date).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faBoxArchive} />
                        Categoría: {
                          (capsula.Category && typeof capsula.Category === 'object' && capsula.Category.Name) ||
                          (typeof capsula.Category === 'string' && capsula.Category) ||
                          capsula.Category_Name ||
                          'Sin categoría'
                        }
                      </p>
                      <p className="flex items-center gap-2">
                        <FontAwesomeIcon icon={faEye} />
                        Rol: {capsula.RoleName === 'Collaborator' ? 'Colaborador' : 'Solo lectura'}
                      </p>
                      <p className="text-gray-400">{capsula.Content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, title: '', message: '' })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>
      <style>
        {`
        .animate-fade-in { animation: fadeIn 1s; }
        .animate-fade-in-down { animation: fadeInDown 1s; }
        .animate-fade-in-up { animation: fadeInUp 1s; }
        .animate-bounce-slow { animation: bounce 2s infinite; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1, transform: translateY(0);} }
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

export default CompartidasConmigo;