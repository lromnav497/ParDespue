import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave, faTimes, faTrash, faImage, faVideo, faFileAlt, faMusic, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';
import PasswordModal from '../components/modals/PasswordModal';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

function toMySQLDateTime(dateString) {
  if (!dateString) return null;
  const d = new Date(dateString);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

const getTypeFromMime = (mime) => {
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
};

const EditarCapsula = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [capsula, setCapsula] = useState(null);
  const [archivos, setArchivos] = useState([]); // archivos actuales
  const [nuevosArchivos, setNuevosArchivos] = useState([]); // archivos nuevos a subir
  const [archivosParaEliminar, setArchivosParaEliminar] = useState([]);
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Opening_Date: '',
    Category_ID: '',
    Privacy: 'private',
    Tags: '',
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [pendingAction, setPendingAction] = useState(null); // 'changePrivacy' o 'changePassword'
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);

  // Cargar categorías
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  // Verificar plan del usuario (igual que en Header)
  useEffect(() => {
    const fetchPlan = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token') || user?.token;
      console.log('[EditarCapsula] user:', user);
      console.log('[EditarCapsula] token:', token);
      if (!token) {
        console.log('[EditarCapsula] No token, setPlan(null)');
        return setPlan(null);
      }
      try {
        const res = await fetch('/api/subscriptions/my-plan', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('[EditarCapsula] /api/subscriptions/my-plan status:', res.status);
        if (!res.ok) {
          console.log('[EditarCapsula] /api/subscriptions/my-plan not ok, setPlan(null)');
          return setPlan(null);
        }
        const data = await res.json();
        console.log('[EditarCapsula] /api/subscriptions/my-plan data:', data);
        // Forzar a string y lowercase para evitar problemas de mayúsculas/minúsculas
        let planName = null;
        if (data.suscripcion && data.suscripcion.nombre) {
          planName = String(data.suscripcion.nombre).toLowerCase();
        } else if (data.plan) {
          planName = String(data.plan).toLowerCase();
        }
        if (planName === 'premium') {
          setPlan('Premium');
        } else if (planName === 'básico' || planName === 'basico') {
          setPlan('Básico');
        } else {
          setPlan(null);
        }
      } catch (err) {
        console.log('[EditarCapsula] Error en fetchPlan:', err);
        setPlan(null);
      }
    };
    fetchPlan();
  }, [id]);

  // Esperar a que el plan esté cargado antes de pedir la cápsula
  useEffect(() => {
    if (plan === null) {
      console.log('[EditarCapsula] plan es null, no pido cápsula');
      return; // Espera a que el plan esté definido
    }
    console.log('[EditarCapsula] plan detectado:', plan);
    const fetchCapsula = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const token = localStorage.getItem('token') || user?.token;
        console.log('[EditarCapsula] Pido cápsula con token:', token);
        const res = await fetch(`/api/capsules/${id}/edit`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('[EditarCapsula] /api/capsules/'+id+'/edit status:', res.status);
        if (!res.ok) {
          const data = await res.json();
          console.log('[EditarCapsula] Error al pedir cápsula:', data);
          setError(data.message || 'No tienes permiso para editar esta cápsula.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        console.log('[EditarCapsula] Cápsula recibida:', data);
        setCapsula(data);
        setForm({
          Title: data.Title || '',
          Description: data.Description || '',
          Opening_Date: data.Opening_Date ? data.Opening_Date.slice(0, 10) : '',
          Category_ID: data.Category_ID || data.Category?.Category_ID || '',
          Privacy: data.Privacy || 'private',
          Tags: Array.isArray(data.Tags) ? data.Tags.join(', ') : (data.Tags || ''),
        });
        // Obtén los archivos igual que en VerCapsula
        const resArchivos = await fetch(`/api/contents/capsule/${id}`);
        const archivosData = await resArchivos.json();
        setArchivos(
          Array.isArray(archivosData)
            ? archivosData.map(a => ({
                ...a,
                id: a.Content_ID,
                type: a.Type,
                url: a.Path ? `/api${a.Path.startsWith('/') ? a.Path : '/' + a.Path}` : undefined,
                name: a.Name,
              }))
            : []
        );
      } catch (err) {
        console.log('[EditarCapsula] Error al cargar la cápsula:', err);
        setError('Error al cargar la cápsula.');
      }
      setLoading(false);
    };
    fetchCapsula();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, plan]);

  // Eliminar archivo actual (solo del frontend, se elimina en el backend al guardar)
  const handleRemoveArchivo = (contentId) => {
    setArchivos(prev => prev.filter(a => a.id !== contentId && a.Content_ID !== contentId));
    setArchivosParaEliminar(prev => [...prev, contentId]);
  };

  // Eliminar archivo nuevo antes de guardar
  const handleRemoveNuevoArchivo = (idx) => {
    setNuevosArchivos(prev => prev.filter((_, i) => i !== idx));
  };

  // Subir archivo nuevo (solo frontend, se sube al guardar)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNuevosArchivos(prev => [
      ...prev,
      {
        file,
        name: file.name,
        type: file.type,
        preview: URL.createObjectURL(file),
      }
    ]);
    e.target.value = '';
  };

  // Cambios en campos de formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Guardar cambios
  const handleGuardar = async (e, passwordValidated = false) => {
    if (e) e.preventDefault();
    setLoading(true);

    // VALIDACIÓN DE FECHAS
    const fechaCreacion = new Date(capsula.Creation_Date);
    const fechaApertura = new Date(form.Opening_Date);
    if (fechaApertura <= fechaCreacion) {
      alert('La fecha de apertura debe ser posterior a la fecha de creación.');
      setLoading(false);
      return;
    }

    // Detectar si se requiere contraseña
    const cambiandoPrivacidad = capsula.Privacy === 'private' && form.Privacy !== 'private';
    const cambiandoPassword = capsula.Password && form.Privacy === 'private' && form.Password && form.Password !== capsula.Password;

    if (!passwordValidated && (cambiandoPrivacidad || cambiandoPassword)) {
      setPendingAction(cambiandoPrivacidad ? 'changePrivacy' : 'changePassword');
      setShowPasswordModal(true);
      setLoading(false);
      return;
    }

    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (!form.Title || !form.Opening_Date) {
      alert('Debes completar todos los campos obligatorios.');
      setLoading(false);
      return;
    }
    if (!form.Category_ID) {
      alert('Debes seleccionar una categoría.');
      setLoading(false);
      return;
    }

    try {
      // --- LIMPIA LA CONTRASEÑA SI PASA A PUBLICA ---
      let formToSend = { ...form };
      formToSend.Category_ID = Number(formToSend.Category_ID);
      if (formToSend.Privacy !== 'private') {
        formToSend.Password = '';
      }

      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token') || user?.token;
      const userId = user?.id;

      // 1. Actualiza los datos principales de la cápsula
      const res = await fetch(`/api/capsules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formToSend,
          Creation_Date: toMySQLDateTime(capsula.Creation_Date),
          Tags: formToSend.Tags,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Error al actualizar la cápsula');
      }

      // 2. Elimina archivos marcados para borrar
      for (const contentId of archivosParaEliminar) {
        await fetch(`/api/contents/${contentId}`, { method: 'DELETE' });
      }
      setArchivosParaEliminar([]); // Limpia el array

      // 3. Sube nuevos archivos y los asocia a la cápsula
      for (const archivo of nuevosArchivos) {
        // 1. Sube a temporal
        const formDataFile = new FormData();
        formDataFile.append('userId', userId);
        formDataFile.append('file', archivo.file);
        const resUpload = await fetch('/api/upload/tmp', { method: 'POST', body: formDataFile });
        const data = await resUpload.json();

        // 2. Mueve a definitiva y GUARDA la ruta devuelta
        const resMove = await fetch('/api/upload/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            capsuleId: id,
            tmpPath: data.filePath
          }),
        });
        const moveData = await resMove.json();

        // 3. Guarda en Contents usando la ruta definitiva
        await fetch('/api/contents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Type: getTypeFromMime(archivo.type),
            File_Path: moveData.filePath,
            Creation_Date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            Capsule_ID: id,
          }),
        });
      }

      alert('Cápsula actualizada correctamente');
      navigate(`/capsulas`);
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
    setLoading(false);
  };

  // Cancelar edición
  const handleCancelar = () => {
    navigate(-1);
  };

  if (loading) return <div className="text-center text-[#F5E050] py-10">Cargando cápsula...</div>;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-[#1a1a4a] text-[#F5E050] p-8 rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold mb-4">No se puede editar la cápsula</h2>
          <p>
            {error.includes('abierta')
              ? 'No se pueden editar cápsulas que ya han sido abiertas.'
              : error}
          </p>
          <button
            className="mt-6 px-4 py-2 bg-[#F5E050] text-[#2E2E7A] rounded hover:bg-[#e6d047]"
            onClick={() => window.history.back()}
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }
  if (!capsula) return <div className="text-center text-red-500 py-10">No se encontró la cápsula.</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-[#2E2E7A] rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl text-[#F5E050] passero-font">Editar Cápsula</h1>
            <div className="flex gap-2">
              <button
                onClick={handleCancelar}
                className="px-4 py-2 bg-[#1a1a4a] text-white rounded-full hover:bg-[#3d3d9e] flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-4 py-2 bg-[#F5E050] text-[#2E2E7A] rounded-full hover:bg-[#e6d047] flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faSave} />
                Guardar
              </button>
            </div>
          </div>
          <form onSubmit={handleGuardar} className="space-y-6">
            {/* Campos principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white mb-2">Título</label>
                <input
                  type="text"
                  name="Title"
                  value={form.Title}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Fecha de apertura</label>
                <input
                  type="date"
                  name="Opening_Date"
                  value={form.Opening_Date}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Categoría</label>
                <select
                  name="Category_ID"
                  value={form.Category_ID}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(cat => (
                    <option key={cat.Category_ID} value={cat.Category_ID}>
                      {cat.Name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Privacidad</label>
                <select
                  name="Privacy"
                  value={form.Privacy}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                >
                  <option value="private">Privada</option>
                  <option value="public">Pública</option>
                  <option value="group">Grupos</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-white mb-2">Descripción</label>
              <textarea
                name="Description"
                value={form.Description}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-white mb-2">Tags (separados por coma)</label>
              <input
                type="text"
                name="Tags"
                value={form.Tags}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                placeholder="ej: futuro, familia, trabajo"
              />
            </div>
            {/* Nueva contraseña */}
            {form.Privacy === 'private' && (
              <div>
                <label className="block text-white mb-2">Nueva contraseña (opcional)</label>
                <input
                  type="password"
                  name="Password"
                  value={form.Password || ''}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
            )}
            {/* Archivos actuales */}
            <div>
              <h3 className="text-xl text-[#F5E050] mb-4">Archivos actuales</h3>
              <div className="flex flex-wrap gap-6">
                {archivos.length === 0 && (
                  <div className="text-gray-400">No hay archivos en esta cápsula.</div>
                )}
                {archivos.map((archivo, idx) => (
                  <div
                    key={archivo.id || archivo.Content_ID || idx}
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow"
                  >
                    {archivo.type === 'image' && archivo.url && (
                      <img
                        src={archivo.url}
                        alt={archivo.Name || archivo.name}
                        className="object-cover w-full h-full"
                      />
                    )}
                    {archivo.type === 'video' && archivo.url && (
                      <video
                        src={archivo.url}
                        className="object-cover w-full h-full"
                        controls
                        poster="https://placehold.co/160x160?text=Video"
                      />
                    )}
                    {archivo.type === 'audio' && archivo.url && (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <FontAwesomeIcon icon={faMusic} className="text-4xl text-[#2E2E7A] mb-2" />
                        <audio controls className="w-full">
                          <source src={archivo.url} />
                          Tu navegador no soporta audio.
                        </audio>
                      </div>
                    )}
                    {archivo.type === 'text' && (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <FontAwesomeIcon icon={faFileAlt} className="text-4xl text-[#2E2E7A] mb-2" />
                        <span className="text-xs text-[#2E2E7A]">{archivo.contenido || archivo.File_Path}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-400"
                      onClick={() => handleRemoveArchivo(archivo.id || archivo.Content_ID)}
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Subir nuevos archivos */}
            <div>
              <h3 className="text-xl text-[#F5E050] mb-4 mt-8">Agregar nuevos archivos</h3>
              <div
                className="border-2 border-dashed border-[#3d3d9e] rounded-lg p-8 text-center cursor-pointer"
                onClick={() => fileInputRef.current.click()}
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-[#F5E050] text-4xl mb-4" />
                <p className="text-white">Arrastra archivos aquí o haz clic para seleccionar</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
              {/* Mostrar archivos nuevos */}
              <div className="flex flex-wrap gap-6 mt-4">
                {nuevosArchivos.map((archivo, idx) => (
                  <div
                    key={idx}
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow"
                  >
                    {archivo.type.startsWith('image') && (
                      <img
                        src={archivo.preview}
                        alt={archivo.name}
                        className="object-cover w-full h-full"
                      />
                    )}
                    {archivo.type.startsWith('video') && (
                      <video
                        src={archivo.preview}
                        className="object-cover w-full h-full"
                        controls
                        poster="https://placehold.co/160x160?text=Video"
                      />
                    )}
                    {archivo.type.startsWith('audio') && (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <FontAwesomeIcon icon={faMusic} className="text-4xl text-[#2E2E7A] mb-2" />
                        <audio controls className="w-full">
                          <source src={archivo.preview} />
                          Tu navegador no soporta audio.
                        </audio>
                      </div>
                    )}
                    {!archivo.type.startsWith('image') && !archivo.type.startsWith('video') && !archivo.type.startsWith('audio') && (
                      <span className="text-[#2E2E7A] font-bold text-xs text-center px-2">
                        {archivo.name.split('.').pop().toUpperCase()}
                      </span>
                    )}
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-400"
                      onClick={() => handleRemoveNuevoArchivo(idx)}
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>
      </div>
      {showPasswordModal && (
        <PasswordModal
          isOpen={showPasswordModal}
          onClose={() => { setShowPasswordModal(false); setPasswordInput(''); setPasswordError(''); }}
          onSubmit={async (password) => {
            setPasswordInput(password);
            // Verifica la contraseña con el backend
            const res = await fetch(`/api/capsules/${id}/check-password`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (data.valid) {
              setShowPasswordModal(false);
              setPasswordInput('');
              setPasswordError('');
              if (pendingAction === 'changePrivacy' || pendingAction === 'changePassword') {
                await handleGuardar(null, true); // true = ya validado
              }
            } else {
              setPasswordError('Contraseña incorrecta');
            }
          }}
          error={passwordError}
        />
      )}
    </div>
  );
};

export default EditarCapsula;