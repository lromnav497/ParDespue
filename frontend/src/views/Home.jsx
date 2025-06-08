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
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] flex items-center justify-center animate-fade-in">
      <div className="container mx-auto px-2 md:px-4 py-10 md:py-16">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h2 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6 drop-shadow-lg animate-fade-in-down">
            Guarda tus recuerdos en el tiempo
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-fade-in-up">
            Crea cápsulas del tiempo digitales y comparte tus momentos más especiales 
            con las personas que amas en el futuro.
          </p>
          <button
            onClick={handleStart}
            className="inline-flex items-center bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
            hover:bg-[#e6d047] transition-all duration-200 shadow-lg font-bold text-lg scale-100 hover:scale-105 animate-bounce-slow"
          >
            Comenzar ahora
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in-up">
          <div className="bg-[#2E2E7A] time-capsule p-6 rounded-xl text-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 group">
            <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <FontAwesomeIcon icon={faBoxArchive} className="text-[#F5E050] text-2xl" />
            </div>
            <h3 className="text-[#F5E050] passero-font text-xl mb-3 group-hover:underline transition-all">Crea Cápsulas</h3>
            <p className="text-gray-300">
              Guarda fotos, videos, mensajes y más en tus cápsulas del tiempo digitales.
            </p>
          </div>

          <div className="bg-[#2E2E7A] time-capsule p-6 rounded-xl text-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 group">
            <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <FontAwesomeIcon icon={faClock} className="text-[#F5E050] text-2xl" />
            </div>
            <h3 className="text-[#F5E050] passero-font text-xl mb-3 group-hover:underline transition-all">Programa la Apertura</h3>
            <p className="text-gray-300">
              Decide cuándo quieres que tus seres queridos reciban tus recuerdos.
            </p>
          </div>

          <div className="bg-[#2E2E7A] time-capsule p-6 rounded-xl text-center shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 group">
            <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
              <FontAwesomeIcon icon={faHeart} className="text-[#F5E050] text-2xl" />
            </div>
            <h3 className="text-[#F5E050] passero-font text-xl mb-3 group-hover:underline transition-all">Comparte Amor</h3>
            <p className="text-gray-300">
              Crea momentos inolvidables para las personas que más quieres.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#2E2E7A] time-capsule rounded-xl p-8 text-center shadow-2xl animate-fade-in-up">
          {user ? (
            <h3 className="text-3xl text-[#F5E050] passero-font mb-4 animate-fade-in-down">
              ¡Bienvenido, {user.name}!
            </h3>
          ) : (
            <>
              <h3 className="text-3xl text-[#F5E050] passero-font mb-4 animate-fade-in-down">
                ¿Listo para crear tu primera cápsula del tiempo?
              </h3>
              <p className="text-gray-300 mb-6 animate-fade-in-up">
                Únete a nuestra comunidad y comienza a guardar tus recuerdos más preciados.
              </p>
              <Link 
                to="/register" 
                className="inline-flex items-center bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
                hover:bg-[#e6d047] transition-all duration-200 shadow-lg font-bold text-lg scale-100 hover:scale-105 animate-bounce-slow"
              >
                Crear cuenta gratis
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
            </>
          )}
        </div>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2.5s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-12px);}
          }
        `}
      </style>
    </div>
  );
};

export default Home;