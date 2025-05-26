import { useState, useEffect } from 'react';

const PasswordModal = ({ isOpen, onClose, onSubmit, error }) => {
  const [password, setPassword] = useState('');

  // Limpia el input cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) setPassword('');
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-[#2E2E7A] rounded-xl p-6 max-w-xs w-full mx-4">
        <h2 className="text-xl text-[#F5E050] mb-4 text-center">Introduce la contraseña actual</h2>
        <input
          type="password"
          className="w-full mb-4 px-3 py-2 rounded bg-[#1a1a4a] text-white"
          placeholder="Contraseña actual"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        {error && <div className="text-red-400 text-sm mb-2">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={onClose}
          >Cancelar</button>
          <button
            className="px-4 py-2 bg-[#F5E050] text-[#2E2E7A] rounded hover:bg-[#e6d047]"
            onClick={() => onSubmit(password)}
          >Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default PasswordModal;