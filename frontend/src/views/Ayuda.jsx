import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faQuestionCircle, 
  faChevronDown,
  faEnvelope,
  faBook,
  faHeadset
} from '@fortawesome/free-solid-svg-icons';

const Ayuda = () => {
  const [openQuestion, setOpenQuestion] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "¿Qué es una cápsula del tiempo digital?",
      answer: "Una cápsula del tiempo digital es un contenedor virtual donde puedes guardar fotos, videos, mensajes y otros recuerdos digitales para abrirlos en una fecha futura específica."
    },
    {
      id: 2,
      question: "¿Cómo creo una nueva cápsula?",
      answer: "Para crear una nueva cápsula, haz clic en el botón 'Nueva Cápsula' en tu panel principal. Luego, podrás subir contenido, establecer una fecha de apertura y elegir los destinatarios."
    },
    // ... más preguntas frecuentes
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-4xl text-[#F5E050] passero-font mb-4">
          Centro de Ayuda
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Encuentra respuestas a tus preguntas y aprende a sacar el máximo provecho 
          de tus cápsulas del tiempo digitales.
        </p>
      </div>

      {/* Categorías de ayuda */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#2E2E7A] p-6 rounded-xl text-center">
          <FontAwesomeIcon icon={faBook} className="text-[#F5E050] text-3xl mb-4" />
          <h2 className="text-[#F5E050] passero-font text-xl mb-2">Guías</h2>
          <p className="text-gray-300">
            Tutoriales paso a paso para usar todas las funciones.
          </p>
        </div>

        <div className="bg-[#2E2E7A] p-6 rounded-xl text-center">
          <FontAwesomeIcon icon={faHeadset} className="text-[#F5E050] text-3xl mb-4" />
          <h2 className="text-[#F5E050] passero-font text-xl mb-2">Soporte</h2>
          <p className="text-gray-300">
            Contacta con nuestro equipo de soporte 24/7.
          </p>
        </div>

        <div className="bg-[#2E2E7A] p-6 rounded-xl text-center">
          <FontAwesomeIcon icon={faEnvelope} className="text-[#F5E050] text-3xl mb-4" />
          <h2 className="text-[#F5E050] passero-font text-xl mb-2">Contacto</h2>
          <p className="text-gray-300">
            Envíanos tus dudas o sugerencias.
          </p>
        </div>
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl text-[#F5E050] passero-font mb-6">
          Preguntas Frecuentes
        </h2>
        
        <div className="space-y-4">
          {faqs.map(faq => (
            <div 
              key={faq.id}
              className="bg-[#2E2E7A] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenQuestion(openQuestion === faq.id ? null : faq.id)}
                className="w-full px-6 py-4 text-left flex justify-between items-center text-white hover:text-[#F5E050]"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon icon={faQuestionCircle} />
                  {faq.question}
                </span>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`transition-transform ${openQuestion === faq.id ? 'rotate-180' : ''}`}
                />
              </button>
              
              {openQuestion === faq.id && (
                <div className="px-6 py-4 text-gray-300 bg-[#1a1a4a]">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Ayuda;