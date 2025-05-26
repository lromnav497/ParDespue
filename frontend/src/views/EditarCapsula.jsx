import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave,
  faTrash,
  faImage,
  faVideo,
  faFileAlt,
  faMusic,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import DeleteCapsuleModal from '../components/modals/DeleteCapsuleModal';

const EditarCapsula = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [capsula, setCapsula] = useState({
    titulo: '',
    descripcion: '',
    fechaApertura: '',
    categoria: '',
    privacidad: 'privada',
    notificaciones: false,
    contenido: {
      imagenes: [],
      videos: [],
      mensajes: [],
      audios: []
    }
  });
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nuevoMensaje, setNuevoMensaje] = useState('');

  // Mapeo para mostrar en el select
  const privacyMap = {
    private: 'privada',
    public: 'publica',
    group: 'grupos',
  };
  const reversePrivacyMap = {
    privada: 'private',
    publica: 'public',
    grupos: 'group',
  };

  // Utilidad para normalizar arrays de contenido
  const normalizeArray = (arr, tipo) => {
    if (!arr) return [];
    // Si es array de strings (urls o textos)
    if (typeof arr[0] === 'string') {
      if (tipo === 'mensajes') {
        return arr.map((contenido, idx) => ({ id: idx, contenido }));
      }
      return arr.map((url, idx) => ({ id: idx, url }));
    }
    // Si ya es array de objetos
    if (typeof arr[0] === 'object') {
      return arr.map((item, idx) => ({
        id: item.id ?? idx,
        contenido: item.contenido ?? item.text ?? undefined,
        url: item.url ?? item.path ?? item.filePath ?? undefined,
        ...item
      }));
    }
    return [];
  };

  // Cargar datos reales de la cápsula
  useEffect(() => {
    const fetchCapsula = async () => {
      try {
        const res = await fetch(`/api/capsules/${id}`);
        if (res.ok) {
          const data = await res.json();
          console.log('DATA CAPSULA:', data); // <-- Para depuración

          setCapsula({
            titulo: data.Title ?? '',
            descripcion: data.Description ?? '',
            fechaApertura: data.Opening_Date
              ? data.Opening_Date.slice(0, 10)
              : '',
            categoria: data.Category?.Name || '',
            categoriaId: data.Category?.Category_ID || '',
            privacidad: privacyMap[data.Privacy] || 'privada', // <-- debe ser el valor exacto de la BD
            notificaciones: !!(data.Notifications ?? false),
            contenido: {
              imagenes: normalizeArray(data.Images, 'imagenes'),
              videos: normalizeArray(data.Videos, 'videos'),
              mensajes: normalizeArray(data.Messages, 'mensajes'),
              audios: normalizeArray(data.Audios, 'audios')
            }
          });
        } else {
          alert('No se pudo cargar la cápsula');
          navigate('/capsulas');
        }
      } catch (err) {
        alert('Error de red');
        navigate('/capsulas');
      } finally {
        setLoading(false);
      }
    };
    fetchCapsula();
    // eslint-disable-next-line
  }, [id, navigate]);

  // Cargar categorías para el selector
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategorias(data);
        } else {
          console.error('Error al cargar categorías');
        }
      } catch (err) {
        console.error('Error de red al cargar categorías');
      }
    };
    fetchCategorias();
  }, []);

  // Manejar cambios en los campos
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCapsula(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Eliminar contenido (imagen, video, mensaje, audio)
  const handleRemoveContenido = (tipo, itemId) => {
    setCapsula(prev => ({
      ...prev,
      contenido: {
        ...prev.contenido,
        [tipo]: prev.contenido[tipo].filter(item => item.id !== itemId)
      }
    }));
  };

  // Agregar archivo (imagen, video, audio) a la cápsula
  const handleAddFile = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = JSON.parse(localStorage.getItem('user'));
    const userId = user?.id;
    const formDataFile = new FormData();
    formDataFile.append('userId', userId);
    formDataFile.append('file', file);

    // Sube a carpeta temporal
    const resUpload = await fetch('/api/upload/tmp', {
      method: 'POST',
      body: formDataFile,
    });
    const data = await resUpload.json();

    setCapsula(prev => ({
      ...prev,
      contenido: {
        ...prev.contenido,
        [tipo]: [
          ...prev.contenido[tipo],
          {
            id: Date.now(),
            name: file.name,
            type: file.type,
            tmpPath: data.filePath,
          },
        ],
      },
    }));
  };

  // Agregar nuevo mensaje
  const handleAddMensaje = () => {
    if (!nuevoMensaje.trim()) return;
    setCapsula(prev => ({
      ...prev,
      contenido: {
        ...prev.contenido,
        mensajes: [...prev.contenido.mensajes, { id: Date.now(), contenido: nuevoMensaje }]
      }
    }));
    setNuevoMensaje('');
  };

  // Guardar cambios
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/capsules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          Title: capsula.titulo,
          Description: capsula.descripcion,
          Opening_Date: capsula.fechaApertura,
          Privacy: reversePrivacyMap[capsula.privacidad] || 'private',
          Category_ID: capsula.categoriaId, // <-- usa el ID
          Notifications: capsula.notificaciones,
          Images: capsula.contenido.imagenes.map(i => i.url || i),
          Videos: capsula.contenido.videos.map(i => i.url || i),
          Messages: capsula.contenido.mensajes.map(i => i.contenido || i),
          Audios: capsula.contenido.audios.map(i => i.url || i)
        }),
      });
      if (res.ok) {
        alert('Cápsula actualizada correctamente');
        navigate('/capsulas');
      } else {
        const error = await res.json();
        alert(error.message || 'Error al actualizar la cápsula');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  // Eliminar cápsula
  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/capsules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Cápsula eliminada correctamente');
        navigate('/capsulas');
      } else {
        const error = await res.json();
        alert(error.message || 'Error al eliminar la cápsula');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  if (loading) {
    return <div className="text-center text-[#F5E050]">Cargando cápsula...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-[#2E2E7A] rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl text-[#F5E050] passero-font">
            Editar Cápsula
          </h1>
          <div className="flex gap-4">
            <button
              onClick={handleSubmit}
              className="px-6 py-2 bg-[#F5E050] text-[#2E2E7A] rounded-full 
                hover:bg-[#e6d047] flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faSave} />
              Guardar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-6 py-2 bg-red-500 text-white rounded-full 
                hover:bg-red-600 flex items-center gap-2"
            >
              <FontAwesomeIcon icon={faTrash} />
              Eliminar
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white mb-2">Título</label>
              <input
                type="text"
                name="titulo"
                value={capsula.titulo}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 
                  text-white focus:outline-none focus:border-[#F5E050]"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Fecha de apertura</label>
              <input
                type="date"
                name="fechaApertura"
                value={capsula.fechaApertura}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 
                  text-white focus:outline-none focus:border-[#F5E050]"
              />
            </div>
            <div>
              <label className="block text-white mb-2">Categoría</label>
              <select
                name="categoriaId"
                value={capsula.categoriaId}
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
                name="privacidad"
                value={capsula.privacidad}
                onChange={handleChange}
                className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
              >
                <option value="privada">Privada</option>
                <option value="publica">Pública</option>
                <option value="grupos">Grupos</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-2">Notificaciones</label>
              <input
                type="checkbox"
                name="notificaciones"
                checked={capsula.notificaciones}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-white">Recibir notificaciones</span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-white mb-2">Descripción</label>
            <textarea
              name="descripcion"
              value={capsula.descripcion}
              onChange={handleChange}
              className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white focus:outline-none focus:border-[#F5E050]"
              rows={3}
            />
          </div>

          {/* Contenido actual */}
          <div>
            <h3 className="text-xl text-[#F5E050] mb-4">Contenido actual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Imágenes */}
              <div className="bg-[#1a1a4a] p-4 rounded-lg">
                <h4 className="text-white mb-2">Imágenes</h4>
                <div className="flex flex-wrap gap-2">
                  {capsula.contenido.imagenes.length === 0 && (
                    <div className="text-gray-500 text-sm">Sin imágenes</div>
                  )}
                  {capsula.contenido.imagenes.map(item => (
                    <div key={item.id} className="relative">
                      <img
                        src={item.url}
                        alt="Imagen cápsula"
                        className="w-24 h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-400"
                        onClick={() => handleRemoveContenido('imagenes', item.id)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Videos */}
              <div className="bg-[#1a1a4a] p-4 rounded-lg">
                <h4 className="text-white mb-2">Videos</h4>
                <div className="flex flex-col gap-2">
                  {capsula.contenido.videos.length === 0 && (
                    <div className="text-gray-500 text-sm">Sin videos</div>
                  )}
                  {capsula.contenido.videos.map(item => (
                    <div key={item.id} className="relative">
                      <video src={item.url} controls className="w-full rounded" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-400"
                        onClick={() => handleRemoveContenido('videos', item.id)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mensajes */}
              <div className="bg-[#1a1a4a] p-4 rounded-lg">
                <h4 className="text-white mb-2">Mensajes</h4>
                <div className="flex flex-col gap-2">
                  {capsula.contenido.mensajes.length === 0 && (
                    <div className="text-gray-500 text-sm">Sin mensajes</div>
                  )}
                  {capsula.contenido.mensajes.map(item => (
                    <div key={item.id} className="relative bg-[#23236a] p-2 rounded">
                      <span>{item.contenido}</span>
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-400"
                        onClick={() => handleRemoveContenido('mensajes', item.id)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              {/* Audios */}
              <div className="bg-[#1a1a4a] p-4 rounded-lg">
                <h4 className="text-white mb-2">Audios</h4>
                <div className="flex flex-col gap-2">
                  {capsula.contenido.audios.length === 0 && (
                    <div className="text-gray-500 text-sm">Sin audios</div>
                  )}
                  {capsula.contenido.audios.map(item => (
                    <div key={item.id} className="relative">
                      <audio src={item.url} controls className="w-full" />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-400"
                        onClick={() => handleRemoveContenido('audios', item.id)}
                        title="Eliminar"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Agregar nuevo contenido */}
          <div>
            <h3 className="text-xl text-[#F5E050] mb-4">Agregar contenido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Imagen */}
              <div>
                <label className="block text-white mb-2">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => handleAddFile(e, 'imagenes')}
                  className="block w-full text-white"
                />
              </div>
              {/* Video */}
              <div>
                <label className="block text-white mb-2">Video</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => handleAddFile(e, 'videos')}
                  className="block w-full text-white"
                />
              </div>
              {/* Audio */}
              <div>
                <label className="block text-white mb-2">Audio</label>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={e => handleAddFile(e, 'audios')}
                  className="block w-full text-white"
                />
              </div>
              {/* Mensaje */}
              <div>
                <label className="block text-white mb-2">Mensaje</label>
                <textarea
                  rows={2}
                  className="w-full bg-[#1a1a4a] border border-[#3d3d9e] rounded-lg py-2 px-4 text-white"
                  value={nuevoMensaje}
                  onChange={e => setNuevoMensaje(e.target.value)}
                />
                <button
                  type="button"
                  className="mt-2 bg-[#F5E050] text-[#2E2E7A] font-bold px-4 py-1 rounded hover:bg-[#e6d047]"
                  onClick={handleAddMensaje}
                >
                  Agregar mensaje
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <DeleteCapsuleModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        capsuleName={capsula.titulo}
      />
    </div>
  );
};

export default EditarCapsula;