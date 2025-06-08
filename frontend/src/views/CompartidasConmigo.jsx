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
import starIcon from '/icons/star.svg'; // Usa la ruta pública

const NUM_STARS = 20;
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}
const FloatingStars = () => (
  <div className="pointer-events-none absolute inset-0 z-0">
    {Array.from({ length: NUM_STARS }).map((_, i) => {
      const top = getRandom(0, 95);
      const left = getRandom(0, 95);
      const size = getRandom(12, 32);
      const duration = getRandom(6, 18);
      const delay = getRandom(0, 12);
      const moveX = getRandom(-40, 40);
      const moveY = getRandom(-40, 40);
      return (
        <img
          key={i}
          src={starIcon}
          alt=""
          className="absolute opacity-70 animate-star-float"
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
            '--move-x': `${moveX}px`,
            '--move-y': `${moveY}px`,
            zIndex: 1,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 0 6px #F5E050)'
          }}
        />
      );
    })}
  </div>
);

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
        <div className="relative my-8">
          <FloatingStars />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
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
                const puedeEditar = capsula.RoleName === 'Collaborator' && plan === 'premium';
                // --- VISUAL: Cápsula espacial ---
                return (
                  <div
                    key={capsula.Capsule_ID}
                    className={`relative flex flex-col items-center justify-between overflow-visible transition-all duration-300 group space-capsule-card
                      ${disabled ? 'opacity-60 pointer-events-none select-none' : 'hover:scale-105'}
                    `}
                    tabIndex={-1}
                  >
                    <div className="relative flex flex-col items-center w-full">
                      {/* Cúpula */}
                      <div className="w-36 h-12 bg-gradient-to-b from-[#F5E050] to-[#3d3d9e] rounded-t-full shadow-lg z-10" />
                      {/* Imagen de portada como ventana grande */}
                      <div className="relative w-36 h-36 flex items-center justify-center -mt-8 z-20">
                        <div className="absolute w-full h-full rounded-full border-4 border-[#F5E050] bg-[#23235b] shadow-inner z-0" />
                        <img
                          src={imageUrl}
                          alt={capsula.Title}
                          className="w-32 h-32 object-cover rounded-full border-2 border-[#3d3d9e] shadow-lg z-10 bg-[#23235b]"
                          style={{ backgroundColor: "#23235b" }}
                        />
                      </div>
                      {/* Cuerpo principal */}
                      <div className="w-44 bg-gradient-to-br from-[#23235b] via-[#2E2E7A] to-[#1a1a4a] border-2 border-[#F5E050] rounded-b-3xl rounded-t-xl shadow-2xl flex flex-col items-center pt-6 pb-6 px-4 relative z-10 -mt-4">
                        <h3 className="text-[#F5E050] passero-font text-lg mb-2 text-center group-hover:underline transition-all">
                          {capsula.Title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-300 text-center">
                          <p className="flex items-center gap-2 justify-center">
                            <FontAwesomeIcon icon={faClock} />
                            Creada: {new Date(capsula.Creation_Date).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-2 justify-center">
                            <FontAwesomeIcon icon={getEstado(capsula) === 'abierta' ? faUnlock : faClock} />
                            Se abre: {new Date(capsula.Opening_Date).toLocaleDateString()}
                          </p>
                          <p className="flex items-center gap-2 justify-center">
                            <FontAwesomeIcon icon={faBoxArchive} />
                            Categoría: {
                              (capsula.Category && typeof capsula.Category === 'object' && capsula.Category.Name) ||
                              (typeof capsula.Category === 'string' && capsula.Category) ||
                              capsula.Category_Name ||
                              'Sin categoría'
                            }
                          </p>
                          <p className="flex items-center gap-2 justify-center">
                            <FontAwesomeIcon icon={faEye} />
                            Rol: {capsula.RoleName === 'Collaborator' ? 'Colaborador' : 'Solo lectura'}
                          </p>
                          <p className="text-gray-400">{capsula.Content}</p>
                        </div>
                      </div>
                      {/* Fuego de propulsión */}
                      <div className="w-16 h-10 bg-gradient-to-b from-[#F5E050] via-[#e6d047] to-transparent rounded-b-full blur-sm opacity-80 animate-capsule-fire -mt-3" />
                      {/* Overlay de bloqueo */}
                      {disabled && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-20 animate-fade-in rounded-b-3xl rounded-t-xl">
                          <FontAwesomeIcon icon={faLock} className="text-3xl text-[#F5E050] mb-2 animate-bounce-slow" />
                          <span className="text-[#F5E050] text-xs font-bold flex items-center gap-2 text-center">
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
                  </div>
                );
              })
            )}
          </div>
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
          .animate-star-float {
            animation-name: starFloat;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
            animation-direction: alternate;
          }
          @keyframes starFloat {
            0% { 
              opacity: 0; 
              transform: translate(0, 0) scale(1) rotate(0deg); 
            }
            10% { opacity: 0.7; }
            40% { opacity: 1; }
            50% { 
              transform: translate(var(--move-x, 0), var(--move-y, 0)) scale(1.1) rotate(10deg); 
              opacity: 0.9; 
            }
            60% { opacity: 1; }
            90% { opacity: 0.7; }
            100% { 
              opacity: 0; 
              transform: translate(0, 0) scale(0.95) rotate(-10deg); 
            }
          }
          .space-capsule-card {
            background: none !important;
            border: none !important;
            box-shadow: none !important;
            min-height: 340px;
            margin-bottom: 10px;
          }
          .animate-capsule-fire {
            animation: capsuleFire 1.2s infinite alternate;
          }
          @keyframes capsuleFire {
            0% { opacity: 0.7; transform: scaleY(1) translateY(0);}
            50% { opacity: 1; transform: scaleY(1.2) translateY(6px);}
            100% { opacity: 0.5; transform: scaleY(0.8) translateY(-2px);}
          }
        `}
      </style>
    </div>
  );
};

export default CompartidasConmigo;