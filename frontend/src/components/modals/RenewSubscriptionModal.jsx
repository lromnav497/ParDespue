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
        body: JSON.stringify({ months: renewMonths }) // Solo meses, sin Stripe
      });
    } catch (error) {
      console.error('Error al renovar la suscripción:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Renovar Suscripción">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-4">Renovar Suscripción</h3>
        <label className="block mb-2 text-gray-300">¿Por cuántos meses quieres renovar?</label>
        <select
          className="w-full mb-4 bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
          value={renewMonths}
          onChange={e => setRenewMonths(Number(e.target.value))}
        >
          <option value={1}>1 mes</option>
          <option value={3}>3 meses</option>
          <option value={6}>6 meses</option>
          <option value={12}>12 meses</option>
        </select>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-500 text-white"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-[#F5E050] text-[#2E2E7A] font-bold"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Renovando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RenewSubscriptionModal;