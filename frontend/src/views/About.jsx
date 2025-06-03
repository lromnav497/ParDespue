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
      image: "https://picsum.photos/200",
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
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6">
            Preservando Momentos, Conectando Vidas
          </h1>
          <p className="text-gray-300 text-xl max-w-3xl mx-auto">
            En ParDespue, creemos que cada momento merece ser recordado y 
            cada historia merece ser contada. Nuestra misión es ayudarte a 
            preservar tus recuerdos más preciados para el futuro.
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-[#2E2E7A] rounded-xl p-6 text-center">
            <div className="text-[#F5E050] text-4xl font-bold mb-2">50K+</div>
            <div className="text-gray-300">Cápsulas Creadas</div>
          </div>
          <div className="bg-[#2E2E7A] rounded-xl p-6 text-center">
            <div className="text-[#F5E050] text-4xl font-bold mb-2">100K+</div>
            <div className="text-gray-300">Usuarios Activos</div>
          </div>
          <div className="bg-[#2E2E7A] rounded-xl p-6 text-center">
            <div className="text-[#F5E050] text-4xl font-bold mb-2">1M+</div>
            <div className="text-gray-300">Recuerdos Guardados</div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl text-[#F5E050] passero-font text-center mb-8">
            Nuestros Valores
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-[#2E2E7A] rounded-xl p-6 text-center">
                <FontAwesomeIcon 
                  icon={value.icon} 
                  className="text-[#F5E050] text-4xl mb-4"
                />
                <h3 className="text-[#F5E050] text-xl mb-2">{value.title}</h3>
                <p className="text-gray-300">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl text-[#F5E050] passero-font text-center mb-8">
            Nuestro Equipo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-[#2E2E7A] rounded-xl overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-[#F5E050] text-xl mb-1">{member.name}</h3>
                  <div className="text-gray-400 mb-3">{member.role}</div>
                  <p className="text-gray-300">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#2E2E7A] rounded-xl p-8 text-center">
          <h3 className="text-3xl text-[#F5E050] passero-font mb-4">
            ¿Listo para preservar tus recuerdos?
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Únete a nuestra comunidad y comienza a crear tus propias cápsulas del tiempo digitales.
          </p>
          <button className="bg-[#F5E050] text-[#2E2E7A] px-8 py-3 rounded-full 
            hover:bg-[#e6d047] transition-transform hover:scale-105">
            Comenzar Ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;