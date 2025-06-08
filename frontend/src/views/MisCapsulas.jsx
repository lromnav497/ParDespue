import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <-- Importa useLocation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faEdit, 
  faTrash, 
  faClock, 
  faLock, 
  faUnlock,
  faBoxArchive
} from '@fortawesome/free-solid-svg-icons';
import PasswordModal from '../components/modals/PasswordModal'; // importa el modal
import Modal from '../components/modals/Modal';
import { fetchWithAuth } from '../helpers/fetchWithAuth';
import starIcon from '/icons/star.svg'; // Usa la ruta pública

const NUM_STARS = 24;

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Estrellas flotantes SOLO en el fondo del grid de cápsulas
const FloatingStars = () => (
  <div className="pointer-events-none absolute inset-0 z-0">
    {Array.from({ length: NUM_STARS }).map((_, i) => {
      const top = getRandom(0, 95);
      const left = getRandom(0, 95);
      const size = getRandom(12, 32); // px
      const duration = getRandom(6, 18); // segundos
      const delay = getRandom(0, 12); // segundos
      const moveX = getRandom(-40, 40); // px
      const moveY = getRandom(-40, 40); // px
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

const MisCapsulas = () => {
  const [activeFilter, setActiveFilter] = useState('todas');
  const [capsulas, setCapsulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // { type, capsula }
  const [plan, setPlan] = useState(null);
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const navigate = useNavigate();
  const location = useLocation(); // <-- Hook para leer el state

  // Al montar, si viene filtro en location.state, actívalo
  useEffect(() => {
    if (location.state?.filter) {
      setActiveFilter(location.state.filter);
    }
  }, [location.state]);

  const user = JSON.parse(localStorage.getItem('user')); // Asegúrate que la clave sea 'user'
  const userId = user?.id; // Esto será 8 si el usuario está logueado

  useEffect(() => {
    const fetchCapsulas = async () => {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/api/capsules/user/${userId}`);
        if (!res) return; // Ya redirigió si expiró
        const data = await res.json();
        // Si tu backend responde { capsulas: [...] }
        setCapsulas(Array.isArray(data.capsulas) ? data.capsulas : []);
        // Si responde un array directamente
        setCapsulas(Array.isArray(data) ? data : []);
        console.log('Cápsulas recibidas:', data); // <-- Agrega esto
      } catch (err) {
        setCapsulas([]);
      }
      setLoading(false);
    };
    fetchCapsulas();
  }, [userId]);

  // Efecto para obtener el plan del usuario (igual que en Header)
  useEffect(() => {
    const fetchPlan = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token') || user?.token;
      if (!token) return;
      try {
        const res = await fetch('/api/subscriptions/my-plan', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) return setPlan(null);
        const data = await res.json();
        // Si tu backend devuelve { suscripcion: { nombre: 'premium', ... } }
        if (data.suscripcion && data.suscripcion.nombre) {
          setPlan(
            data.suscripcion.nombre.charAt(0).toUpperCase() +
            data.suscripcion.nombre.slice(1)
          );
        } else if (data.plan) {
          setPlan(
            data.plan.charAt(0).toUpperCase() + data.plan.slice(1)
          );
        } else {
          setPlan(null);
        }
      } catch {
        setPlan(null);
      }
    };
    fetchPlan();
  }, [userId]);

  function getEstado(capsula) {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    if (apertura > ahora) return 'programada';
    return 'abierta';
  }

  const filteredCapsulas = activeFilter === 'todas'
    ? capsulas
    : capsulas.filter(c => getEstado(c) === activeFilter);

  const filtros = [
    { value: 'todas', label: 'Todas' },
    { value: 'abierta', label: 'Abiertas' },
    { value: 'programada', label: 'Programadas' }
  ];

  const handleDelete = async (capsuleId) => {
    setModal({
      open: true,
      title: 'Confirmar eliminación',
      message: (
        <div>
          <div>¿Seguro que quieres eliminar esta cápsula?</div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="bg-gray-700 text-white px-4 py-2 rounded"
              onClick={() => setModal({ open: false, title: '', message: '' })}
            >
              Cancelar
            </button>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={async () => {
                const token = localStorage.getItem('token');
                // Primero elimina los contenidos relacionados
                await fetch(`/api/contents/by-capsule/${capsuleId}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                // Luego sí elimina la cápsula
                const res = await fetch(`/api/capsules/${capsuleId}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (res.ok) {
                  setCapsulas(prev => prev.filter(c => c.Capsule_ID !== capsuleId));
                  setModal({
                    open: true,
                    title: 'Eliminada',
                    message: 'Cápsula eliminada correctamente'
                  });
                  setTimeout(() => setModal({ open: false, title: '', message: '' }), 1500);
                } else {
                  const data = await res.json();
                  setModal({
                    open: true,
                    title: 'Error',
                    message: data.message || 'No se pudo eliminar'
                  });
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </div>
      )
    });
  };

  // Función para verificar contraseña (puedes hacer un endpoint real, aquí es ejemplo)
  const checkPassword = async (capsula, password) => {
    // Simula petición al backend
    const res = await fetch(`/api/capsules/${capsula.Capsule_ID}/check-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid;
  };

  // Handler general para acciones protegidas
  const handleProtectedAction = (type, capsula) => {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    if (type === 'ver' && apertura > ahora) {
      setModal({
        open: true,
        title: 'No disponible',
        message: `Esta cápsula aún no está disponible. Fecha de apertura: ${apertura.toLocaleDateString()}`
      });
      return;
    }
    const user = JSON.parse(localStorage.getItem('user'));
    // Si es privada y no es el creador, no dejar pasar
    if (capsula.Privacy === 'private' && user?.id !== capsula.Creator_User_ID) {
      setModal({
        open: true,
        title: 'Acceso restringido',
        message: 'Solo el creador puede acceder a esta cápsula privada.'
      });
      return;
    }
    // Si tiene contraseña, pide contraseña
    if (capsula.Password) {
      setPendingAction({ type, capsula });
      setShowPasswordModal(true);
      setPasswordError('');
      return;
    }
    // Si no, ejecuta la acción directamente
    ejecutarAccion(type, capsula);
  };

  // Ejecuta la acción después de validar contraseña
  const ejecutarAccion = (type, capsula) => {
    if (type === 'ver') navigate(`/vercapsula/${capsula.Capsule_ID}`);
    if (type === 'editar') navigate(`/editarcapsula/${capsula.Capsule_ID}`);
    if (type === 'eliminar') handleDelete(capsula.Capsule_ID);
  };

  // Cuando el usuario envía la contraseña
  const handlePasswordSubmit = async (password) => {
    const { type, capsula } = pendingAction;
    const ok = await checkPassword(capsula, password);
    if (ok) {
      setShowPasswordModal(false);
      ejecutarAccion(type, capsula);
    } else {
      setPasswordError('Contraseña incorrecta');
    }
  };

  // Efecto para resaltar cápsula si viene de notificación
  useEffect(() => {
    const highlightId = localStorage.getItem('highlight_capsule');
    if (highlightId) {
      setTimeout(() => {
        const el = document.querySelector(`[data-capsule-id="${highlightId}"]`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [filteredCapsulas]);

  useEffect(() => {
    // Quita el highlight después de 2 segundos
    const timer = setTimeout(() => {
      localStorage.removeItem('highlight_capsule');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

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
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 animate-fade-in-down">
        <h1 className="text-3xl md:text-4xl text-[#F5E050] passero-font drop-shadow-lg text-center md:text-left">
          Mis Cápsulas del Tiempo
        </h1>
        <button
          className="bg-[#F5E050] text-[#2E2E7A] px-6 py-3 rounded-full 
            hover:bg-[#e6d047] transition-all flex items-center gap-2 shadow-lg font-bold scale-100 hover:scale-105"
          onClick={() => navigate('/crear-capsula')}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Cápsula
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 md:gap-4 mb-8 overflow-x-auto pb-2 animate-fade-in-up">
        {filtros.map(filtro => (
          <button
            key={filtro.value}
            onClick={() => setActiveFilter(filtro.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all duration-200
              ${activeFilter === filtro.value 
                ? 'bg-[#F5E050] text-[#2E2E7A] scale-105 shadow-lg'
                : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e] hover:scale-105'}`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Grid de cápsulas */}
      {loading ? (
        <div className="text-center text-[#F5E050] animate-pulse py-10">Cargando cápsulas...</div>
      ) : (
        <div className="relative my-8">
          <FloatingStars />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
            {filteredCapsulas.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 animate-fade-in-up">No tienes cápsulas.</div>
            ) : (
              Array.isArray(filteredCapsulas) && filteredCapsulas.map((capsula, idx) => {
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

                // Permisos para editar/eliminar
                const isPremium = plan && plan.toLowerCase() === 'premium';
                const puedeEditar = isPremium && disabled;
                const puedeEliminar = isPremium || !disabled;

                // --- VISUAL: Cápsula espacial ---
                return (
                  <div
                    key={capsula.Capsule_ID}
                    data-capsule-id={capsula.Capsule_ID}
                    className={`relative flex flex-col items-center justify-between overflow-visible transition-all duration-300 group space-capsule-card
                      ${String(capsula.Capsule_ID) === localStorage.getItem('highlight_capsule')
                        ? 'border-4 border-yellow-400 animate-shake'
                        : ''
                      }
                      ${disabled ? 'opacity-60 pointer-events-none select-none' : 'hover:scale-105'}
                    `}
                    tabIndex={-1}
                  >
                    {/* Cuerpo de la cápsula espacial */}
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
                          <p className="text-gray-400">{capsula.Content}</p>
                        </div>
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2 justify-center">
                          {capsula.Tags?.map(tag => (
                            <span key={tag} className="bg-[#F5E050] text-[#2E2E7A] px-2 py-0.5 rounded text-xs animate-fade-in">{tag}</span>
                          ))}
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
                        {disabled && isPremium && (
                          <>
                            <button
                              className="p-2 bg-[#1a1a4a] rounded-full text-[#F5E050] hover:bg-[#3d3d9e] shadow-lg transition-all scale-100 hover:scale-110"
                              style={{ opacity: 1, pointerEvents: 'auto' }}
                              onClick={e => {
                                e.stopPropagation();
                                handleProtectedAction('editar', capsula);
                              }}
                              title="Editar"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button
                              className="p-2 bg-[#1a1a4a] rounded-full text-red-500 hover:bg-[#3d3d9e] shadow-lg transition-all scale-100 hover:scale-110"
                              style={{ opacity: 1, pointerEvents: 'auto' }}
                              onClick={e => {
                                e.stopPropagation();
                                handleDelete(capsula.Capsule_ID);
                              }}
                              title="Eliminar"
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </>
                        )}
                        {!disabled && capsula.Creator_User_ID === userId && (
                          <button
                            className="p-2 bg-[#1a1a4a] rounded-full text-red-500 hover:bg-[#3d3d9e] shadow-lg transition-all scale-100 hover:scale-110"
                            style={{ opacity: 1, pointerEvents: 'auto' }}
                            onClick={e => {
                              e.stopPropagation();
                              handleDelete(capsula.Capsule_ID);
                            }}
                            title="Eliminar"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        )}
                      </div>
                      {/* Botón invisible para ver la cápsula */}
                      {(!disabled || isPremium) && (
                        <button
                          className="absolute inset-0 w-full h-full z-10"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                          onClick={e => {
                            e.stopPropagation();
                            handleProtectedAction('ver', capsula);
                            if (String(capsula.Capsule_ID) === localStorage.getItem('highlight_capsule')) {
                              localStorage.removeItem('highlight_capsule');
                            }
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

      {/* Modal de contraseña */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />

      {/* Modal general */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, title: '', message: '' })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>

      {/* Animaciones */}
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
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          100% { transform: rotate(360deg);}
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
        .animate-shake {
          animation: shake 0.7s;
          box-shadow: 0 0 0 4px #F5E050;
          z-index: 10;
        }
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
      `}
      </style>
    </div>
  );
};

export default MisCapsulas;