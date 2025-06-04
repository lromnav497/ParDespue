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
import ConfirmCancelSubscriptionModal from '../components/modals/ConfirmCancelSubscriptionModal';
import MisCapsulas from './MisCapsulas'; // Asegúrate de que la ruta es correcta
import { fetchWithAuth } from '../helpers/fetchWithAuth';

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
  const [profilePicture, setProfilePicture] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);

  // Sincroniza con localStorage al montar
  useEffect(() => {
    const storedUser = getStoredUser();
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setName(storedUser.name || '');
    setEmail(storedUser.email || '');
    setProfilePicture(storedUser.profilePicture || storedUser.Profile_Picture || '');
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
      // Si hay nueva foto, primero súbela
      let updatedProfilePicture = profilePicture;
      if (newProfilePic) {
        const formData = new FormData();
        formData.append('profile_picture', newProfilePic);
        const resPic = await fetch(`/api/users/${storedUser.id}/profile-picture`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
        const dataPic = await resPic.json();
        if (resPic.ok && dataPic.profilePicture) {
          updatedProfilePicture = dataPic.profilePicture;
          setProfilePicture(updatedProfilePicture);
        }
      }
      // Ahora actualiza los datos de usuario
      const res = await fetch(`/api/users/${storedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ Name: name, Email: email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Error al actualizar');
        setLoading(false);
        return;
      }
      // Actualiza localStorage con la nueva foto si cambió
      const user = data.user || {};
      const updatedUser = {
        id: user.id || user.User_ID,
        name: user.name || user.Name,
        email: user.email || user.Email,
        role: user.role || user.Role,
        profilePicture: updatedProfilePicture,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setName(updatedUser.name);
      setEmail(updatedUser.email);
      setSuccess('Datos actualizados correctamente');
      window.dispatchEvent(new Event('user-updated'));
      setNewProfilePic(null);
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
            <label className="w-20 h-20 rounded-full bg-[#F5E050] flex items-center justify-center overflow-hidden cursor-pointer group relative">
              {profilePicture || newProfilePic ? (
                <img
                  src={
                    newProfilePic
                      ? URL.createObjectURL(newProfilePic)
                      : profilePicture.startsWith('http')
                        ? profilePicture
                        : `${profilePicture}`
                  }
                  alt="Foto de perfil"
                  className="w-full h-full object-cover group-hover:opacity-70 transition"
                />
              ) : (
                <FontAwesomeIcon icon={faUser} className="text-[#2E2E7A] text-3xl" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewProfilePic(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Cambiar foto de perfil"
              />
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs px-2 py-1 rounded opacity-80 group-hover:opacity-100 pointer-events-none">
                Cambiar foto
              </span>
            </label>
            <div className="ml-4">
              {/* Ya no hay botón de guardar foto */}
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
  const [suscripcion, setSuscripcion] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewLoading, setRenewLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const storedUser = getStoredUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || (storedUser && storedUser.token);

        // Plan y suscripción activa
        const planRes = await fetch(`/api/subscriptions/my-plan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const planData = await planRes.json();
        if (!planRes.ok) throw new Error(planData.message || 'Error al obtener el plan');
        setSuscripcion(planData.suscripcion || null);

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

  // Abrir modal al pulsar Renovar
  const handleRenew = () => {
    setShowRenewModal(true);
  };

  // Confirmar renovación
  const handleRenewConfirm = async () => {
    if (!suscripcion?.id) return;
    setRenewLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/subscriptions/renew/${suscripcion.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ months: renewMonths }) // <-- solo months
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al renovar');
      setShowRenewModal(false);
      setRenewLoading(false);
      // Refresca datos
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Error al renovar');
      setRenewLoading(false);
    }
  };

  // Cambiar el botón Cancelar para abrir el modal
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Nueva función para confirmar cancelación
  const handleCancelConfirm = async () => {
    if (!suscripcion?.id) return;
    setCancelLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/subscriptions/cancel/${suscripcion.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error al cancelar');
      setSuscripcion(null);
      setShowCancelModal(false);
      setCancelLoading(false);
      window.dispatchEvent(new Event('user-updated')); // Recarga el Header
    } catch (err) {
      setError(err.message || 'Error al cancelar');
      setCancelLoading(false);
    }
  };

  if (loading) return <div className="text-white">Cargando...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="text-white">
      <h3 className="text-2xl passero-font text-[#F5E050] mb-6">Mis Suscripciones</h3>
      {suscripcion ? (
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4">
          <div>
            <span className="font-semibold">Plan actual:</span>{' '}
            <span className="bg-[#F5E050] text-[#2E2E7A] px-3 py-1 rounded-full font-bold">
              {suscripcion.nombre.charAt(0).toUpperCase() + suscripcion.nombre.slice(1)}
            </span>
            <span className="ml-4 text-gray-400">
              Activo hasta: {new Date(suscripcion.fecha_fin).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-2 md:mt-0 flex gap-2">
            <button
              className="px-4 py-2 rounded bg-gray-500 text-white"
              onClick={() => setShowCancelModal(true)}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded bg-[#F5E050] text-[#2E2E7A] font-bold"
              onClick={handleRenew}
            >
              Renovar
            </button>
          </div>
        </div>
      ) : (
        <div className="mb-4">No tienes suscripción activa.</div>
      )}

      {/* Modal de renovación */}
      <RenewSubscriptionModal
        isOpen={showRenewModal}
        onClose={() => setShowRenewModal(false)}
        onConfirm={handleRenewConfirm}
        renewMonths={renewMonths}
        setRenewMonths={setRenewMonths}
        loading={renewLoading}
      />

      {/* Modal de confirmación de cancelación */}
      <ConfirmCancelSubscriptionModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        loading={cancelLoading}
      />

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