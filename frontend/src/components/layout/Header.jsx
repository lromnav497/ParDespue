import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, faHome, faBoxArchive, faCompass, faQuestionCircle,
  faChevronDown, faRightFromBracket, faCrown, faBell, faUsers
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
      profilePicture: user.profilePicture || user.Profile_Picture || '', // <---
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
    let intervalId;

    const fetchNotifications = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/notifications/recent', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const now = new Date();
        const visibles = data.filter(n => new Date(n.Sent_Date) <= now);
        setNotifications(visibles.slice(0, 3));
      }
    };

    fetchNotifications(); // Llama al cargar

    // Llama cada 30 segundos
    intervalId = setInterval(fetchNotifications, 30000);

    return () => clearInterval(intervalId);
  }, [user]);

  // Marcar notificaciones como leídas al abrir el dropdown
  const handleBellClick = () => {
    setNotifOpen(v => !v);
    if (!notifOpen && notifications.length > 0) {
      if (user) {
        const ultimaFecha = notifications[0].Sent_Date;
        localStorage.setItem(`notificaciones_leidas_${user.id}`, ultimaFecha);
      }
    }
  };

  const ultimaLeida = user && localStorage.getItem(`notificaciones_leidas_${user.id}`);
  const showBadge = notifications.length > 0 && notifications.some(n => {
    return !ultimaLeida || new Date(n.Sent_Date) > new Date(ultimaLeida);
  });

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMenuOpen(false);
    window.dispatchEvent(new Event('user-updated'));
    navigate('/login');
  };

  // 1. Añade la ruta de tu icono personalizado de corona (por ejemplo, en public/icons/corona.svg)
  const iconCorona = "/icons/premiun.svg";
  // 1. Importa tus iconos personalizados (ejemplo SVG en public)
  const iconInicio = "/icons/inicio.svg";
  const iconCapsulas = "/icons/capsulas.svg";
  const iconCompartidas = "/icons/compartidas.svg";
  const iconExplorar = "/icons/explorar.svg";
  const iconAyuda = "/icons/ayuda.svg";

  return (
    <nav className="bg-[#2E2E7A] p-4 shadow-lg sticky top-0 z-50 animate-fade-in">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo y navegación principal */}
        <div className="flex items-center gap-4 md:gap-8">
          <Link to="/" className="text-[#F5E050] passero-font text-2xl drop-shadow-lg transition-transform hover:scale-105">
            ParDespue
          </Link>
          {/* Menú hamburguesa móvil */}
          <button
            className="md:hidden text-[#F5E050] text-2xl ml-2 focus:outline-none"
            onClick={() => setMobileMenuOpen(v => !v)}
            aria-label="Abrir menú"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
            </svg>
          </button>
          {/* Menú principal escritorio */}
          <ul className="hidden md:flex space-x-6">
            <li>
              <Link to="/" className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold">
                <FontAwesomeIcon icon={faHome} className="mr-2" />
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/capsulas" className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold">
                <FontAwesomeIcon icon={faBoxArchive} className="mr-2" />
                Mis Cápsulas
              </Link>
            </li>
            <li>
              <Link to="/compartidas" className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold">
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                Compartidas conmigo
              </Link>
            </li>
            <li>
              <Link to="/explorar" className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold">
                <FontAwesomeIcon icon={faCompass} className="mr-2" />
                Explorar
              </Link>
            </li>
            <li>
              <Link to="/ayuda" className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold">
                <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
                Ayuda
              </Link>
            </li>
          </ul>
        </div>

        {/* Acciones de usuario */}
        <div className="flex gap-4 items-center">
          {user && (
            <div className="relative">
              <button
                className="text-white hover:text-[#F5E050] relative transition-colors"
                onClick={handleBellClick}
                aria-label="Notificaciones"
              >
                <FontAwesomeIcon icon={faBell} className="text-xl" />
                {showBadge && (
                  <span className="absolute -top-2 -right-2 bg-[#F5E050] text-[#2E2E7A] rounded-full px-2 text-xs font-bold animate-bounce-slow shadow-lg">
                    {notifications.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#2E2E7A] rounded-lg shadow-2xl z-50 p-4 animate-fade-in-up border border-[#F5E050]/30">
                  <h4 className="text-[#F5E050] font-bold mb-2">Notificaciones</h4>
                  {notifications.length === 0 ? (
                    <div className="text-white">No tienes notificaciones recientes.</div>
                  ) : (
                    <ul>
                      {notifications.map(n => (
                        <li
                          key={n.Notification_ID}
                          className="text-white border-b border-[#3d3d9e] py-2 cursor-pointer hover:bg-[#1a1a4a] transition-all"
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
                    className="mt-2 text-[#F5E050] underline hover:text-white transition-all"
                    onClick={() => { setNotifOpen(false); navigate('/notificaciones'); }}
                  >
                    Ver todas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botones login/registro o menú usuario */}
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold"
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                Iniciar Sesión
              </Link>
              <Link 
                to="/register" 
                className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded-full hover:bg-[#e6d047] transition-all font-bold shadow"
              >
                Registrarse
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                className="flex items-center text-white hover:text-[#F5E050] transition-colors font-semibold"
                onClick={() => setMenuOpen(v => !v)}
              >
                {/* Solo muestra el icono si NO hay foto */}
                {!user.profilePicture && (
                  <FontAwesomeIcon icon={faUser} className="mr-2" />
                )}
                <span className="mr-2 flex items-center">
                  {user.name}
                  {user.profilePicture && (() => {
                    const imgUrl = user.profilePicture.startsWith('http')
                      ? user.profilePicture
                      : `http://44.209.31.187/api${user.profilePicture}`;
                    return (
                      <span className="relative ml-2 inline-block group">
                        <img
                          src={imgUrl}
                          alt="Foto de perfil"
                          className="w-14 h-14 rounded-full object-cover border-4 border-[#F5E050] shadow-xl transition-transform duration-200 group-hover:scale-105 group-hover:ring-4 group-hover:ring-[#F5E050]/50 bg-white"
                          style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {plan === 'Premium' && (
                          <img
                            src={iconCorona}
                            alt="Usuario Premium"
                            className="absolute -top-2 -right-2 w-8 h-8 drop-shadow-lg animate-bounce-slow"
                            title="Usuario Premium"
                            style={{ zIndex: 2, filter: 'drop-shadow(0 2px 4px #0008)' }}
                          />
                        )}
                      </span>
                    );
                  })()}
                  {/* Si NO hay foto, muestra la corona junto al nombre */}
                  {!user.profilePicture && plan === 'Premium' && (
                    <img
                      src={iconCorona}
                      alt="Usuario Premium"
                      className="ml-2 w-6 h-6 animate-bounce-slow"
                      title="Usuario Premium"
                    />
                  )}
                </span>
                <FontAwesomeIcon icon={faChevronDown} className="ml-1" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#2E2E7A] rounded-lg shadow-2xl z-50 animate-fade-in-up border border-[#F5E050]/30">
                  <Link
                    to="/mi-cuenta"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a] transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/mi-cuenta?suscripciones"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a] transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis Suscripciones
                  </Link>
                  <Link
                    to="/mi-cuenta?capsulas"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a] transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Mis Cápsulas
                  </Link>
                  <Link
                    to="/mi-cuenta?configuracion"
                    className="block px-4 py-2 text-white hover:bg-[#1a1a4a] transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Configuración
                  </Link>
                  {/* Botones solo para administrador */}
                  {user?.role === 'administrator' && (
                    <>
                      <Link
                        to="/todas-capsulas"
                        className="block px-4 py-2 text-[#F5E050] hover:bg-[#1a1a4a] font-bold transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        Todas las Cápsulas
                      </Link>
                      <Link
                        to="/panel-moderacion"
                        className="block px-4 py-2 text-[#F5E050] hover:bg-[#1a1a4a] font-bold transition-all"
                        onClick={() => setMenuOpen(false)}
                      >
                        Panel Moderación
                      </Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#1a1a4a] flex items-center transition-all"
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

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex md:hidden animate-fade-in">
          <div className="bg-[#2E2E7A] w-64 h-full shadow-2xl p-6 flex flex-col gap-6 animate-fade-in-up">
            <button
              className="self-end text-[#F5E050] text-2xl mb-4 focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <ul className="flex flex-col gap-4">
              <li>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold text-lg">
                  <img src={iconInicio} alt="Inicio" className="mr-2 w-6 h-6 inline" />
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/capsulas" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold text-lg">
                  <img src={iconCapsulas} alt="Mis Cápsulas" className="mr-2 w-6 h-6 inline" />
                  Mis Cápsulas
                </Link>
              </li>
              <li>
                <Link to="/compartidas" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold text-lg">
                  <img src={iconCompartidas} alt="Compartidas conmigo" className="mr-2 w-6 h-6 inline" />
                  Compartidas conmigo
                </Link>
              </li>
              <li>
                <Link to="/explorar" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold text-lg">
                  <img src={iconExplorar} alt="Explorar" className="mr-2 w-6 h-6 inline" />
                  Explorar
                </Link>
              </li>
              <li>
                <Link to="/ayuda" onClick={() => setMobileMenuOpen(false)} className="text-white hover:text-[#F5E050] transition-colors flex items-center font-semibold text-lg">
                  <img src={iconAyuda} alt="Ayuda" className="mr-2 w-6 h-6 inline" />
                  Ayuda
                </Link>
              </li>
            </ul>
          </div>
          {/* Clic fuera cierra el menú */}
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-up { animation: fadeInUp 0.7s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </nav>
  );
};

export default Header;