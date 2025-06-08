import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCookie } from '@fortawesome/free-solid-svg-icons';

const CookiesModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleAccept = () => {
    localStorage.setItem('cookies-accepted', 'true');
    onClose();
  };

  const handleReject = () => {
    localStorage.setItem('cookies-accepted', 'false');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#2E2E7A] rounded-xl max-w-2xl w-full shadow-2xl border border-[#F5E050]/30 animate-fade-in-up">
        <div className="flex justify-between items-center p-6 border-b border-[#3d3d9e]">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faCookie} className="text-[#F5E050] text-2xl animate-bounce-slow" />
            <h2 className="text-2xl text-[#F5E050] passero-font drop-shadow">Política de Cookies</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-[#F5E050]"
            aria-label="Cerrar"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
        
        <div className="p-6 text-white space-y-6">
          <section className="animate-fade-in-up">
            <h3 className="text-[#F5E050] text-xl mb-2 font-semibold">¿Qué son las Cookies?</h3>
            <p className="text-gray-300">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo 
              cuando visita nuestro sitio web.
            </p>
          </section>

          <section className="animate-fade-in-up delay-100">
            <h3 className="text-[#F5E050] text-xl mb-2 font-semibold">Tipos de Cookies que Usamos</h3>
            <ul className="list-disc pl-6 text-gray-300 space-y-1">
              <li>Cookies esenciales para el funcionamiento del sitio</li>
              <li>Cookies analíticas para mejorar nuestro servicio</li>
              <li>Cookies de preferencias para recordar sus ajustes</li>
            </ul>
          </section>

          <section className="animate-fade-in-up delay-200">
            <h3 className="text-[#F5E050] text-xl mb-2 font-semibold">Sus Opciones</h3>
            <p className="text-gray-300">
              Puede controlar y/o eliminar las cookies según desee. Puede eliminar todas 
              las cookies que ya están en su computadora y configurar la mayoría de los 
              navegadores para que las bloqueen.
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-[#3d3d9e] flex flex-col sm:flex-row justify-end gap-4 animate-fade-in-up">
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-[#F5E050] text-[#2E2E7A] rounded-full hover:bg-[#e6d047] transition-all shadow font-bold focus:outline-none focus:ring-2 focus:ring-[#F5E050]"
          >
            Aceptar Cookies
          </button>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 0.7s; }
          .animate-fade-in-up { animation: fadeInUp 0.8s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
};

export default CookiesModal;