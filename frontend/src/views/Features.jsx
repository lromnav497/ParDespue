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
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6">
            Características
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            Descubre todas las herramientas que tenemos para ayudarte a preservar 
            tus recuerdos más preciados de una manera única y segura.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-[#2E2E7A] rounded-xl p-6 transform hover:scale-105 transition-all"
            >
              <div className="bg-[#1a1a4a] w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <FontAwesomeIcon 
                  icon={feature.icon} 
                  className="text-[#F5E050] text-2xl"
                />
              </div>
              <h3 className="text-[#F5E050] text-xl mb-3 passero-font">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-[#2E2E7A] rounded-xl p-8 text-center">
          <h3 className="text-3xl text-[#F5E050] passero-font mb-4">
            ¿Listo para empezar?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Crea tu primera cápsula del tiempo digital y comienza a preservar 
            tus recuerdos más especiales.
          </p>
          <button className="bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
            hover:bg-[#e6d047] transition-transform hover:scale-105">
            Crear Cuenta Gratis
          </button>
        </div>
      </div>
    </div>
  );
};

export default Features;