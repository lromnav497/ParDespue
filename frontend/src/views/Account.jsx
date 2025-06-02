import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faCreditCard, 
  faBoxArchive,
  faGear,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import RenewSubscriptionModal from '../components/modals/RenewSubscriptionModal';
import MisCapsulas from './MisCapsulas'; // Asegúrate de que la ruta es correcta

const Account = () => {
  const [activeSection, setActiveSection] = useState('general');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('suscripciones')) setActiveSection('suscripciones');
    else if (params.has('capsulas')) setActiveSection('capsulas');
    else if (params.has('configuracion')) setActiveSection('configuracion');
    else setActiveSection('general');
  }, [location.search]);

  const menuItems = [
    { id: 'general', title: 'Información General', icon: faUser },
    { id: 'suscripciones', title: 'Mis Suscripciones', icon: faCreditCard },
    { id: 'capsulas', title: 'Mis Cápsulas', icon: faBoxArchive },
    { id: 'configuracion', title: 'Configuración', icon: faGear }
  ];

  const handleSectionChange = (id) => {
    setActiveSection(id);
    let search = '';
    if (id !== 'general') search = `?${id}`;
    navigate({ pathname: location.pathname, search });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <InformacionGeneral />;
      case 'suscripciones':
        return <MisSuscripciones />;
      case 'capsulas':
        return <MisCapsulas />; // Usa el componente real aquí
      case 'configuracion':
        return <Configuracion />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#2E2E7A] time-capsule">
        <div className="p-6">
          <h2 className="text-[#F5E050] passero-font text-xl mb-6">Mi Cuenta</h2>
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all
                  ${activeSection === item.id 
                    ? 'bg-[#1a1a4a] text-[#F5E050]' 
                    : 'text-gray-300 hover:bg-[#1a1a4a]/50'}`}
              >
                <div className="flex items-center">
                  <FontAwesomeIcon icon={item.icon} className="mr-3" />
                  <span>{item.title}</span>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className={`transition-transform ${
                    activeSection === item.id ? 'transform rotate-90' : ''
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8">
        <div className="bg-[#2E2E7A] time-capsule rounded-xl p-6 min-h-[calc(100vh-4rem)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    // Normaliza claves
    return {
      id: user.id || user.User_ID,
      name: user.name || user.Name,
      email: user.email || user.Email,
      role: user.role || user.Role,
    };
  } catch {
    return null;
  }
};

// Componentes de contenido
const InformacionGeneral = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sincroniza con localStorage al montar
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setName(storedUser.name || '');
    setEmail(storedUser.email || '');
    setLoading(false);
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const storedUser = getStoredUser();
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Name: name, Email: email }),
      });
      const data = await res.json();
      console.log('Respuesta backend:', data); // <-- Añade esto
      if (!res.ok) {
        setError(data.message || 'Error al actualizar');
        setLoading(false);
        return;
      }
      const user = data.user || {};
      const updatedUser = {
        id: user.id || user.User_ID,
        name: user.name || user.Name,
        email: user.email || user.Email,
        role: user.role || user.Role,
      };
      if (updatedUser.id) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setName(updatedUser.name);
        setEmail(updatedUser.email);
        setSuccess('Datos actualizados correctamente');
        window.dispatchEvent(new Event('user-updated')); // <-- Añade esto
      } else {
        setError('No se pudo actualizar el usuario en localStorage');
      }
      console.log('Usuario actualizado:', updatedUser);
      setLoading(false);
    } catch (err) {
      setError('Error de conexión');
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !repeatPassword) {
      setPasswordError('Completa todos los campos');
      return;
    }
    if (newPassword !== repeatPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    setPasswordLoading(true);
    try {
      const storedUser = getStoredUser();
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/${storedUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordError(data.message || 'Error al cambiar la contraseña');
        setPasswordLoading(false);
        return;
      }
      setPasswordSuccess('Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      setPasswordLoading(false);
    } catch (err) {
      setPasswordError('Error de conexión');
      setPasswordLoading(false);
    }
  };

  console.log(localStorage.getItem('user'));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F5E050]"></div>
      </div>
    );
  }

  return (
    <div className="text-white">
      <h3 className="text-2xl passero-font text-[#F5E050] mb-6">Información General</h3>
      <form className="space-y-6" onSubmit={handleSave}>
        <div className="bg-[#1a1a4a] p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#F5E050] flex items-center justify-center">
              <FontAwesomeIcon icon={faUser} className="text-[#2E2E7A] text-3xl" />
            </div>
            <div className="ml-4">
              <h4 className="passero-font text-xl">{name}</h4>
              <p className="text-gray-400">{email}</p>
            </div>
          </div>
          {error && <div className="text-red-400 mb-2">{error}</div>}
          {success && <div className="text-green-400 mb-2">{success}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4"
                required
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Correo</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="mt-4 bg-[#F5E050] text-[#2E2E7A] px-6 py-2 rounded-full font-bold"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Cambiar contraseña */}
      <div className="bg-[#1a1a4a] p-6 rounded-lg mt-8">
        <h4 className="text-lg font-semibold mb-4">Cambiar contraseña</h4>
        {passwordError && <div className="text-red-400 mb-2">{passwordError}</div>}
        {passwordSuccess && <div className="text-green-400 mb-2">{passwordSuccess}</div>}
        <form className="space-y-4" onSubmit={handlePasswordChange}>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Contraseña actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="w-full bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Repetir nueva contraseña</label>
            <input
              type="password"
              value={repeatPassword}
              onChange={e => setRepeatPassword(e.target.value)}
              className="w-full bg-[#2E2E7A] border border-[#3d3d9e] rounded-lg py-2 px-4"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-2 bg-[#F5E050] text-[#2E2E7A] px-6 py-2 rounded-full font-bold"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

const MisSuscripciones = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const storedUser = getStoredUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || (storedUser && storedUser.token);

        // Plan actual
        const planRes = await fetch(`/api/subscriptions/my-plan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const planData = await planRes.json();
        if (!planRes.ok) throw new Error(planData.message || 'Error al obtener el plan');
        setPlan(planData.plan || '');

        // Transacciones
        const txRes = await fetch(`/api/transactions/my-transactions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const txData = await txRes.json();
        if (!txRes.ok) throw new Error(txData.message || 'Error al obtener transacciones');
        setTransacciones(txData.transacciones || []);
      } catch (err) {
        setError(err.message || 'Error de conexión');
      }
      setLoading(false);
    };
    if (storedUser) fetchData();
  }, [storedUser && storedUser.id]);

  if (loading) return <div className="text-white">Cargando...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="text-white">
      <h3 className="text-2xl passero-font text-[#F5E050] mb-6">Mis Suscripciones</h3>
      <div className="mb-4">
        <span className="font-semibold">Plan actual:</span>{' '}
        <span className="bg-[#F5E050] text-[#2E2E7A] px-3 py-1 rounded-full font-bold">{plan}</span>
      </div>
      <h4 className="text-xl mt-8 mb-4">Transacciones</h4>
      <div className="bg-[#1a1a4a] p-6 rounded-lg">
        {transacciones.length === 0 ? (
          <div>No hay transacciones registradas.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Fecha</th>
                <th className="py-2">Descripción</th>
                <th className="py-2">Monto</th>
                <th className="py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map(tx => (
                <tr key={tx.id}>
                  <td className="py-2">{tx.fecha}</td>
                  <td className="py-2">{tx.descripcion}</td>
                  <td className="py-2">{tx.monto}</td>
                  <td className="py-2">{tx.estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const Configuracion = () => (
  <div className="text-white">
    <h3 className="text-2xl passero-font text-[#F5E050] mb-6">Configuración</h3>
    <div className="space-y-4">
      <div className="bg-[#1a1a4a] p-6 rounded-lg">
        <h4 className="text-xl mb-4">Preferencias de notificación</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="form-checkbox text-[#F5E050]" />
            <span>Notificaciones por email</span>
          </label>
          <label className="flex items-center space-x-3">
            <input type="checkbox" className="form-checkbox text-[#F5E050]" />
            <span>Notificaciones push</span>
          </label>
        </div>
      </div>
    </div>
  </div>
);

export default Account;