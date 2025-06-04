import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBoxArchive,
  faImage,
  faVideo,
  faFileAlt,
  faMusic,
  faLock,
  faUsers,
  faGlobe,
  faBell,
  faCheck,
  faTag
} from '@fortawesome/free-solid-svg-icons';
import CapsuleCreatedModal from '../components/modals/CapsuleCreatedModal';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

const CrearCapsula = () => {
  const user = JSON.parse(localStorage.getItem('user')); // Asegúrate que la clave sea 'user'
  const userId = user?.id; // Esto será 8 si el usuario está logueado
  console.log('userId:', userId); // Debe mostrar un número o string válido
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fechaApertura: '',
    categoriaId: '',
    archivos: [],
    privacidad: 'privada',
    notificaciones: false,
    tema: 'default',
    tags: [],
    password: '' // <-- agrega esto
  });
  const [tagInput, setTagInput] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientRole, setRecipientRole] = useState('Reader');
  const fileInputRef = useRef();
  const [showModal, setShowModal] = useState(false);
  const [carruselArchivos, setCarruselArchivos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [puedeCrear, setPuedeCrear] = useState(true);
  const [plan, setPlan] = useState('Básico');
  const [planMsg, setPlanMsg] = useState('');
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  useEffect(() => {
    const fetchPlan = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      const token = user?.token;
      if (!token) return;
      // Consulta el plan
      const resPlan = await fetch('/api/subscriptions/my-plan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataPlan = await resPlan.json();
      setPlan(dataPlan.plan || 'Básico');
      // Consulta si puede crear
      const res = await fetch('/api/subscriptions/can-create-capsule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setPuedeCrear(data.allowed);
      setPlanMsg(data.message || '');
    };
    fetchPlan();
  }, []);

  const steps = [
    { id: 0, title: 'Información', icon: faBoxArchive },
    { id: 1, title: 'Contenido', icon: faFileAlt },
    { id: 2, title: 'Configuración', icon: faLock },
    { id: 3, title: 'Revisión', icon: faCheck }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // TAGS LOGIC
  const handleTagInputChange = (e) => setTagInput(e.target.value);

  const handleAddTag = (e) => {
    e.preventDefault();
    const newTag = tagInput.trim();
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleRemoveArchivo = async (index) => {
    const archivo = formData.archivos[index];
    // Elimina del backend
    try {
      await fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: archivo.path }),
      });
    } catch (err) {
      // Opcional: mostrar error si falla el borrado físico
      console.error('No se pudo eliminar el archivo físico:', err);
    }
    // Elimina del frontend
    setFormData(prev => ({
      ...prev,
      archivos: prev.archivos.filter((_, i) => i !== index)
    }));
  };

  // Subida de archivos
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!userId) {
      alert('No se detectó el usuario. Por favor, inicia sesión de nuevo.');
      return;
    }

    // Sube a carpeta temporal
    const formDataFile = new FormData();
    formDataFile.append('userId', userId); // Primero el userId
    formDataFile.append('file', file);     // Luego el archivo

    const resUpload = await fetch('/api/upload/tmp', {
      method: 'POST',
      body: formDataFile,
    });
    const data = await resUpload.json();

    setFormData(prev => ({
      ...prev,
      archivos: [
        ...prev.archivos,
        {
          type: file.type,
          name: file.name,
          file, // para preview local si quieres
          tmpPath: data.filePath // guarda el path temporal
        }
      ]
    }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-white mb-2">Nombre de la cápsula</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 
                  text-white focus:outline-none focus:border-[#F5E050]"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 
                  text-white focus:outline-none focus:border-[#F5E050] h-32"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Fecha de apertura</label>
              <input
                type="date"
                name="fechaApertura"
                value={formData.fechaApertura}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 
                  text-white focus:outline-none focus:border-[#F5E050]"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Categoría</label>
              <select
                name="categoriaId"
                value={formData.categoriaId}
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
            {/* Apartado de tags */}
            <div>
              <label className="block text-white mb-2 flex items-center gap-2">
                <FontAwesomeIcon icon={faTag} className="text-[#F5E050]" />
                Añadir tags
              </label>
              <form onSubmit={handleAddTag} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  className="flex-1 bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050]"
                  placeholder="Escribe un tag y pulsa Enter"
                />
                <button
                  type="submit"
                  className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded-full font-bold hover:bg-[#e6d047] transition-colors"
                >
                  Añadir
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {formData.tags && formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-[#F5E050] text-[#2E2E7A] px-3 py-1 rounded-full flex items-center gap-2"
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
            <div className="mb-4 flex flex-col items-center">
              <label className="relative group cursor-pointer">
                {coverImage ? (
                  <img
                    src={URL.createObjectURL(coverImage)}
                    alt="Portada"
                    className="w-40 h-32 rounded-lg object-cover border-4 border-[#F5E050] shadow-lg transition-transform duration-200 group-hover:scale-105 bg-white"
                  />
                ) : (
                  <div className="w-40 h-32 rounded-lg bg-[#F5E050] flex items-center justify-center">
                    <FontAwesomeIcon icon={faImage} className="text-[#2E2E7A] text-4xl" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setCoverImage(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  title="Subir imagen de portada"
                />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs px-3 py-1 rounded-full opacity-90 group-hover:opacity-100 pointer-events-none transition">
                  {coverImage ? 'Cambiar portada' : 'Subir portada'}
                </span>
              </label>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { icon: faImage, text: 'Fotos' },
                { icon: faVideo, text: 'Videos' },
                { icon: faFileAlt, text: 'Mensajes' },
                { icon: faMusic, text: 'Audio' }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#1a1a4a] p-4 rounded-lg cursor-pointer hover:bg-[#3d3d9e] transition-colors"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-[#F5E050] text-2xl mb-2" />
                  <p className="text-white">{item.text}</p>
                </div>
              ))}
            </div>
            <div
              className="border-2 border-dashed border-[#3d3d9e] rounded-lg p-8 text-center cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            >
              <FontAwesomeIcon icon={faFileAlt} className="text-[#F5E050] text-4xl mb-4" />
              <p className="text-white">Arrastra archivos aquí o haz clic para seleccionar</p>
              <input
                type="file"
                name="file"           // <-- AGREGA ESTO
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            {/* Mostrar archivos subidos */}
            <div className="mt-4">
              {formData.archivos.length > 0 && (
                <ul className="text-white">
                  {formData.archivos.map((archivo, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      {archivo.name} <span className="text-gray-400">({archivo.type})</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveArchivo(idx)}
                        className="ml-2 text-red-500 hover:text-red-700 font-bold"
                        title="Eliminar archivo"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="block text-white mb-2">Privacidad</label>
             {[
  { icon: faLock, value: 'privada', label: 'Privada' },
  { icon: faUsers, value: 'grupos', label: 'Grupos/Personas' },
  { icon: faGlobe, value: 'publica', label: 'Pública' }
].map((option) => (
  <div key={option.value} className="flex items-center space-x-2">
    <input
      type="radio"
      name="privacidad"
      value={option.value}
      checked={formData.privacidad === option.value}
      onChange={handleChange}
      className="text-[#F5E050] focus:ring-[#F5E050]"
    />
    <FontAwesomeIcon icon={option.icon} className="text-[#F5E050]" />
    <span className="text-white">{option.label}</span>
  </div>
))}

            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="notificaciones"
                checked={formData.notificaciones}
                onChange={handleChange}
                className="text-[#F5E050] focus:ring-[#F5E050]"
              />
              <FontAwesomeIcon icon={faBell} className="text-[#F5E050]" />
              <span className="text-white">Notificar antes de la apertura</span>
            </div>
            {formData.privacidad === 'privada' && (
  <div>
    <label className="block text-white mb-2">Contraseña para abrir la cápsula</label>
    <input
      type="password"
      name="password"
      value={formData.password || ''}
      onChange={handleChange}
      className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050]"
      required
    />
  </div>
)}
{formData.privacidad === 'grupos' && (
  <div className="mt-4">
    <label className="block text-white mb-2">Añadir destinatarios</label>
    <form
      onSubmit={e => {
        e.preventDefault();
        if (recipientEmail && recipientRole) {
          setFormData(prev => ({
            ...prev,
            recipients: [
              ...(prev.recipients || []),
              { email: recipientEmail, role: recipientRole }
            ]
          }));
          setRecipientEmail('');
          setRecipientRole('Reader');
        }
      }}
      className="flex gap-2 mb-2"
    >
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
        type="submit"
        className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded-full font-bold"
      >
        Añadir
      </button>
    </form>
    <ul>
      {(formData.recipients || []).map((r, idx) => (
        <li key={idx} className="text-white flex gap-2 items-center">
          {r.email} - {r.role}
          <button
            type="button"
            onClick={() =>
              setFormData(prev => ({
                ...prev,
                recipients: prev.recipients.filter((_, i) => i !== idx)
              }))
            }
            className="ml-2 text-red-500 hover:text-red-700 font-bold"
            title="Eliminar destinatario"
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  </div>
)}
          </div>
        );

      case 3:
        return (
          <div className="space-y-8 text-white">
      {/* Información */}
      <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2">
        {/* Portada */}
        <div className="flex justify-center mb-4">
          {coverImage ? (
            <img
              src={URL.createObjectURL(coverImage)}
              alt="Portada"
              className="w-40 h-32 rounded-lg object-cover border-4 border-[#F5E050] shadow-lg"
            />
          ) : (
            <div className="w-40 h-32 rounded-lg bg-[#F5E050] flex items-center justify-center">
              <FontAwesomeIcon icon={faImage} className="text-[#2E2E7A] text-4xl" />
            </div>
          )}
        </div>
        <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faBoxArchive} /> Información
        </h3>
        <p><span className="text-[#F5E050]">Nombre:</span> {formData.nombre}</p>
        <p><span className="text-[#F5E050]">Descripción:</span> {formData.descripcion}</p>
        <p><span className="text-[#F5E050]">Fecha de apertura:</span> {formData.fechaApertura}</p>
        <p><span className="text-[#F5E050]">Categoría:</span> {
    categorias.find(cat => cat.Category_ID === Number(formData.categoriaId))?.Name || 'Sin categoría'
  }</p>
        <p>
          <span className="text-[#F5E050]">Tags:</span> {formData.tags && formData.tags.length > 0 ? formData.tags.join(', ') : 'Ninguno'}
        </p>
      </div>

      {/* Contenido */}
      <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2">
        <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faFileAlt} /> Contenido
        </h3>
        {formData.archivos.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {formData.archivos.map((archivo, idx) => {
              // Usa path definitivo si existe, si no usa tmpPath, si no usa URL local
              const filePath = archivo.path || archivo.tmpPath;
              return (
                <div key={idx} className="w-24 h-24 bg-[#F5E050] rounded-lg flex items-center justify-center overflow-hidden relative group">
                  {archivo.type.startsWith('image') ? (
                    <img
                      src={
                        filePath
                          ? `/api/${filePath.replace(/^\/?/, '')}`
                          : URL.createObjectURL(archivo.file)
                      }
                      alt={archivo.name}
                      className="object-cover w-full h-full"
                    />
                  ) : archivo.type.startsWith('video') ? (
                    <video
                      src={
                        filePath
                          ? `/api/${filePath.replace(/^\/?/, '')}`
                          : URL.createObjectURL(archivo.file)
                      }
                      className="object-cover w-full h-full"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : archivo.type.startsWith('audio') ? (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2E2E7A] mb-1">
                        <FontAwesomeIcon icon={faMusic} className="text-[#F5E050] text-xl" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[#2E2E7A] font-bold">{archivo.name.split('.').pop().toUpperCase()}</span>
                  )}
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {archivo.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400">No hay archivos añadidos.</p>
        )}
      </div>

      {/* Configuración */}
      <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2">
        <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
          <FontAwesomeIcon icon={faLock} /> Configuración
        </h3>
        <p><span className="text-[#F5E050]">Privacidad:</span> {formData.privacidad}</p>
        {formData.privacidad === 'privada' && (
          <p><span className="text-[#F5E050]">Contraseña:</span> {formData.password ? '******' : 'No establecida'}</p>
        )}
        {formData.privacidad === 'grupos' && (
          <div>
            <span className="text-[#F5E050]">Destinatarios:</span>
            <ul className="ml-4 list-disc">
              {(formData.recipients || []).map((r, idx) => (
                <li key={idx}>{r.email} - {r.role}</li>
              ))}
            </ul>
          </div>
        )}
        <p>
          <span className="text-[#F5E050]">Notificaciones:</span> {formData.notificaciones ? 'Sí' : 'No'}
        </p>
      </div>
    </div>
        );

      default:
        return null;
    }
  };

  const handleCreateCapsule = async () => {
  try {
    // Mapeo de privacidad del frontend al backend
    const privacyMap = {
      'privada': 'private',
      'grupos': 'group',
      'publica': 'public'
    };
    const privacyValue = privacyMap[formData.privacidad] || 'private';

    // VALIDACIÓN DE FECHAS
    const fechaCreacion = new Date();
    const fechaApertura = new Date(formData.fechaApertura);
    if (fechaApertura <= fechaCreacion) {
      alert('La fecha de apertura debe ser posterior a la fecha de creación.');
      return;
    }

    // 1. Crear la cápsula (con portada)
    const formDataCapsule = new FormData();
    formDataCapsule.append('Title', formData.nombre);
    formDataCapsule.append('Description', formData.descripcion);
    formDataCapsule.append('Creation_Date', new Date().toISOString().slice(0, 19).replace('T', ' '));
    formDataCapsule.append('Opening_Date', formData.fechaApertura);
    formDataCapsule.append('Privacy', privacyValue);
    formDataCapsule.append('Tags', formData.tags.join(','));
    formDataCapsule.append('Creator_User_ID', userId);
    formDataCapsule.append('Password', privacyValue === 'private' ? formData.password : '');
    formDataCapsule.append('Category_ID', formData.categoriaId);
    formDataCapsule.append('notificaciones', formData.notificaciones);
    if (coverImage) {
      formDataCapsule.append('cover_image', coverImage);
    }

    const token = localStorage.getItem('token');
    const resCapsule = await fetch('/api/capsules', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formDataCapsule,
    });
    const capsuleData = await resCapsule.json();
    console.log('Respuesta creación cápsula:', capsuleData);
    const capsuleId = capsuleData.Capsule_ID || capsuleData.id;
    if (!resCapsule.ok || !capsuleId) {
      throw new Error(capsuleData.message || 'Error al crear cápsula (ID no recibido)');
    }

    // Ya NO subas la portada aquí, porque ya se subió en el POST

    // 2. Sube los archivos con userId y capsuleId
    for (const archivo of formData.archivos) {
      console.log('Moviendo archivo:', {
        userId,
        capsuleId,
        tmpPath: archivo.tmpPath
      });
      const resMove = await fetch('/api/upload/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          capsuleId,
          tmpPath: archivo.tmpPath
        }),
      });
      const data = await resMove.json();
      if (resMove.ok) {
        // Actualiza el archivo en el array
        archivo.path = data.filePath;
        delete archivo.tmpPath;

        // Guarda en Contents
        await fetch('/api/contents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Type: getTypeFromMime(archivo.type),
            File_Path: data.filePath, // nueva ruta definitiva
            Creation_Date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            Capsule_ID: capsuleId,
          }),
        });
      }
    }

    // 3. Manejo de destinatarios para grupos
    if (privacyValue === 'group' && formData.recipients && formData.recipients.length > 0) {
      // Obtén los roles desde el backend o usa IDs fijos si sabes cuáles son
      const roleMap = { 'Reader': 2, 'Collaborator': 3 }; // Según tu tabla Roles
      for (const recipient of formData.recipients) {
        // Busca el usuario por email (puedes hacer un fetch al backend para obtener el User_ID)
        const resUser = await fetch(`/api/users/email/${recipient.email}`);
        const userData = await resUser.json();
        if (resUser.ok && userData.User_ID) {
          await fetch('/api/recipients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              User_ID: userData.User_ID,
              Capsule_ID: capsuleId,
              Role_ID: roleMap[recipient.role]
            }),
          });
        }
        // Si el usuario no existe, puedes mostrar un error o ignorar
      }
    }

    // Mostrar carrusel modal si hay archivos
    if (formData.archivos.length > 0) {
      // Selecciona 3 archivos aleatorios
      const shuffled = [...formData.archivos].sort(() => 0.5 - Math.random());
      setCarruselArchivos(formData.archivos); // <-- pasa todos los archivos, no solo 3
      setShowModal(true);
    }

    alert('¡Cápsula creada con éxito!');
    // Redirige o limpia el formulario si quieres
  } catch (err) {
    alert('Error al crear la cápsula: ' + err.message);
  }
};

  // Función para mapear MIME a ENUM
  function getTypeFromMime(mime) {
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    if (mime.startsWith('audio/')) return 'audio';
    return 'file';
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Barra de progreso */}
      <div className="flex justify-between mb-8">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex flex-col items-center w-1/4 ${
              currentStep >= step.id ? 'text-[#F5E050]' : 'text-gray-500'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2
              ${currentStep >= step.id ? 'bg-[#F5E050] text-[#2E2E7A]' : 'bg-[#1a1a4a]'}`}
            >
              <FontAwesomeIcon icon={step.icon} />
            </div>
            <span className="text-sm">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Contenedor del paso actual */}
      <div className="bg-[#2E2E7A] rounded-xl p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl text-[#F5E050] passero-font">
            {steps[currentStep].title}
          </h2>
        </div>

        {renderStepContent()}

        {/* Mensaje de límite de creación de cápsulas */}
        {!puedeCrear && (
          <div className="text-center text-red-500 mb-4">
            {planMsg || 'Has alcanzado el límite de cápsulas para tu plan.'}
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="px-6 py-2 bg-[#1a1a4a] text-white rounded-full hover:bg-[#3d3d9e]"
            >
              Anterior
            </button>
          )}
          <button
            onClick={currentStep === steps.length - 1 ? handleCreateCapsule : nextStep}
            className="ml-auto px-6 py-2 bg-[#F5E050] text-[#2E2E7A] rounded-full hover:bg-[#e6d047]"
            disabled={!puedeCrear && currentStep === steps.length - 1}
          >
            {currentStep === steps.length - 1 ? 'Crear Cápsula' : 'Siguiente'}
          </button>
        </div>
      </div>

      <CapsuleCreatedModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        archivos={carruselArchivos}
      />
    </div>
  );
};

export default CrearCapsula;