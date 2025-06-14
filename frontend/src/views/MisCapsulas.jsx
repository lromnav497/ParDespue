import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Hook para navegación y lectura de estado de la ruta
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
import PasswordModal from '../components/modals/PasswordModal'; // Modal para pedir contraseña
import Modal from '../components/modals/Modal'; // Modal genérico para mensajes
import { fetchWithAuth } from '../helpers/fetchWithAuth'; // Helper para peticiones autenticadas
import starIcon from '/icons/star.svg'; // Icono de estrella para animación de fondo

// Número de estrellas flotantes en el fondo
const NUM_STARS = 20;

// Función auxiliar para obtener un número aleatorio entre min y max
function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

// Componente de estrellas flotantes animadas de fondo
const FloatingStars = () => (
  <div className="pointer-events-none absolute inset-0 z-0">
    {Array.from({ length: NUM_STARS }).map((_, i) => {
      // Calcula posición, tamaño y animación aleatoria para cada estrella
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

const MisCapsulas = () => {
  // Estado para el filtro activo (todas, abiertas, programadas)
  const [activeFilter, setActiveFilter] = useState('todas');
  // Estado para la lista de cápsulas del usuario
  const [capsulas, setCapsulas] = useState([]);
  // Estado de carga
  const [loading, setLoading] = useState(true);
  // Estado para mostrar el modal de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  // Estado para mostrar error de contraseña
  const [passwordError, setPasswordError] = useState('');
  // Estado para guardar la acción pendiente (ver, editar, eliminar) y la cápsula asociada
  const [pendingAction, setPendingAction] = useState(null); // { type, capsula }
  // Estado para el plan del usuario (premium, básico, etc)
  const [plan, setPlan] = useState(null);
  // Estado para el modal general (confirmaciones, errores, etc)
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  // Hook para navegación programática
  const navigate = useNavigate();
  // Hook para leer el estado de la ruta (por ejemplo, para resaltar una cápsula)
  const location = useLocation();

  // Al montar, si viene filtro en location.state, actívalo
  useEffect(() => {
    if (location.state?.filter) {
      setActiveFilter(location.state.filter);
    }
  }, [location.state]);

  // Obtiene el usuario actual desde localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user?.id;

  // Efecto para cargar las cápsulas del usuario al montar o cambiar userId
  useEffect(() => {
    const fetchCapsulas = async () => {
      setLoading(true);
      try {
        // Obtiene las cápsulas del usuario autenticado
        const res = await fetchWithAuth(`/api/capsules/user/${userId}`);
        if (!res) return; // Si expiró el token, ya redirigió
        const data = await res.json();
        setCapsulas(data);
        console.log('Cápsulas recibidas:', data); // Debug
      } catch (err) {
        setCapsulas([]);
      }
      setLoading(false);
    };
    fetchCapsulas();
  }, [userId]);

  // Efecto para obtener el plan del usuario (premium, básico, etc)
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
        // Normaliza el nombre del plan según la respuesta del backend
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

  // Determina el estado de la cápsula (abierta o programada)
  function getEstado(capsula) {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    if (apertura > ahora) return 'programada';
    return 'abierta';
  }

  // Filtra las cápsulas según el filtro activo
  const filteredCapsulas = activeFilter === 'todas'
    ? capsulas
    : capsulas.filter(c => getEstado(c) === activeFilter);

  // Opciones de filtro para mostrar en la UI
  const filtros = [
    { value: 'todas', label: 'Todas' },
    { value: 'abierta', label: 'Abiertas' },
    { value: 'programada', label: 'Programadas' }
  ];

  // Maneja la eliminación de una cápsula (con confirmación)
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
                // Elimina primero los contenidos relacionados
                await fetch(`/api/contents/by-capsule/${capsuleId}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                // Luego elimina la cápsula
                const res = await fetch(`/api/capsules/${capsuleId}`, {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });
                if (res.ok) {
                  // Si se eliminó correctamente, actualiza la lista y muestra mensaje
                  setCapsulas(prev => prev.filter(c => c.Capsule_ID !== capsuleId));
                  setModal({
                    open: true,
                    title: 'Eliminada',
                    message: 'Cápsula eliminada correctamente'
                  });
                  setTimeout(() => setModal({ open: false, title: '', message: '' }), 1500);
                } else {
                  // Si hubo error, muestra mensaje de error
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

  // Verifica la contraseña de una cápsula privada (petición al backend)
  const checkPassword = async (capsula, password) => {
    const res = await fetch(`/api/capsules/${capsula.Capsule_ID}/check-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data.valid;
  };

  // Handler general para acciones protegidas (ver, editar, eliminar)
  const handleProtectedAction = (type, capsula) => {
    const ahora = new Date();
    const apertura = new Date(capsula.Opening_Date);
    // Si la cápsula aún no está disponible, muestra mensaje
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
    // Si tiene contraseña, pide contraseña antes de continuar
    if (capsula.Password) {
      setPendingAction({ type, capsula });
      setShowPasswordModal(true);
      setPasswordError('');
      return;
    }
    // Si no requiere contraseña, ejecuta la acción directamente
    ejecutarAccion(type, capsula);
  };

  // Ejecuta la acción (ver, editar, eliminar) después de validar contraseña
  const ejecutarAccion = (type, capsula) => {
    if (type === 'ver') navigate(`/vercapsula/${capsula.Capsule_ID}`);
    if (type === 'editar') navigate(`/editarcapsula/${capsula.Capsule_ID}`);
    if (type === 'eliminar') handleDelete(capsula.Capsule_ID);
  };

  // Cuando el usuario envía la contraseña en el modal
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

  // Efecto para resaltar una cápsula si viene de una notificación (por ejemplo, desde otra vista)
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

  // Efecto para quitar el highlight después de 2 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.removeItem('highlight_capsule');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Imágenes aleatorias de respaldo para cápsulas sin portada
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

  // Set para evitar repetir imágenes aleatorias
  const usedImages = new Set();

  // Devuelve una imagen aleatoria no repetida
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
      {/* Encabezado con título y botón para crear nueva cápsula */}
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

      {/* Filtros para mostrar todas, abiertas o programadas */}
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
          {/* Estrellas flotantes de fondo */}
          <FloatingStars />
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-up">
            {filteredCapsulas.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400 animate-fade-in-up">No tienes cápsulas.</div>
            ) : (
              filteredCapsulas.map((capsula, idx) => {
                // Determina si la cápsula está abierta o programada
                const ahora = new Date();
                const apertura = new Date(capsula.Opening_Date);
                const disabled = apertura > ahora;
                // Determina la imagen de portada (personalizada o aleatoria)
                let imageUrl;
                if (capsula.Cover_Image) {
                  imageUrl = capsula.Cover_Image.startsWith('http')
                    ? capsula.Cover_Image
                    : `http://44.209.31.187:3000/api${capsula.Cover_Image}`;
                } else {
                  imageUrl = getUniqueRandomImage();
                }
                // Determina si el usuario tiene plan premium
                const isPremium = plan && plan.toLowerCase() === 'premium';
                // Permisos para editar/eliminar según plan y estado
                const puedeEditar = isPremium && disabled;
                const puedeEliminar = isPremium || !disabled;

                return (
                  <div
                    key={capsula.Capsule_ID}
                    data-capsule-id={capsula.Capsule_ID}
                    className={`relative flex flex-col items-center justify-between overflow-visible transition-all duration-300 group space-capsule-card
                      ${String(capsula.Capsule_ID) === localStorage.getItem('highlight_capsule')
                        ? 'border-4 border-yellow-400 animate-shake'
                        : ''
                      }
                      ${disabled ? 'grayscale-[0.2]' : 'hover:scale-105'}
                    `}
                    tabIndex={-1}
                  >
                    <div className="relative flex flex-col items-center w-full">
                      {/* Cúpula decorativa superior */}
                      <div className="w-36 h-12 bg-gradient-to-b from-[#F5E050] to-[#3d3d9e] rounded-t-full shadow-lg z-10" />
                      {/* Imagen de portada en círculo */}
                      <div className="relative w-36 h-36 flex items-center justify-center -mt-8 z-20">
                        <div className="absolute w-full h-full rounded-full border-4 border-[#F5E050] bg-[#23235b] shadow-inner z-0" />
                        <img
                          src={imageUrl}
                          alt={capsula.Title}
                          className="w-32 h-32 object-cover rounded-full border-2 border-[#3d3d9e] shadow-lg z-10 bg-[#23235b]"
                          style={{ backgroundColor: "#23235b" }}
                        />
                      </div>
                      {/* Cuerpo principal de la cápsula */}
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
                      </div>
                      {/* Fuego de propulsión decorativo */}
                      <div className="w-16 h-10 bg-gradient-to-b from-[#F5E050] via-[#e6d047] to-transparent rounded-b-full blur-sm opacity-80 animate-capsule-fire -mt-3" />

                      {/* Overlay de bloqueo si la cápsula está programada */}
                      {disabled && (
                        <div
                          className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-20 animate-fade-in rounded-b-3xl rounded-t-xl pointer-events-none"
                          style={{
                            pointerEvents: 'none',
                            borderRadius: '1.5rem 1.5rem 1.5rem 1.5rem / 2.5rem 2.5rem 1.5rem 1.5rem'
                          }}
                        >
                          <FontAwesomeIcon icon={faLock} className="text-3xl text-[#F5E050] mb-2 animate-bounce-slow" />
                          <span className="text-[#F5E050] text-xs font-bold flex items-center gap-2 text-center">
                            No disponible hasta {apertura.toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {/* Botones de acción (editar, eliminar) según permisos */}
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
                        {/* Si está abierta y es el creador, puede eliminar */}
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
                      {/* Botón invisible para ver la cápsula (toda la tarjeta es clickeable) */}
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

      {/* Modal para pedir contraseña si la cápsula está protegida */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSubmit={handlePasswordSubmit}
        error={passwordError}
      />

      {/* Modal general para mensajes y confirmaciones */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, title: '', message: '' })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>

      {/* Animaciones CSS para transiciones y efectos */}
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
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(8px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.7s;
          box-shadow: 0 0 0 4px #F5E050;
          z-index: 10;
        }
      `}
      </style>
    </div>
  );
};

export default MisCapsulas;