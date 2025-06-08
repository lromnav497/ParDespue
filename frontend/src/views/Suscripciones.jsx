import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faCrown, faUser } from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../helpers/fetchWithAuth';
import { useLocation } from 'react-router-dom';
import Modal from '../components/modals/Modal';

const Suscripciones = () => {
  const [billing, setBilling] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Básico');
  const [stripePrices, setStripePrices] = useState([]);
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const location = useLocation();

  // Obtiene los precios de Stripe al montar
  useEffect(() => {
    fetch('/api/subscriptions/stripe-prices')
      .then(res => res.json())
      .then(data => {
        setStripePrices(data);
      });
  }, []);

  // Consulta el plan actual del usuario al montar
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token') || user?.token;
    if (!token) return;
    fetch('/api/subscriptions/my-plan', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.suscripcion && data.suscripcion.nombre) {
          setCurrentPlan(data.suscripcion.nombre); // "Premium" o "Básico"
        }
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('success')) {
      setMensaje('¡Pago realizado correctamente! Tu suscripción Premium está activa.');
      // Llama al backend para registrar la suscripción y transacción
      const token = localStorage.getItem('token');
      fetch('/api/subscriptions/activate-premium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ billing })
      })
        .then(res => res.json())
        .then(() => window.dispatchEvent(new Event('user-updated')));
    }
    if (params.get('canceled')) {
      setMensaje('El pago fue cancelado.');
    }
  }, [location.search]);

  // Mapea los precios de Stripe a tus planes
  const getStripePrice = (interval) => {
    const price = stripePrices.find(
      p => p.recurring && p.recurring.interval === interval
    );
    return price
      ? {
          id: price.id,
          amount: (price.unit_amount / 100).toFixed(2),
          interval: price.recurring?.interval
        }
      : null;
  };

  const plans = [
    {
      name: "Básico",
      icon: faUser,
      price: 0,
      features: [
        "15 cápsulas del tiempo",
        "500 MB de almacenamiento",
        "Todo tipo de contenido",
      ],
      cta: "Comenzar Gratis",
      popular: false
    },
    {
      name: "Premium",
      icon: faCrown,
      price: getStripePrice(billing === 'monthly' ? 'month' : 'year')?.amount,
      features: [
        "Cápsulas ilimitadas",
        "50 GB de almacenamiento",
        "Todo tipo de contenido",
        "Editar cápsulas antes de su apertura"
      ],
      cta: "Obtener Premium",
      popular: true,
      stripePriceId: getStripePrice(billing === 'monthly' ? 'month' : 'year')?.id
    }
  ];

  const handleSubscribe = async (plan) => {
    setLoading(true);
    setMensaje('');
    setSelectedPlan(plan.name);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token') || user?.token;

    if (!token) {
      setModal({
        open: true,
        title: 'Aviso',
        message: 'Debes iniciar sesión para cambiar de plan.'
      });
      setLoading(false);
      return;
    }

    if (plan.name === "Premium") {
      try {
        const res = await fetchWithAuth('/api/subscriptions/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            plan: plan.name,
            billing,
            priceId: plan.stripePriceId
          })
        });
        const data = await res.json();
        if (res.ok && data.url) {
          window.location.href = data.url;
        } else {
          setModal({
            open: true,
            title: 'Error',
            message: 'Error al iniciar el pago con Stripe'
          });
          setLoading(false);
        }
      } catch (err) {
        setModal({
          open: true,
          title: 'Error',
          message: 'Error de conexión con Stripe'
        });
        setLoading(false);
      }
      return;
    }

    setTimeout(() => {
      setModal({
        open: true,
        title: 'Aviso',
        message: '¡Ya tienes el plan Básico activado!'
      });
      setLoading(false);
    }, 1000);
  };

  if (plans[1].name === "Premium" && !plans[1].price) {
    return <div className="text-center text-white animate-fade-in">Cargando precios de Stripe...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6 drop-shadow-lg">
            Planes y Precios
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-8">
            Elige el plan perfecto para preservar tus recuerdos más valiosos
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className={`text-lg ${billing === 'monthly' ? 'text-[#F5E050]' : 'text-gray-400'} transition-colors`}>
              Mensual
            </span>
            <button
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 bg-[#2E2E7A] rounded-full p-1 transition-colors shadow-inner focus:outline-none focus:ring-2 focus:ring-[#F5E050]/60"
            >
              <div className={`w-6 h-6 bg-[#F5E050] rounded-full shadow transition-transform duration-300 ${
                billing === 'annual' ? 'translate-x-8' : ''
              }`} />
            </button>
            <span className={`text-lg ${billing === 'annual' ? 'text-[#F5E050]' : 'text-gray-400'} transition-colors`}>
              Anual
              <span className="ml-2 text-sm text-green-400 animate-pulse">-15%</span>
            </span>
          </div>
        </div>

        {/* Mensaje de compra */}
        {mensaje && (
          <div className="max-w-xl mx-auto mb-8 text-center animate-fade-in-up">
            <div className="bg-[#1a1a4a] text-[#F5E050] p-4 rounded-lg shadow-lg">{mensaje}</div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in-up">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#2E2E7A] rounded-xl p-8 relative shadow-xl group transition-transform duration-300 hover:scale-105 ${
                plan.popular ? 'transform md:-translate-y-4 ring-4 ring-[#F5E050]/40' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-[#F5E050] text-[#2E2E7A] px-4 py-1 rounded-full text-sm font-semibold shadow">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <FontAwesomeIcon
                  icon={plan.icon}
                  className="text-[#F5E050] text-4xl mb-4 drop-shadow-lg animate-bounce-slow"
                />
                <h3 className="text-2xl text-[#F5E050] passero-font mb-4 drop-shadow">
                  {plan.name}
                </h3>
                <div className="text-white mb-4">
                  {plan.name === "Básico" ? (
                    <span className="text-4xl font-bold">Gratis</span>
                  ) : plan.price ? (
                    <span className="text-4xl font-bold">
                      {Number(plan.price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  ) : (
                    <span className="text-4xl font-bold">Cargando...</span>
                  )}
                  {plan.name === "Premium" && plan.price && (
                    <span className="text-gray-400 ml-2">
                      /{billing === 'monthly' ? 'mes' : 'año'}
                    </span>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center text-gray-300">
                    <FontAwesomeIcon
                      icon={faCheck}
                      className="text-[#F5E050] mr-2 animate-fade-in"
                    />
                    <span className="transition-colors group-hover:text-[#F5E050]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Botón: deshabilita si ya tiene el plan */}
              <button
                className={`w-full py-3 rounded-full transition-all duration-200 font-bold shadow-lg ${
                  plan.popular
                    ? 'bg-[#F5E050] text-[#2E2E7A] hover:bg-[#e6d047] scale-105'
                    : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e]'
                } ${loading && selectedPlan === plan.name ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={
                  loading ||
                  (currentPlan === "premium") ||
                  (plan.name === "Básico" && currentPlan === "Básico")
                }
                onClick={() => handleSubscribe(plan)}
              >
                {loading && selectedPlan === plan.name
                  ? 'Procesando...'
                  : currentPlan === "premium"
                    ? 'Ya tienes Premium'
                    : (plan.name === "Básico" && currentPlan === "Básico")
                      ? 'Ya tienes Básico'
                      : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24 animate-fade-in-up">
          <h2 className="text-3xl text-[#F5E050] passero-font text-center mb-8 drop-shadow-lg">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div className="bg-[#2E2E7A] rounded-xl p-6 shadow-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-[#F5E050] text-xl mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-300">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. 
                Los cambios se aplicarán inmediatamente.
              </p>
            </div>
            <div className="bg-[#2E2E7A] rounded-xl p-6 shadow-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-[#F5E050] text-xl mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-300">
                Aceptamos todas las tarjetas de crédito principales, PayPal y 
                transferencias bancarias para planes empresariales.
              </p>
            </div>
            <div className="bg-[#2E2E7A] rounded-xl p-6 shadow-lg transition-transform hover:scale-[1.02]">
              <h3 className="text-[#F5E050] text-xl mb-2">
                ¿Ofrecen reembolsos?
              </h3>
              <p className="text-gray-300">
                Sí, ofrecemos una garantía de devolución de dinero de 30 días 
                si no estás satisfecho con nuestro servicio.
              </p>
            </div>
          </div>
        </div>

        {/* Modal general */}
        <Modal
          isOpen={modal.open}
          onClose={() => setModal({ open: false, title: '', message: '' })}
          title={modal.title}
        >
          <div>{modal.message}</div>
        </Modal>
      </div>
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
};

export default Suscripciones;