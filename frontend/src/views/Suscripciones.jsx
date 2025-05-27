import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCheck, 
  faCrown, 
  faRocket, 
  faUser,
  faInfinity
} from '@fortawesome/free-solid-svg-icons';

const Suscripciones = () => {
  const [billing, setBilling] = useState('monthly');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState('Básico');

  // Consulta el plan actual del usuario al montar
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token || localStorage.getItem('token');
    if (!token) return;
    fetch('/api/subscriptions/my-plan', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.plan) setCurrentPlan(data.plan);
      });
  }, []);

  const plans = [
    {
      name: "Básico",
      icon: faUser,
      price: billing === 'monthly' ? 0 : 0,
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
      price: billing === 'monthly' ? 9.99 : 99.99,
      features: [
        "Cápsulas ilimitadas",
        "50 GB de almacenamiento",
        "Todo tipo de contenido",
        "Editar cápsulas antes de su apertura"
      ],
      cta: "Obtener Premium",
      popular: true
    }
  ];

  // Simula la compra o cambio de plan
  const handleSubscribe = async (plan) => {
    setLoading(true);
    setMensaje('');
    setSelectedPlan(plan.name);

    const user = JSON.parse(localStorage.getItem('user'));
    const token = user?.token || localStorage.getItem('token');

    if (!token) {
      setMensaje('Debes iniciar sesión para cambiar de plan.');
      setLoading(false);
      return;
    }

    // Simulación de espera de compra
    setTimeout(async () => {
      if (plan.price === 0) {
        setMensaje("¡Ya tienes el plan Básico activado!");
      } else if (currentPlan === "Premium" && plan.name === "Premium") {
        setMensaje("¡Ya tienes el plan Premium activo!");
      } else {
        // Cambia el plan en el backend
        const res = await fetch('/api/subscriptions/change-plan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ plan: plan.name })
        });
        if (res.ok) {
          setMensaje(`¡Has adquirido el plan ${plan.name} (${billing === 'monthly' ? 'Mensual' : 'Anual'}) correctamente!`);
          setCurrentPlan(plan.name); // Actualiza el plan actual
        } else {
          setMensaje('Error al cambiar de plan');
        }
      }
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl text-[#F5E050] passero-font mb-6">
            Planes y Precios
          </h1>
          <p className="text-gray-300 text-xl max-w-2xl mx-auto mb-8">
            Elige el plan perfecto para preservar tus recuerdos más valiosos
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-lg ${billing === 'monthly' ? 'text-[#F5E050]' : 'text-gray-400'}`}>
              Mensual
            </span>
            <button 
              onClick={() => setBilling(billing === 'monthly' ? 'annual' : 'monthly')}
              className="relative w-16 h-8 bg-[#2E2E7A] rounded-full p-1 transition-colors"
            >
              <div className={`w-6 h-6 bg-[#F5E050] rounded-full transition-transform ${
                billing === 'annual' ? 'translate-x-8' : ''
              }`} />
            </button>
            <span className={`text-lg ${billing === 'annual' ? 'text-[#F5E050]' : 'text-gray-400'}`}>
              Anual
              <span className="ml-2 text-sm text-green-400">-15%</span>
            </span>
          </div>
        </div>

        {/* Mensaje de compra */}
        {mensaje && (
          <div className="max-w-xl mx-auto mb-8 text-center">
            <div className="bg-[#1a1a4a] text-[#F5E050] p-4 rounded-lg shadow">{mensaje}</div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#2E2E7A] rounded-xl p-8 relative ${
                plan.popular ? 'transform md:-translate-y-4' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#F5E050] text-[#2E2E7A] px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <FontAwesomeIcon
                  icon={plan.icon}
                  className="text-[#F5E050] text-4xl mb-4"
                />
                <h3 className="text-2xl text-[#F5E050] passero-font mb-4">
                  {plan.name}
                </h3>
                <div className="text-white mb-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
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
                      className="text-[#F5E050] mr-2"
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Botón: deshabilita si ya tiene el plan */}
              <button
                className={`w-full py-3 rounded-full transition-colors ${
                  plan.popular
                    ? 'bg-[#F5E050] text-[#2E2E7A] hover:bg-[#e6d047]'
                    : 'bg-[#1a1a4a] text-white hover:bg-[#3d3d9e]'
                } ${loading && selectedPlan === plan.name ? 'opacity-60 cursor-not-allowed' : ''}`}
                disabled={
                  loading ||
                  (plan.name === "Premium" && currentPlan === "Premium") ||
                  (plan.name === "Básico" && currentPlan === "Básico")
                }
                onClick={() => handleSubscribe(plan)}
              >
                {loading && selectedPlan === plan.name
                  ? 'Procesando...'
                  : (plan.name === "Premium" && currentPlan === "Premium")
                    ? 'Ya tienes Premium'
                    : (plan.name === "Básico" && currentPlan === "Básico")
                      ? 'Ya tienes Básico'
                      : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mt-24">
          <h2 className="text-3xl text-[#F5E050] passero-font text-center mb-8">
            Preguntas Frecuentes
          </h2>
          <div className="space-y-6">
            <div className="bg-[#2E2E7A] rounded-xl p-6">
              <h3 className="text-[#F5E050] text-xl mb-2">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-300">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. 
                Los cambios se aplicarán inmediatamente.
              </p>
            </div>
            <div className="bg-[#2E2E7A] rounded-xl p-6">
              <h3 className="text-[#F5E050] text-xl mb-2">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-300">
                Aceptamos todas las tarjetas de crédito principales, PayPal y 
                transferencias bancarias para planes empresariales.
              </p>
            </div>
            <div className="bg-[#2E2E7A] rounded-xl p-6">
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
      </div>
    </div>
  );
};

export default Suscripciones;