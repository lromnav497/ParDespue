import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMeta, // New Meta icon
  faXTwitter, // New X (Twitter) icon
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import { useState } from 'react';
import CookiesModal from '../modals/CookiesModal';

const Footer = () => {
  const [showCookies, setShowCookies] = useState(false);

  const handleAcceptCookies = () => {
    // Aquí puedes agregar la lógica para manejar la aceptación de cookies
    localStorage.setItem('cookies-accepted', 'true');
  };

  return (
    <footer className="bg-[#1a1a4a] text-gray-300 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-[#F5E050] passero-font text-xl mb-4">TimeCapsule</h2>
            <p className="mb-4">Preservando momentos especiales para el futuro</p>
          </div>
          
          <div>
            <h3 className="text-[#F5E050] font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-[#F5E050]">Sobre nosotros</Link></li>
              <li><Link to="/features" className="hover:text-[#F5E050]">Características</Link></li>
              <li>
                <Link to="/suscripciones" className="hover:text-[#F5E050]">Suscripciones</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#F5E050] font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-[#F5E050]">Privacidad</Link></li>
              <li><Link to="/terms" className="hover:text-[#F5E050]">Términos</Link></li>
              <li>
                <button 
                  onClick={() => setShowCookies(true)}
                  className="hover:text-[#F5E050] transition-colors"
                >
                  Cookies
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-[#F5E050] font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-4 justify-center md:justify-start">
              <a href="#" className="hover:text-[#F5E050] text-xl">
                <FontAwesomeIcon icon={faMeta} />
              </a>
              <a href="#" className="hover:text-[#F5E050] text-xl">
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a href="#" className="hover:text-[#F5E050] text-xl">
                <FontAwesomeIcon icon={faInstagram} />
              </a>
            </div>
          </div>
        </div>
        
        <CookiesModal 
          isOpen={showCookies} 
          onClose={() => setShowCookies(false)}
          onAccept={handleAcceptCookies}
        />

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p>&copy; {new Date().getFullYear()} TimeCapsule. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;