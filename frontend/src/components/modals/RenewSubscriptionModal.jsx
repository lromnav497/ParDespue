import React from 'react';
import Modal from './Modal';

const RenewSubscriptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  renewMonths,
  setRenewMonths,
  loading,
  suscripcion,
  token,
  plan
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (loading) return;
    onConfirm();
    try {
      await fetch(`/api/subscriptions/renew/${suscripcion.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ months: renewMonths })
      });
    } catch (error) {
      console.error('Error al renovar la suscripción:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renovar Suscripción">
      <div className="p-6 animate-fade-in-up">
        <h3 className="text-2xl font-bold mb-4 text-[#F5E050] passero-font drop-shadow animate-fade-in-down">
          Renovar Suscripción
        </h3>
        <div className="mb-4">
          <label className="block mb-2 text-gray-300 font-semibold">
            ¿Por cuántos meses quieres renovar?
          </label>
          <select
            className="w-full bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all shadow-inner"
            value={renewMonths}
            onChange={e => setRenewMonths(Number(e.target.value))}
          >
            <option value={1}>1 mes</option>
            <option value={3}>3 meses</option>
            <option value={6}>6 meses</option>
            <option value={12}>12 meses</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-gray-400"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded-full bg-[#F5E050] text-[#2E2E7A] font-bold hover:bg-[#e6d047] transition-all shadow focus:outline-none focus:ring-2 focus:ring-[#F5E050] scale-100 hover:scale-105"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-[#2E2E7A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#2E2E7A" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="#2E2E7A" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Renovando...
              </span>
            ) : (
              'Confirmar'
            )}
          </button>
        </div>
      </div>
      <style>
        {`
          .animate-fade-in-up { animation: fadeInUp 0.7s; }
          .animate-fade-in-down { animation: fadeInDown 0.7s; }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
        `}
      </style>
    </Modal>
  );
};

export default RenewSubscriptionModal;