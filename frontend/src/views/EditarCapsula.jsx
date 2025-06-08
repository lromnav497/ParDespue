import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave, faTimes, faTrash, faImage, faVideo, faFileAlt, faMusic, faArrowLeft, faTag
} from '@fortawesome/free-solid-svg-icons';
import PasswordModal from '../components/modals/PasswordModal';
import Modal from '../components/modals/Modal';
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
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const [tagInput, setTagInput] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientRole, setRecipientRole] = useState('Reader');
  const [recipients, setRecipients] = useState([]); // [{email, role}]

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
    // Permitir acceso si es admin, aunque no tenga plan premium
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';

    if (plan === null && !isAdmin) {
      console.log('[EditarCapsula] plan es null, no pido cápsula');
      return; // Espera a que el plan esté definido, salvo que sea admin
    }
    console.log('[EditarCapsula] plan detectado:', plan, 'isAdmin:', isAdmin);
    const fetchCapsula = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token') || user?.token;
        const res = await fetch(`/api/capsules/${id}/edit`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          const data = await res.json();
          setError(data.message || 'No tienes permiso para editar esta cápsula.');
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCapsula(data);
        setForm({
          Title: data.Title || '',
          Description: data.Description || '',
          Opening_Date: data.Opening_Date ? data.Opening_Date.slice(0, 10) : '',
          Category_ID: data.Category_ID || data.Category?.Category_ID || '',
          Privacy: data.Privacy || 'private',
          Tags: Array.isArray(data.Tags) ? data.Tags.join(', ') : (data.Tags || ''),
        });
        setCoverPreview(data.Cover_Image || '');
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

  // Añadir tag
  const handleTagInputChange = (e) => setTagInput(e.target.value);

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && (!form.Tags || !form.Tags.split(',').map(t => t.trim()).includes(newTag))) {
      setForm(prev => ({
        ...prev,
        Tags: prev.Tags
          ? prev.Tags.split(',').map(t => t.trim()).concat(newTag).join(', ')
          : newTag
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    const tagsArr = (form.Tags || '').split(',').map(t => t.trim()).filter(Boolean);
    setForm(prev => ({
      ...prev,
      Tags: tagsArr.filter(tag => tag !== tagToRemove).join(', ')
    }));
  };

  // Guardar cambios
  const handleGuardar = async (e, passwordValidated = false) => {
    if (e) e.preventDefault();
    setLoading(true);

    // VALIDACIÓN DE FECHAS
    const fechaCreacion = new Date(capsula.Creation_Date);
    const fechaApertura = new Date(form.Opening_Date);
    if (fechaApertura <= fechaCreacion) {
      setModal({
        open: true,
        title: 'Fecha inválida',
        message: 'La fecha de apertura debe ser posterior a la fecha de creación.'
      });
      setLoading(false);
      return;
    }

    // Detectar si se requiere contraseña
    const eraPrivada = capsula.Privacy === 'private';
    const ahoraPrivada = form.Privacy === 'private';
    const cambiandoPrivacidadDePrivada = eraPrivada && !ahoraPrivada;
    const cambiandoPassword = eraPrivada && ahoraPrivada && form.Password && form.Password !== capsula.Password;

    if (!passwordValidated && (cambiandoPrivacidadDePrivada || cambiandoPassword)) {
      setPendingAction(cambiandoPrivacidadDePrivada ? 'changePrivacy' : 'changePassword');
      setShowPasswordModal(true);
      setLoading(false);
      return;
    }

    // VALIDACIÓN DE CAMPOS OBLIGATORIOS
    if (!form.Title || !form.Opening_Date) {
      setModal({
        open: true,
        title: 'Campos obligatorios',
        message: 'Debes completar todos los campos obligatorios.'
      });
      setLoading(false);
      return;
    }
    if (!form.Category_ID) {
      setModal({
        open: true,
        title: 'Categoría requerida',
        message: 'Debes seleccionar una categoría.'
      });
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

      // Actualizar imagen de portada si se subió una nueva
      if (coverImage) {
        const formData = new FormData();
        formData.append('cover_image', coverImage);
        const token = localStorage.getItem('token');
        await fetch(`/api/capsules/${id}/cover`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });
      }

      // ...después de actualizar la cápsula y archivos...
      // Elimina todos los destinatarios si la cápsula era de grupo y ahora NO es grupo
      if (capsula.Privacy === 'group' && form.Privacy !== 'group') {
        await fetch(`/api/recipients/all/${id}`, { method: 'DELETE' });
      }

      // Si la cápsula es de grupo, solo gestiona los cambios individuales (ya lo haces en el frontend)

      setModal({
        open: true,
        title: 'Éxito',
        message: 'Cápsula actualizada correctamente'
      });
      setTimeout(() => navigate(`/capsulas`), 1200);
    } catch (err) {
      setModal({
        open: true,
        title: 'Error',
        message: 'Error al guardar: ' + err.message
      });
    }
    setLoading(false);
  };

  // Cancelar edición
  const handleCancelar = () => {
    navigate(-1);
  };

  useEffect(() => {
    // ...después de cargar la cápsula...
    if (capsula && capsula.Privacy === 'group') {
      fetch(`/api/recipients/capsule/${id}`)
        .then(res => res.json())
        .then(data => {
          setRecipients(
            Array.isArray(data)
              ? data.map(r => ({ email: r.Email, role: r.RoleName === 'Collaborator' ? 'Collaborator' : 'Reader' }))
              : []
          );
        });
    }
  }, [capsula, id]);

  if (loading) return <div className="text-center text-[#F5E050] py-10 animate-pulse">Cargando cápsula...</div>;
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b]">
        <div className="bg-[#1a1a4a] text-[#F5E050] p-8 rounded-lg shadow-lg text-center animate-fade-in-down">
          <h2 className="text-2xl font-bold mb-4">No se puede editar la cápsula</h2>
          <p>
            {error.includes('abierta')
              ? 'No se pueden editar cápsulas que ya han sido abiertas.'
              : error}
          </p>
          <button
            className="mt-6 px-4 py-2 bg-[#F5E050] text-[#2E2E7A] rounded hover:bg-[#e6d047] transition-all"
            onClick={() => window.history.back()}
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }
  if (!capsula) return <div className="text-center text-red-500 py-10 animate-fade-in-up">No se encontró la cápsula.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] py-8 animate-fade-in">
      <div className="container mx-auto px-2 md:px-4">
        <div className="bg-[#2E2E7A] rounded-xl p-6 md:p-8 shadow-2xl max-w-3xl mx-auto animate-fade-in-up">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h1 className="text-3xl text-[#F5E050] passero-font drop-shadow-lg">Editar Cápsula</h1>
            <div className="flex gap-2">
              <button
                onClick={handleCancelar}
                className="px-4 py-2 bg-[#1a1a4a] text-white rounded-full hover:bg-[#3d3d9e] flex items-center gap-2 transition-all shadow"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                Cancelar
              </button>
              <button
                onClick={handleGuardar}
                className="px-4 py-2 bg-[#F5E050] text-[#2E2E7A] rounded-full hover:bg-[#e6d047] flex items-center gap-2 transition-all shadow font-bold"
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
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Fecha de apertura</label>
                <input
                  type="date"
                  name="Opening_Date"
                  value={form.Opening_Date}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Categoría</label>
                <select
                  name="Category_ID"
                  value={form.Category_ID}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
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
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
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
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-white mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} className="text-[#F5E050]" />
                Añadir tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  className="flex-1 bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
                  placeholder="Escribe un tag y pulsa Enter"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded-full font-bold hover:bg-[#e6d047] transition-colors"
                  onClick={handleAddTag}
                >
                  Añadir
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.Tags ? form.Tags.split(',').map(t => t.trim()).filter(Boolean) : []).map(tag => (
                  <span
                    key={tag}
                    className="bg-[#F5E050] text-[#2E2E7A] px-3 py-1 rounded-full flex items-center gap-2 animate-fade-in"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-[#2E2E7A] hover:text-red-600 font-bold"
                      title="Eliminar tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
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
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050] transition-all"
                  placeholder="Dejar vacío para no cambiar"
                />
              </div>
            )}
            {/* Imagen de portada */}
            <div>
              <label className="block text-white mb-2">Imagen de portada</label>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    id="cover-upload"
                    style={{ display: 'none' }}
                    onChange={e => {
                      setCoverImage(e.target.files[0]);
                      setCoverPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                  />
                  <label htmlFor="cover-upload" className="cursor-pointer">
                    {coverPreview ? (
                      <img
                        src={coverPreview.startsWith('blob:')
                          ? coverPreview
                          : coverPreview.startsWith('http')
                            ? coverPreview
                            : `http://44.209.31.187:3000/api${coverPreview}`}
                        alt="Portada"
                        className="w-48 h-32 object-cover rounded-lg border-4 border-[#F5E050] shadow-lg hover:opacity-80 transition"
                        title="Haz clic para cambiar la portada"
                      />
                    ) : (
                      <div className="w-48 h-32 flex flex-col items-center justify-center bg-[#1a1a4a] border-2 border-dashed border-[#3d3d9e] rounded-lg cursor-pointer hover:border-[#F5E050] transition">
                        <FontAwesomeIcon icon={faImage} className="text-4xl text-[#F5E050] mb-2" />
                        <span className="text-white">Elegir imagen</span>
                      </div>
                    )}
                  </label>
                </div>
                {coverPreview && (
                  <button
                    type="button"
                    className="ml-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-400 transition-all"
                    onClick={async () => {
                      setCoverImage(null);
                      setCoverPreview('');
                      // Llama al backend para eliminar la portada
                      const token = localStorage.getItem('token');
                      await fetch(`/api/capsules/${id}/cover`, {
                        method: 'PUT',
                        headers: { 
                          'Authorization': `Bearer ${token}`,
                          'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ remove: true })
                      });
                    }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
            {/* Archivos actuales */}
            <div>
              <h3 className="text-xl text-[#F5E050] mb-4">Archivos actuales</h3>
              <div className="flex flex-wrap gap-6">
                {archivos.length === 0 && (
                  <div className="text-gray-400 animate-fade-in-up">No hay archivos en esta cápsula.</div>
                )}
                {archivos.map((archivo, idx) => (
                  <div
                    key={archivo.id || archivo.Content_ID || idx}
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow transition-transform duration-200 hover:scale-105 animate-fade-in"
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
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-400 transition-all"
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
                className="border-2 border-dashed border-[#3d3d9e] rounded-lg p-8 text-center cursor-pointer hover:border-[#F5E050] transition-all animate-fade-in"
                onClick={() => fileInputRef.current.click()}
              >
                <FontAwesomeIcon icon={faFileAlt} className="text-[#F5E050] text-4xl mb-4 animate-bounce-slow" />
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
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow transition-transform duration-200 hover:scale-105 animate-fade-in"
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
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-400 transition-all"
                      onClick={() => handleRemoveNuevoArchivo(idx)}
                      title="Eliminar"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            {/* Destinatarios */}
            {form.Privacy === 'group' && (
              <div className="mt-4">
                <label className="block text-white mb-2">Añadir destinatarios</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="email"
                    placeholder="Correo del destinatario"
                    value={recipientEmail}
                    onChange={e => setRecipientEmail(e.target.value)}
                    className="flex-1 bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                    required
                  />
                  <select
                    value={recipientRole}
                    onChange={e => setRecipientRole(e.target.value)}
                    className="bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                  >
                    <option value="Reader">Solo lectura</option>
                    <option value="Collaborator">Colaborador</option>
                  </select>
                  <button
                    type="button"
                    className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded-full font-bold hover:bg-[#e6d047] transition-colors"
                    onClick={async () => {
                      if (
                        recipientEmail &&
                        recipientRole &&
                        !recipients.some(r => r.email === recipientEmail)
                      ) {
                        // 1. Busca el usuario por email
                        const resUser = await fetch(`/api/users/email/${recipientEmail}`);
                        const userData = await resUser.json();
                        // 2. Mapea el rol a su ID
                        const roleMap = { 'Reader': 2, 'Collaborator': 3 };
                        const roleId = roleMap[recipientRole];
                        if (resUser.ok && userData.User_ID && roleId) {
                          // 3. Añade en la base de datos
                          await fetch(`/api/recipients`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              User_ID: userData.User_ID,
                              Capsule_ID: id,
                              Role_ID: roleId
                            }),
                          });
                          // 4. Añade al estado local
                          setRecipients(prev => [...prev, { email: recipientEmail, role: recipientRole }]);
                          setRecipientEmail('');
                          setRecipientRole('Reader');
                        }
                      }
                    }}
                  >
                    Añadir
                  </button>
                </div>
                <div>
                  <span className="text-[#F5E050]">Destinatarios:</span>
                  <ul className="ml-4 list-disc">
                    {recipients.map((r, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        {r.email} - {r.role}
                        <button
                          type="button"
                          className="ml-2 text-red-500 hover:text-red-700 font-bold"
                          title="Eliminar destinatario"
                          onClick={async () => {
                            // 1. Busca el usuario y el rol
                            const resUser = await fetch(`/api/users/email/${r.email}`);
                            const userData = await resUser.json();
                            // 2. Mapea el rol a su ID
                            const roleMap = { 'Reader': 2, 'Collaborator': 3 };
                            const roleId = roleMap[r.role];
                            if (resUser.ok && userData.User_ID && roleId) {
                              await fetch(`/api/recipients`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  User_ID: userData.User_ID,
                                  Capsule_ID: id,
                                  Role_ID: roleId
                                }),
                              });
                            }
                            setRecipients(prev => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, title: '', message: '' })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>
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
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1, transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1, transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
};

export default EditarCapsula;