import React from 'react';

const VerifyEmailModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-[#2E2E7A] rounded-xl p-8 max-w-sm w-full shadow-lg text-center relative">
        <button
          className="absolute top-3 right-3 text-[#F5E050] text-2xl font-bold hover:text-yellow-400"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-[#F5E050] mb-4 passero-font">¡Revisa tu correo!</h2>
        <p className="mb-6 text-white">
          Te enviamos un enlace para verificar tu cuenta.<br />
          Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
        </p>
        <button
          className="bg-[#F5E050] text-[#2E2E7A] font-bold px-6 py-2 rounded-full hover:bg-[#e6d047] transition"
          onClick={onClose}
        >
          Entendido
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailModal;