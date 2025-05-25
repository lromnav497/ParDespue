import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxArchive, 
  faClock, 
  faHeart,
  faArrowRight
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

const Home = () => {
  const user = getStoredUser();
  const navigate = useNavigate();

  const handleStart = () => {
    if (user) {
      navigate('/crear-capsula');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl text-[#F5E050] passero-font mb-6">
            Guarda tus recuerdos en el tiempo
          </h2>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-8">
            Crea cápsulas del tiempo digitales y comparte tus momentos más especiales 
            con las personas que amas en el futuro.
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
            hover:bg-[#e6d047] transition-transform hover:scale-105"
          >
            Comenzar ahora
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#2E2E7A] time-capsule p-6 rounded-xl text-center">
            <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faBoxArchive} className="text-[#F5E050] text-2xl" />
            </div>
            <h3 className="text-[#F5E050] passero-font text-xl mb-3">Crea Cápsulas</h3>
            <p className="text-gray-300">
              Guarda fotos, videos, mensajes y más en tus cápsulas del tiempo digitales.
            </p>
          </div>

          <div className="bg-[#2E2E7A] time-capsule p-6 rounded-xl text-center">
            <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faClock} className="text-[#F5E050] text-2xl" />
            </div>
            <h3 className="text-[#F5E050] passero-font text-xl mb-3">Programa la Apertura</h3>
            <p className="text-gray-300">
              Decide cuándo quieres que tus seres queridos reciban tus recuerdos.
            </p>
          </div>

          <div className="bg-[#2E2E7A] time-capsule p-6 rounded-xl text-center">
            <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faHeart} className="text-[#F5E050] text-2xl" />
            </div>
            <h3 className="text-[#F5E050] passero-font text-xl mb-3">Comparte Amor</h3>
            <p className="text-gray-300">
              Crea momentos inolvidables para las personas que más quieres.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#2E2E7A] time-capsule rounded-xl p-8 text-center">
          {user ? (
            <h3 className="text-3xl text-[#F5E050] passero-font mb-4">
              ¡Bienvenido, {user.name}!
            </h3>
          ) : (
            <>
              <h3 className="text-3xl text-[#F5E050] passero-font mb-4">
                ¿Listo para crear tu primera cápsula del tiempo?
              </h3>
              <p className="text-gray-300 mb-6">
                Únete a nuestra comunidad y comienza a guardar tus recuerdos más preciados.
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
                hover:bg-[#e6d047] transition-transform hover:scale-105"
              >
                Crear cuenta gratis
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;