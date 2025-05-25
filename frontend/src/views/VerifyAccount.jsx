import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useParams, Link } from 'react-router-dom';

const VerifyAccount = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] = useState('verifying');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        // Simular verificación
        await new Promise(resolve => setTimeout(resolve, 2000));
        setVerificationStatus('success');
      } catch (error) {
        setVerificationStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  const getStatusContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return {
          icon: faSpinner,
          title: 'Verificando cuenta...',
          message: 'Por favor espera mientras verificamos tu cuenta.',
          iconClass: 'text-[#F5E050] animate-spin'
        };
      case 'success':
        return {
          icon: faCheckCircle,
          title: '¡Cuenta Verificada!',
          message: 'Tu cuenta ha sido verificada exitosamente.',
          iconClass: 'text-green-400'
        };
      case 'error':
        return {
          icon: faTimesCircle,
          title: 'Error de verificación',
          message: 'No pudimos verificar tu cuenta. El enlace puede haber expirado.',
          iconClass: 'text-red-400'
        };
      default:
        return {
          icon: faTimesCircle,
          title: 'Error',
          message: 'Algo salió mal',
          iconClass: 'text-red-400'
        };
    }
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="bg-[#2E2E7A] time-capsule rounded-xl p-8 max-w-md w-full shadow-lg transform transition-all">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-[#1a1a4a] p-4 rounded-full border-4 border-[#F5E050]">
              <FontAwesomeIcon 
                icon={content.icon} 
                className={`text-4xl icon-highlight ${content.iconClass}`} 
              />
            </div>
          </div>
          <h2 className="passero-font text-3xl md:text-4xl text-[#F5E050] mb-4">
            {content.title}
          </h2>
          <p className="text-gray-300 mb-8">
            {content.message}
          </p>
        </div>

        {verificationStatus !== 'verifying' && (
          <div className="flex justify-center">
            <Link
              to="/login"
              className="bg-[#F5E050] hover:bg-[#e6d047] text-[#2E2E7A] font-bold py-3 px-8 rounded-full transition transform hover:scale-105 flex items-center"
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
              Ir al Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;