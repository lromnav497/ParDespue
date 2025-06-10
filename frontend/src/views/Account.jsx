import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import RenewSubscriptionModal from '../components/modals/RenewSubscriptionModal';
import ConfirmCancelSubscriptionModal from '../components/modals/ConfirmCancelSubscriptionModal';
import MisCapsulas from './MisCapsulas';
import Modal from '../components/modals/Modal';
import PasswordModal from '../components/modals/PasswordModal';

// Agrega jsPDF y autoTable para exportar datos en PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Componente principal de la página de cuenta de usuario
const Account = () => {
  // Estado para la sección activa del menú lateral
  const [activeSection, setActiveSection] = useState('general');
  const location = useLocation();
  const navigate = useNavigate();

  // Cambia la sección activa según los parámetros de la URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.has('suscripciones')) setActiveSection('suscripciones');
    else if (params.has('capsulas')) setActiveSection('capsulas');
    else if (params.has('configuracion')) setActiveSection('configuracion');
    else setActiveSection('general');
  }, [location.search]);

  // Opciones del menú lateral con iconos y títulos
  const menuItems = [
    { id: 'general', title: 'Información General', icon: '/icons/user.svg' },
    { id: 'suscripciones', title: 'Mis Suscripciones', icon: '/icons/suscription.svg' },
    { id: 'capsulas', title: 'Mis Cápsulas', icon: '/icons/capsulas.svg' },
    { id: 'configuracion', title: 'Configuración', icon: '/icons/configuration.svg' }
  ];

  // Cambia la sección activa y actualiza la URL
  const handleSectionChange = (id) => {
    setActiveSection(id);
    let search = '';
    if (id !== 'general') search = `?${id}`;
    navigate({ pathname: location.pathname, search });
  };

  // Renderiza el contenido de la sección seleccionada
  const renderContent = () => {
    switch (activeSection) {
      case 'general':
        return <InformacionGeneral />;
      case 'suscripciones':
        return <MisSuscripciones />;
      case 'capsulas':
        return <MisCapsulas />;
      case 'configuracion':
        return <Configuracion />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] flex animate-fade-in">
      {/* Sidebar de navegación de la cuenta */}
      <div className="w-64 bg-[#2E2E7A] time-capsule shadow-2xl animate-fade-in-down">
        <div className="p-6">
          <h2 className="text-[#F5E050] passero-font text-xl mb-6 drop-shadow">Mi Cuenta</h2>
          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleSectionChange(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                  ${activeSection === item.id 
                    ? 'bg-[#1a1a4a] text-[#F5E050] scale-105 shadow-lg'
                    : 'text-gray-300 hover:bg-[#1a1a4a]/50 hover:scale-105'}`}
              >
                <div className="flex items-center">
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="mr-3 w-7 h-7 filter invert brightness-0"
                  />
                  <span>{item.title}</span>
                </div>
                <FontAwesomeIcon 
                  icon={faChevronRight} 
                  className={`transition-transform duration-200 ${
                    activeSection === item.id ? 'transform rotate-90' : ''
                  }`}
                />
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Área de contenido principal, cambia según la sección seleccionada */}
      <div className="flex-1 p-8">
        <div className="bg-[#2E2E7A] time-capsule rounded-xl p-6 min-h-[calc(100vh-4rem)] shadow-2xl animate-fade-in-up">
          {renderContent()}
        </div>
      </div>
      {/* Animaciones CSS para transiciones visuales */}
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
        `}
      </style>
    </div>
  );
};

// Función auxiliar para obtener el usuario almacenado en localStorage y normalizar sus campos
const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    // Normaliza claves para compatibilidad
    return {
      id: user.id || user.User_ID,
      name: user.name || user.Name,
      email: user.email || user.Email,
      role: user.role || user.Role,
      profilePicture: user.profilePicture || user.Profile_Picture || '', // <-- Foto de perfil
    };
  } catch {
    return null;
  }
};

// =================== COMPONENTE: INFORMACIÓN GENERAL ===================
const InformacionGeneral = () => {
  const navigate = useNavigate();
  // Estados para los datos del usuario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Estados para cambio de contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  // Estados para la foto de perfil
  const [profilePicture, setProfilePicture] = useState('');
  const [newProfilePic, setNewProfilePic] = useState(null);
  // Modal para mostrar mensajes de éxito/error
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  // Estados para exportar datos
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [exportError, setExportError] = useState('');
  const [password, setPassword] = useState('');

  // Al montar, carga los datos del usuario desde localStorage
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

  // Maneja el guardado de los datos del usuario (nombre, email, foto)
  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      const storedUser = getStoredUser();
      const token = localStorage.getItem('token');
      // Si hay nueva foto, primero súbela al backend
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
      // Ahora actualiza los datos de usuario (nombre y correo)
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
        setModal({ open: true, title: 'Error', message: data.message || 'Error al actualizar' });
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
      window.dispatchEvent(new Event('user-updated')); // Notifica a otros componentes (ej: Header)
      setNewProfilePic(null);
      setLoading(false);
    } catch (err) {
      setModal({ open: true, title: 'Error', message: 'Error de conexión' });
      setLoading(false);
    }
  };

  // Maneja el cambio de contraseña del usuario
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    // Validaciones básicas de los campos
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
        setModal({ open: true, title: 'Error', message: data.message || 'Error al cambiar la contraseña' });
        setPasswordLoading(false);
        return;
      }
      setPasswordSuccess('Contraseña cambiada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      setPasswordLoading(false);
    } catch (err) {
      setModal({ open: true, title: 'Error', message: 'Error de conexión' });
      setPasswordLoading(false);
    }
  };

  // Muestra un spinner mientras carga los datos
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
            <label className="relative group cursor-pointer">
              {/* Imagen de perfil grande y estética */}
              {(profilePicture || newProfilePic) ? (
                <img
                  src={
                    newProfilePic
                      ? URL.createObjectURL(newProfilePic)
                      : profilePicture
                        ? (profilePicture.startsWith('http')
                            ? profilePicture
                            : `http://44.209.31.187:3000/api${profilePicture.startsWith('/') ? '' : '/'}${profilePicture}`)
                        : ''
                  }
                  alt="Foto de perfil"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#F5E050] shadow-lg transition-transform duration-200 group-hover:scale-105 bg-white"
                />
              ) : (
                // Si no hay foto, muestra un círculo con icono de usuario
                <div className="w-32 h-32 rounded-full bg-[#F5E050] flex items-center justify-center">
                  <FontAwesomeIcon icon={faUser} className="text-[#2E2E7A] text-5xl" />
                </div>
              )}
              {/* Botón flotante para cambiar foto */}
              <input
                type="file"
                accept="image/*"
                onChange={e => setNewProfilePic(e.target.files[0])}
                className="absolute inset-0 opacity-0 cursor-pointer"
                title="Cambiar foto de perfil"
              />
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs px-3 py-1 rounded-full opacity-90 group-hover:opacity-100 pointer-events-none transition">
                Cambiar foto
              </span>
            </label>
          </div>
          {/* Mensajes de éxito o error */}
          {error && <div className="text-red-400 mb-2">{error}</div>}
          {success && <div className="text-green-400 mb-2">{success}</div>}
          {/* Campos de nombre y correo */}
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
          {/* Botón para guardar cambios */}
          <button
            type="submit"
            className="mt-4 bg-[#F5E050] text-[#2E2E7A] px-6 py-2 rounded-full font-bold"
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>

      {/* Sección para cambiar contraseña */}
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

      {/* Modal para mostrar mensajes de error o éxito */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, title: '', message: '' })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>
    </div>
  );
};

// =================== COMPONENTE: MIS SUSCRIPCIONES ===================
const MisSuscripciones = () => {
  // Estados para la suscripción y transacciones del usuario
  const [suscripcion, setSuscripcion] = useState(null);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Estados para los modales de renovar y cancelar suscripción
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [renewMonths, setRenewMonths] = useState(1);
  const [renewLoading, setRenewLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const storedUser = getStoredUser();

  // Al montar, obtiene la suscripción y transacciones del usuario
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token') || (storedUser && storedUser.token);

        // Obtiene el plan y la suscripción activa
        const planRes = await fetch(`/api/subscriptions/my-plan`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const planData = await planRes.json();
        if (!planRes.ok) throw new Error(planData.message || 'Error al obtener el plan');
        setSuscripcion(planData.suscripcion || null);

        // Obtiene las transacciones del usuario
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

  // Abre el modal de renovación
  const handleRenew = () => {
    setShowRenewModal(true);
  };

  // Confirma la renovación de la suscripción
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

  // Abre el modal de cancelación
  const handleCancel = () => {
    setShowCancelModal(true);
  };

  // Confirma la cancelación de la suscripción
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

  // Muestra mensajes de carga o error
  if (loading) return <div className="text-white">Cargando...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div className="text-white">
      <h3 className="text-2xl passero-font text-[#F5E050] mb-6">Mis Suscripciones</h3>
      {/* Muestra información de la suscripción activa */}
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

      {/* Tabla de transacciones */}
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

// =================== COMPONENTE: CONFIGURACIÓN (EXPORTAR DATOS) ===================
const Configuracion = () => {
  // Estados para el modal de contraseña y errores de exportación
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [exportError, setExportError] = useState('');
  const [password, setPassword] = useState('');

  // Función para exportar los datos del usuario en PDF
  const handleExportPDF = async (pwd) => {

    try {
      const token = localStorage.getItem('token');
      // Solicita los datos al backend, autenticado y protegido por contraseña
      const res = await fetch('/api/users/me/export', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password: pwd })
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        setExportError('No se pudo leer la respuesta del servidor:\n' + text);
        return;
      }
      if (res.status === 401 || res.status === 403) {
        setExportError('Contraseña incorrecta');
        return;
      }
      if (!Array.isArray(data) || data.length === 0) {
        setExportError('No hay datos para exportar');
        return;
      }

      // Crea el documento PDF
      const doc = new jsPDF();

      // Portada
      doc.setFillColor(46, 46, 122); // Fondo azul oscuro
      doc.rect(0, 0, 210, 297, 'F'); // A4 completo (mm)
      doc.setTextColor(245, 224, 80); // Amarillo
      doc.setFontSize(32);
      doc.setFont('helvetica', 'bold'); 
      doc.text('ParDespue', 105, 80, { align: 'center' });
      doc.setFontSize(18);
      doc.setTextColor(255,255,255);
      doc.text('Exportación de datos de usuario', 105, 100, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Fecha de exportación: ${new Date().toLocaleString()}`, 105, 120, { align: 'center' });

      // Nueva página para los datos
      doc.addPage();
      doc.setTextColor(0,0,0); // Restablece color para el resto del PDF
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(18);
      doc.text('Exportación de datos de usuario', 14, 18);

      // Usuario
      const user = data.find(d => d.DataType === 'User');
      if (user) {
        doc.setFontSize(14);
        doc.text('Datos de Usuario', 14, 30);

        // Imagen de perfil
        let y = 38;
        const profilePicUrl = extraerCampo(user.Description, 'Profile_Picture');
        if (profilePicUrl) {
          try {
            let imgUrl = profilePicUrl;
    
            if (!imgUrl.startsWith('http')) {
              imgUrl = `http://44.209.31.187:3000/api${imgUrl}`;
            }
            // Intenta cargar la imagen como blob y convertirla a base64
            const imgResp = await fetch(imgUrl);
            if (!imgResp.ok) throw new Error('No se pudo cargar la imagen');
            const imgBlob = await imgResp.blob();
            const imgType = imgBlob.type.includes('png') ? 'PNG' : 'JPEG';
            const imgData = await new Promise(resolve => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(imgBlob);
            });
            doc.addImage(imgData, imgType, 150, y - 6, 30, 30);
          } catch (e) {
            doc.setFontSize(10);
            doc.text('No se pudo cargar la imagen de perfil.', 150, y + 10);
          }
        }

        // Tabla de datos de usuario

        autoTable(doc, {
          startY: 38,
          head: [['Campo', 'Valor']],
          body: [
            ['User_ID', extraerCampo(user.Description, 'User_ID')],
            ['Nombre', limpiarTexto(extraerCampo(user.Description, 'Name'))],
            ['Email', limpiarTexto(extraerCampo(user.Description, 'Email'))],
            ['Rol', limpiarTexto(extraerCampo(user.Description, 'Role'))],
            ['Verificado', limpiarTexto(extraerCampo(user.Description, 'Verified'))]
          ],
          styles: { fontSize: 10 },
          margin: { left: 14, right: 14 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Transacciones
      const transacciones = data.filter(d => d.DataType === 'Transaction');
      if (transacciones.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Transacciones', 14, 18);
        autoTable(doc, {
          startY: 24,
          head: [['ID', 'Fecha', 'Monto', 'Método', 'Estado', 'Suscripción']],
          body: transacciones.map(t => [
            t.DataID,
            t.CreatedAt ? ('' + t.CreatedAt).replace('T', ' ').slice(0, 19) : '',
            extraerCampo(t.Description, 'Amount'),
            extraerCampo(t.Description, 'Payment_Method'),
            extraerCampo(t.Description, 'Status') ? limpiarTexto(extraerCampo(t.Description, 'Status')) : '',
            extraerCampo(t.Description, 'Subscription_ID')
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Suscripciones
      const subs = data.filter(d => d.DataType === 'Subscription');
      if (subs.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Suscripciones', 14, 18);
        autoTable(doc, {
          startY: 24,
          head: [['ID', 'Tipo', 'Inicio', 'Fin', 'Estado']],
          body: subs.map(s => [
            s.DataID,
            extraerCampo(s.Description, 'Type'),
            extraerCampo(s.Description, 'Start_Date'),
            extraerCampo(s.Description, 'End_Date'),
            extraerCampo(s.Description, 'Status') 
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Contenidos
      const contenidos = data.filter(d => d.DataType === 'Content');
      if (contenidos.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Contenidos', 14, 18);
        autoTable(doc, {
          startY: 24,
          head: [['ID', 'Tipo', 'Ruta', 'Fecha', 'Cápsula']],
          body: contenidos.map(c => [
            extraerCampo(c.Description, 'Content_ID'),
            extraerCampo(c.Description, 'Type'),
            // Solo nombre del archivo
            (() => {
              const ruta = extraerCampo(c.Description, 'File_Path');
              return ruta ? ruta.split('/').pop() : '';
            })(),
            extraerCampo(c.Description, 'Creation_Date'),
            c.AdditionalInfo || ''
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Notificaciones
      const notificaciones = data.filter(d => d.DataType === 'Notification');
      if (notificaciones.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Notificaciones', 14, 18);
        autoTable(doc, {
          startY: 24,
          head: [['ID', 'Mensaje', 'Fecha', 'Cápsula']],
          body: notificaciones.map(n => [
            extraerCampo(n.Description, 'Notification_ID'),
            extraerCampo(n.Description, 'Message'),
            extraerCampo(n.Description, 'Sent_Date'),
            n.AdditionalInfo || ''
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Cápsulas que le ha dado like el usuario
      const capsuleLikes = data.filter(d => d.DataType === 'CapsuleLike');
      if (capsuleLikes.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Cápsulas que te gustaron', 14, 18);
        autoTable(doc, {
          startY: 24,
          head: [['Capsule_ID']],
          body: capsuleLikes.map(like => [
            extraerCampo(like.Description, 'Capsule_ID')
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Comentarios hechos por el usuario
      const comentarios = data.filter(d => d.DataType === 'Comment');
      if (comentarios.length) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('Comentarios realizados', 14, 18);
        autoTable(doc, {
          startY: 24,
          head: [['ID', 'Contenido', 'Fecha', 'Cápsula']],
          body: comentarios.map(c => [
            extraerCampo(c.Description, 'Comment_ID'),
            limpiarTexto(extraerCampo(c.Description, 'Content')),
            extraerCampo(c.Description, 'Creation_Date'),
            extraerCampo(c.Description, 'Capsule_ID')
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [245, 224, 80], textColor: [46, 46, 122] }
        });
      }

      // Función auxiliar para extraer campos de la descripción tipo "Campo: valor, Campo2: valor2"
      function extraerCampo(desc, campo) {
        if (!desc) return '';
        const regex = new RegExp(`${campo}\\s*:\\s*([^,]+)`, 'i');
        const match = desc.match(regex);
        return match ? match[1].trim() : '';
      }

      doc.save('mis_datos.pdf');
      setShowPasswordModal(false);
      console.log('[PDF] PDF generado y descargado');
    } catch (err) {
      console.error('[PDF][ERROR]', err);
      alert('Error al exportar los datos');
    }
  };

  return (
    <div className="text-white">
      <h3 className="text-2xl passero-font text-[#F5E050] mb-6">Configuración</h3>
      <div className="space-y-4">
        <div className="bg-[#1a1a4a] p-6 rounded-lg">
          <h4 className="text-xl mb-4">Exportar mis datos</h4>
          <button
            className="bg-[#F5E050] text-[#2E2E7A] px-6 py-2 rounded-full font-bold"
            onClick={() => setShowPasswordModal(true)}
          >
            Descargar toda mi información (.pdf)
          </button>
          {exportError && <div className="text-red-400 mt-2">{exportError}</div>}
        </div>
        {/* Modal para pedir la contraseña antes de exportar */}
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handleExportPDF}
          error={exportError}
        />
      </div>
    </div>
  );
};

// Función auxiliar para limpiar caracteres especiales de los textos
function limpiarTexto(texto) {
  if (!texto) return '';
  // Reemplaza caracteres problemáticos
  return texto
    .replace(/í/g, 'i')
    .replace(/Í/g, 'I')
    .replace(/é/g, 'e')
    .replace(/É/g, 'E')
    .replace(/á/g, 'a')
    .replace(/Á/g, 'A')
    .replace(/ó/g, 'o')
    .replace(/Ó/g, 'O')
    .replace(/ú/g, 'u')
    .replace(/Ú/g, 'U')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');
}

export default Account;