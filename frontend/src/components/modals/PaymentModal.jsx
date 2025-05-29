import { useState, useEffect } from 'react';

const PaymentModal = ({
  isOpen,
  onClose,
  onPay,
  loading
}) => {
  const [paymentData, setPaymentData] = useState({
    name: 'Juan Pérez',
    card: '4242424242424242',
    expiry: '12/25',
    cvv: '123'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentData({
        name: 'Juan Pérez',
        card: '4242424242424242',
        expiry: '12/25',
        cvv: '123'
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = e => {
    e.preventDefault();
    if (
      !paymentData.name ||
      !/^\d{16}$/.test(paymentData.card) ||
      !/^\d{2}\/\d{2}$/.test(paymentData.expiry) ||
      !/^\d{3,4}$/.test(paymentData.cvv)
    ) {
      setError('Por favor, rellena todos los campos correctamente.');
      return;
    }
    setError('');
    onPay(paymentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl mb-4 text-[#2E2E7A] font-bold">Datos de Pago</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-[#2E2E7A] mb-1">Nombre en la tarjeta</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={paymentData.name}
              onChange={e => setPaymentData({ ...paymentData, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#2E2E7A] mb-1">Número de tarjeta</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              maxLength={16}
              value={paymentData.card}
              onChange={e => setPaymentData({ ...paymentData, card: e.target.value.replace(/\D/g, '') })}
              required
            />
          </div>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-[#2E2E7A] mb-1">Expira (MM/AA)</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                maxLength={5}
                placeholder="MM/AA"
                value={paymentData.expiry}
                onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-[#2E2E7A] mb-1">CVV</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                maxLength={4}
                value={paymentData.cvv}
                onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value.replace(/\D/g, '') })}
                required
              />
            </div>
          </div>
          {error && <div className="text-red-500 mb-2">{error}</div>}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 text-gray-700"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#F5E050] text-[#2E2E7A] font-bold"
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Pagar y Suscribirse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;