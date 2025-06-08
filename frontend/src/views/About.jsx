import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faHeart,
  faShieldAlt,
  faUsers,
  faLightbulb,
  faStar
} from '@fortawesome/free-solid-svg-icons';

const About = () => {
  const teamMembers = [
    {
      name: "Luis Carlos Romero Navarro",
      role: "Fundador & CEO",
      image: "/foto_CEO.png", // Usar la imagen real del CEO desde public
      description: "Apasionado por preservar momentos especiales y conectar personas."
    },
  ];

  const values = [
    {
      icon: faHeart,
      title: "Conexión Emocional",
      description: "Creemos en el poder de los recuerdos para conectar personas y generaciones."
    },
    {
      icon: faShieldAlt,
      title: "Privacidad",
      description: "Protegemos tus momentos más preciados con la máxima seguridad."
    },
    {
      icon: faUsers,
      title: "Comunidad",
      description: "Construimos un espacio seguro para compartir y preservar memorias."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b]">
      {/* Hero Section */}
      <div className="container mx-auto px-2 md:px-4 py-16">
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6 drop-shadow-lg">
            Preservando Momentos, Conectando Vidas
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto animate-fade-in-up">
            En ParDespue, creemos que cada momento merece ser recordado y 
            cada historia merece ser contada. Nuestra misión es ayudarte a 
            preservar tus recuerdos más preciados para el futuro.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#2E2E7A] rounded-xl p-6 text-center shadow-xl animate-fade-in-up delay-100">
            <div className="text-[#F5E050] text-4xl font-bold mb-2">50K+</div>
            <div className="text-gray-300">Cápsulas Creadas</div>
          </div>
          <div className="bg-[#2E2E7A] rounded-xl p-6 text-center shadow-xl animate-fade-in-up delay-200">
            <div className="text-[#F5E050] text-4xl font-bold mb-2">100K+</div>
            <div className="text-gray-300">Usuarios Activos</div>
          </div>
          <div className="bg-[#2E2E7A] rounded-xl p-6 text-center shadow-xl animate-fade-in-up delay-300">
            <div className="text-[#F5E050] text-4xl font-bold mb-2">1M+</div>
            <div className="text-gray-300">Recuerdos Guardados</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl text-[#F5E050] passero-font text-center mb-8 animate-fade-in-down">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-[#2E2E7A] rounded-xl p-6 text-center shadow-xl animate-fade-in-up delay-100">
                <FontAwesomeIcon 
                  icon={value.icon} 
                  className="text-[#F5E050] text-4xl mb-4 animate-bounce-slow"
                />
                <h3 className="text-[#F5E050] text-xl mb-2 passero-font">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl text-[#F5E050] passero-font text-center mb-8 animate-fade-in-down">
            Nuestro Equipo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-[#2E2E7A] rounded-xl overflow-hidden shadow-xl flex flex-col items-center animate-fade-in-up delay-200"
              >
                <div className="w-full flex justify-center pt-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-[#F5E050] shadow-lg transition-transform duration-300 hover:scale-105 bg-white"
                    style={{ objectPosition: 'center' }}
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-[#F5E050] text-xl mb-1 passero-font">{member.name}</h3>
                  <div className="text-gray-400 mb-3">{member.role}</div>
                  <p className="text-gray-300">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#2E2E7A] rounded-xl p-8 text-center shadow-2xl animate-fade-in-up">
          <h3 className="text-3xl text-[#F5E050] passero-font mb-4 animate-fade-in-down">
            ¿Listo para preservar tus recuerdos?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto animate-fade-in-up">
            Únete a nuestra comunidad y comienza a crear tus propias cápsulas del tiempo digitales.
          </p>
          <button className="bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
            hover:bg-[#e6d047] transition-transform hover:scale-105 font-bold text-lg shadow-lg animate-bounce-slow">
            Comenzar Ahora
          </button>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2.5s infinite; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
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

export default About;