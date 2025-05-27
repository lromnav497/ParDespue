import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faHome, 
  faBoxArchive, 
  faCompass, 
  faQuestionCircle,
  faChevronDown,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

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
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setUser(getStoredUser());
    window.addEventListener('user-updated', handler);
    return () => window.removeEventListener('user-updated', handler);
  }, []);

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
                <span className="mr-2">{user.name}</span>
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