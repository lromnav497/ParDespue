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
        setCapsulas(data);
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
                const user = JSON.parse(localStorage.getItem('user'));
                const res = await fetch(`/api/capsules/${capsuleId}`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id }),
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
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl text-[#F5E050] passero-font">Mis Cápsulas del Tiempo</h1>
        <button
          className="bg-[#F5E050] text-[#2E2E7A] px-6 py-3 rounded-full 
            hover:bg-[#e6d047] transition-all flex items-center gap-2"
          onClick={() => navigate('/crear-capsula')}
        >
          <FontAwesomeIcon icon={faPlus} />
          Nueva Cápsula
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {filtros.map(filtro => (
          <button
            key={filtro.value}
            onClick={() => setActiveFilter(filtro.value)}
            className={`px-4 py-2 rounded-full whitespace-nowrap
              ${activeFilter === filtro.value 
                ? 'bg-[#F5E050] text-[#2E2E7A]' 
                : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e]'}`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {/* Grid de cápsulas */}
      {loading ? (
        <div className="text-center text-[#F5E050]">Cargando cápsulas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCapsulas.length === 0 ? (
            <div className="col-span-3 text-center text-gray-400">No tienes cápsulas.</div>
          ) : (
            filteredCapsulas.map((capsula, idx) => {
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
              // Premium: puede editar/eliminar siempre. Básico: solo eliminar si abierta.
              const puedeEditar = isPremium && disabled;
              const puedeEliminar = isPremium || !disabled;

              return (
                <div
                  key={capsula.Capsule_ID}
                  data-capsule-id={capsula.Capsule_ID}
                  className={`bg-[#2E2E7A] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer relative ${
                    String(capsula.Capsule_ID) === localStorage.getItem('highlight_capsule')
                      ? 'border-4 border-yellow-400 animate-shake'
                      : ''
                  } ${disabled ? 'opacity-60' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    // Solo permitir ver si está abierta o eres premium
                    if (!disabled || isPremium) {
                      handleProtectedAction('ver', capsula);
                      if (String(capsula.Capsule_ID) === localStorage.getItem('highlight_capsule')) {
                        localStorage.removeItem('highlight_capsule');
                      }
                    }
                  }}
                >
                  <div className="relative">
                    <img 
                      src={imageUrl}
                      alt={capsula.Title}
                      className="w-full h-48 object-cover"
                    />
                    {disabled && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-60 z-10">
                        <FontAwesomeIcon icon={faLock} className="text-4xl text-[#F5E050] mb-2" />
                        <span className="text-[#F5E050] text-sm font-bold flex items-center gap-2">
                          No disponible hasta {apertura.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                      {/* Solo mostrar editar si es premium y está programada */}
                      {puedeEditar && (
                        <button
                          className="p-2 bg-[#1a1a4a] rounded-full text-[#F5E050] hover:bg-[#3d3d9e]"
                          onClick={e => {
                            e.stopPropagation();
                            handleProtectedAction('editar', capsula);
                          }}
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                      )}
                      {/* Eliminar siempre para premium, y para básico solo si está abierta */}
                      {puedeEliminar && capsula.Creator_User_ID === userId && (
                        <button
                          className="p-2 bg-[#1a1a4a] rounded-full text-red-500 hover:bg-[#3d3d9e]"
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(capsula.Capsule_ID);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-[#F5E050] passero-font text-xl mb-2">
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
                      <p className="text-gray-400">{capsula.Content}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
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

      {/* Agrega animación shake */}
      <style>
      {`
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