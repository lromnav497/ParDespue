import React from 'react';
import Modal from './Modal';

const VerifyEmailModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="¡Revisa tu correo!">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#2E2E7A] mb-4">¡Revisa tu correo!</h2>
        <p className="mb-4 text-gray-700">
          Te enviamos un enlace para verificar tu cuenta. Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        <button
          className="bg-[#F5E050] text-[#2E2E7A] font-bold px-6 py-2 rounded hover:bg-[#e6d047]"
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
};

export default VerifyEmailModal;