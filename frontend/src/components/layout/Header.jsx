import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faHome, faBoxArchive, faCompass, faQuestionCircle,
  faChevronDown, faRightFromBracket, faCrown, faBell
} from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../../helpers/fetchWithAuth';

const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return {
      id: user.id || user.User_ID,
      name: user.name || user.Name,
      email: user.email || user.Email,
      role: user.role || user.Role,
    };
  } catch {
    return null;
  }
};

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getStoredUser());
  const [plan, setPlan] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const navigate = useNavigate();

  // Escucha cambios de usuario
  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);

  // Consulta el plan real al backend cuando hay usuario
  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) return;
      const token = localStorage.getItem('token') || user.token;
      if (!token) return;
      try {
        const res = await fetchWithAuth('/api/subscriptions/my-plan');
        if (!res) return; // Ya redirigió si expiró
        const data = await res.json();
        // Si tu backend devuelve { suscripcion: { nombre: 'premium', ... } }
        if (data.suscripcion && data.suscripcion.nombre) {
          setPlan(
            data.suscripcion.nombre.charAt(0).toUpperCase() +
            data.suscripcion.nombre.slice(1)
          );
        } else {
          setPlan(null);
        }
      } catch {
        setPlan(null);
      }
    };
    fetchPlan();
  }, [user]);

  // Cargar notificaciones recientes cuando hay usuario
  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notifications/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.slice(0, 3)); // Solo las 3 más recientes
      }
    };
    fetchNotifications();
  }, [user]);

  // Marcar notificaciones como leídas al abrir el dropdown
  const handleBellClick = () => {
    setNotifOpen(v => !v);
    if (!notifOpen) {
      // Marcar como leídas en localStorage
      if (user) {
        localStorage.setItem(`notificaciones_leidas_${user.id}`, 'true');
      }
      // No borres las notificaciones, solo el badge se ocultará
    }
  };

  // Determinar si mostrar el badge
  const showBadge = notifications.length > 0 && !(user && localStorage.getItem(`notificaciones_leidas_${user.id}`) === 'true');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMenuOpen(false);
    window.dispatchEvent(new Event('user-updated'));
    navigate('/login');
  };

  return (
    <nav className="bg-[#2E2E7A] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-[#F5E050] passero-font text-2xl">
            ParDespue
          </Link>
          
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link to="/" className="text-white hover:text-[#F5E050] transition-colors flex items-center">
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/capsulas" className="text-white hover:text-[#F5E050] transition-colors flex items-center">
                <FontAwesomeIcon icon={faBoxArchive} className="mr-2" />
                Mis Cápsulas
              </Link>
            </li>
            <li>
              <Link to="/explorar" className="text-white hover:text-[#F5E050] transition-colors flex items-center">
                <FontAwesomeIcon icon={faCompass} className="mr-2" />
                Explorar
              </Link>
            </li>
            <li>
              <Link to="/ayuda" className="text-white hover:text-[#F5E050] transition-colors flex items-center">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                Ayuda
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex gap-4 items-center">
          {user && (
            <div className="relative">
              <button
                className="text-white hover:text-[#F5E050] relative"
                onClick={handleBellClick}
                aria-label="Notificaciones"
              >
                <FontAwesomeIcon icon={faBell} />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-[#F5E050] text-[#2E2E7A] rounded-full px-2 text-xs font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#2E2E7A] rounded-lg shadow-lg z-50 p-4">
                  <h4 className="text-[#F5E050] font-bold mb-2">Notificaciones</h4>
                  {notifications.length === 0 ? (
                    <div className="text-white">No tienes notificaciones recientes.</div>
                  ) : (
                    <ul>
                      {notifications.map(n => (
                        <li
                          key={n.Notification_ID}
                          className="text-white border-b border-[#3d3d9e] py-2 cursor-pointer hover:bg-[#1a1a4a]"
                          onClick={() => {
                            if (n.Capsule_ID) {
                              localStorage.setItem('highlight_capsule', n.Capsule_ID);
                              setNotifOpen(false);
                              navigate('/capsulas');
                            }
                          }}
                        >
                          {n.Message}
                          <span className="text-xs text-gray-400 block">{new Date(n.Sent_Date).toLocaleString()}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    className="mt-2 text-[#F5E050] underline"
                    onClick={() => { setNotifOpen(false); navigate('/notificaciones'); }}
                  >
                    Ver todas
                  </button>
                </div>
              )}
            </div>
          )}

          {!user ? (
            <>
              <Link 
                to="/login" 
                className="text-white hover:text-[#F5E050] transition-colors flex items-center"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded-full hover:bg-[#e6d047] transition-colors"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                className="flex items-center text-white hover:text-[#F5E050] transition-colors"
                onClick={() => setMenuOpen(v => !v)}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span className="mr-2 flex items-center">
                  {user.name}
                  {/* Mostrar corona si es premium */}
                  {plan === 'Premium' && (
                    <FontAwesomeIcon icon={faCrown} className="ml-2 text-yellow-400" title="Usuario Premium" />
                  )}
                </span>
                <FontAwesomeIcon icon={faChevronDown} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#2E2E7A] rounded-lg shadow-lg z-50">
                  <Link
                    to="/mi-cuenta"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/mi-cuenta?suscripciones"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis Suscripciones
                  </Link>
                  <Link
                    to="/mi-cuenta?capsulas"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis Cápsulas
                  </Link>
                  <Link
                    to="/mi-cuenta?configuracion"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a]"
                    onClick={() => setMenuOpen(false)}
                  >
                    Configuración
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#1a1a4a] flex items-center"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} className="mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Header;