import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxArchive,
  faClock,
  faLock,
  faUsers,
  faCloud,
  faMobileAlt,
  faEnvelope,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Features = () => {
  const features = [
    {
      icon: faBoxArchive,
      title: "Cápsulas Personalizadas",
      description: "Crea cápsulas únicas con fotos, videos, mensajes y más. Personaliza cada detalle para hacer tus recuerdos aún más especiales."
    },
    {
      icon: faClock,
      title: "Apertura Programada",
      description: "Elige exactamente cuándo quieres que tus cápsulas sean abiertas. Perfectas para aniversarios, graduaciones o momentos especiales."
    },
    {
      icon: faLock,
      title: "Máxima Seguridad",
      description: "Tus recuerdos están protegidos con encriptación de grado militar. Solo tú y los destinatarios elegidos podrán acceder a ellos."
    },
    {
      icon: faUsers,
      title: "Cápsulas Colaborativas",
      description: "Crea cápsulas en grupo para eventos especiales. Permite que familia y amigos añadan sus propios recuerdos."
    },
    {
      icon: faEnvelope,
      title: "Notificaciones",
      description: "Recibe alertas personalizadas cuando se acerque la fecha de apertura de tus cápsulas. Nunca te perderás un momento especial."
    },
    {
      icon: faShieldAlt,
      title: "Control Total",
      description: "Gestiona permisos de acceso, modifica fechas de apertura y actualiza el contenido de tus cápsulas en cualquier momento."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] py-16 animate-fade-in">
      <div className="container mx-auto px-2 md:px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6 drop-shadow-lg">
            Características
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto animate-fade-in-up">
            Descubre todas las herramientas que tenemos para ayudarte a preservar 
            tus recuerdos más preciados de una manera única y segura.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`bg-[#2E2E7A] rounded-xl p-6 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 group animate-fade-in-up delay-${index * 100}`}
            >
              <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
                <FontAwesomeIcon 
                  icon={feature.icon} 
                  className="text-[#F5E050] text-2xl"
                />
              </div>
              <h3 className="text-[#F5E050] text-xl mb-3 passero-font group-hover:underline transition-all">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-[#2E2E7A] rounded-xl p-8 text-center shadow-2xl animate-fade-in-up">
          <h3 className="text-3xl text-[#F5E050] passero-font mb-4 animate-fade-in-down">
            ¿Listo para empezar?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto animate-fade-in-up">
            Crea tu primera cápsula del tiempo digital y comienza a preservar 
            tus recuerdos más especiales.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
              hover:bg-[#e6d047] transition-all duration-200 shadow-lg font-bold text-lg scale-100 hover:scale-105 animate-bounce-slow"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2.5s infinite; }
          .delay-0 { animation-delay: 0s; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .delay-400 { animation-delay: 0.4s; }
          .delay-500 { animation-delay: 0.5s; }
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

export default Features;