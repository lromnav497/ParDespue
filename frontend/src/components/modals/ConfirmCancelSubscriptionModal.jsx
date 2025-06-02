import Modal from './Modal';

const ConfirmCancelSubscriptionModal = ({ isOpen, onClose, onConfirm, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cancelar Suscripción">
      <div className="p-4 text-center">
        <p className="mb-6 text-white">
          ¿Seguro que quieres cancelar tu suscripción? Perderás los beneficios de tu plan actual.
        </p>
        <div className="flex justify-center gap-4">
          <button
            className="px-4 py-2 rounded bg-gray-500 text-white"
            onClick={onClose}
            disabled={loading}
          >
            No, volver
          </button>
          <button
            className="px-4 py-2 rounded bg-red-600 text-white font-bold"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Cancelando...' : 'Sí, cancelar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmCancelSubscriptionModal;