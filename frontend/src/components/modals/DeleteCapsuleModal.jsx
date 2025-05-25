import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const DeleteCapsuleModal = ({ isOpen, onClose, onConfirm, capsuleName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#2E2E7A] rounded-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <FontAwesomeIcon 
            icon={faExclamationTriangle} 
            className="text-red-500 text-5xl mb-4"
          />
          <h2 className="text-2xl text-[#F5E050] passero-font mb-4">
            Eliminar Cápsula
          </h2>
          <p className="text-white mb-6">
            ¿Estás seguro que deseas eliminar la cápsula "{capsuleName}"? 
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#1a1a4a] text-white rounded-full hover:bg-[#3d3d9e]"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteCapsuleModal;