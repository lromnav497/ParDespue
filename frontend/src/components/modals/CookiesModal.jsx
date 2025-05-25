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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-[#2E2E7A] rounded-xl max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b border-[#3d3d9e]">
          <div className="flex items-center gap-3">
            <FontAwesomeIcon icon={faCookie} className="text-[#F5E050] text-2xl" />
            <h2 className="text-2xl text-[#F5E050] passero-font">Política de Cookies</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-xl" />
          </button>
        </div>
        
        <div className="p-6 text-white space-y-4">
          <section>
            <h3 className="text-[#F5E050] text-xl mb-2">¿Qué son las Cookies?</h3>
            <p className="text-gray-300">
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo 
              cuando visita nuestro sitio web.
            </p>
          </section>

          <section>
            <h3 className="text-[#F5E050] text-xl mb-2">Tipos de Cookies que Usamos</h3>
            <ul className="list-disc pl-6 text-gray-300">
              <li>Cookies esenciales para el funcionamiento del sitio</li>
              <li>Cookies analíticas para mejorar nuestro servicio</li>
              <li>Cookies de preferencias para recordar sus ajustes</li>
            </ul>
          </section>

          <section>
            <h3 className="text-[#F5E050] text-xl mb-2">Sus Opciones</h3>
            <p className="text-gray-300">
              Puede controlar y/o eliminar las cookies según desee. Puede eliminar todas 
              las cookies que ya están en su computadora y configurar la mayoría de los 
              navegadores para que las bloqueen.
            </p>
          </section>
        </div>

        <div className="p-6 border-t border-[#3d3d9e] flex justify-end gap-4">
          <button
            onClick={handleReject}
            className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-6 py-2 bg-[#F5E050] text-[#2E2E7A] rounded-full hover:bg-[#e6d047] transition-colors"
          >
            Aceptar Cookies
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookiesModal;