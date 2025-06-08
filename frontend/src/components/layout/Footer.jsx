import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMeta,
  faXTwitter,
  faInstagram 
} from '@fortawesome/free-brands-svg-icons';
import { useState } from 'react';
import CookiesModal from '../modals/CookiesModal';

const Footer = () => {
  const [showCookies, setShowCookies] = useState(false);

  const handleAcceptCookies = () => {
    localStorage.setItem('cookies-accepted', 'true');
  };

  return (
    <footer className="bg-[#1a1a4a] text-gray-300 py-10 animate-fade-in-up">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="text-center md:text-left animate-fade-in-down">
            <h2 className="text-[#F5E050] passero-font text-2xl mb-4 drop-shadow">ParDespue</h2>
            <p className="mb-4 text-gray-400">Preservando momentos especiales para el futuro</p>
          </div>
          
          <div className="animate-fade-in-up delay-100">
            <h3 className="text-[#F5E050] font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="hover:text-[#F5E050] transition-colors">Sobre nosotros</Link></li>
              <li><Link to="/features" className="hover:text-[#F5E050] transition-colors">Características</Link></li>
              <li>
                <Link to="/suscripciones" className="hover:text-[#F5E050] transition-colors">Suscripciones</Link>
              </li>
            </ul>
          </div>

          <div className="animate-fade-in-up delay-200">
            <h3 className="text-[#F5E050] font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="hover:text-[#F5E050] transition-colors">Privacidad</Link></li>
              <li><Link to="/terms" className="hover:text-[#F5E050] transition-colors">Términos</Link></li>
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

          <div className="animate-fade-in-up delay-300">
            <h3 className="text-[#F5E050] font-semibold mb-4">Síguenos</h3>
            <div className="flex space-x-6 justify-center md:justify-start">
              <a href="#" className="hover:text-[#F5E050] text-2xl transition-transform duration-200 hover:scale-125">
                <FontAwesomeIcon icon={faMeta} />
              </a>
              <a href="#" className="hover:text-[#F5E050] text-2xl transition-transform duration-200 hover:scale-125">
                <FontAwesomeIcon icon={faXTwitter} />
              </a>
              <a href="#" className="hover:text-[#F5E050] text-2xl transition-transform duration-200 hover:scale-125">
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

        <div className="border-t border-gray-700 pt-8 text-center animate-fade-in">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} <span className="text-[#F5E050] font-bold">ParDespue</span>. Todos los derechos reservados.</p>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
          .delay-300 { animation-delay: 0.3s; }
          .animate-fade-in { animation: fadeIn 1.2s; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}
      </style>
    </footer>
  );
};

export default Footer;