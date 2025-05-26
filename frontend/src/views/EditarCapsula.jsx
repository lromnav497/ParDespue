import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSave, faTimes, faTrash, faImage, faVideo, faFileAlt, faMusic, faArrowLeft
} from '@fortawesome/free-solid-svg-icons';

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

  // Cargar datos de la cápsula y archivos actuales
  useEffect(() => {
    const fetchCapsula = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/capsules/${id}`);
        const data = await res.json();
        setCapsula(data);
        setForm({
          Title: data.Title || '',
          Description: data.Description || '',
          Opening_Date: data.Opening_Date ? data.Opening_Date.slice(0, 10) : '',
          Category_ID: data.Category?.Category_ID || '',
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
                url: a.Path ? `/api/${a.Path.replace(/^\/?/, '')}` : undefined,
                name: a.Name,
              }))
            : []
        );
      } catch {
        setCapsula(null);
        setArchivos([]);
      }
      setLoading(false);
    };
    fetchCapsula();
  }, [id]);

  // Cargar categorías
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(setCategorias)
      .catch(() => setCategorias([]));
  }, []);

  // Eliminar archivo actual (solo del frontend, se elimina en el backend al guardar)
  const handleRemoveArchivo = (contentId) => {
    setArchivos(prev => prev.filter(a => a.id !== contentId && a.Content_ID !== contentId));
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
  const handleGuardar = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Actualiza los datos principales de la cápsula
      const res = await fetch(`/api/capsules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          Tags: form.Tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      if (!res.ok) throw new Error('Error al actualizar la cápsula');

      // 2. Elimina archivos marcados para borrar
      const archivosEliminados = []
        .concat(capsula.Images || [], capsula.Videos || [], capsula.Audios || [], capsula.Messages || [])
        .filter(a =>
          !archivos.some(b => (b.id || b.Content_ID) === (a.id || a.Content_ID))
        );
      for (const archivo of archivosEliminados) {
        await fetch(`/api/contents/${archivo.id || archivo.Content_ID}`, { method: 'DELETE' });
      }

      // 3. Sube nuevos archivos y los asocia a la cápsula
      const user = JSON.parse(localStorage.getItem('user'));
      const userId = user?.id;
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
            File_Path: moveData.filePath, // <--- SIEMPRE la definitiva
            Creation_Date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            Capsule_ID: id,
          }),
        });
      }

      alert('Cápsula actualizada correctamente');
      navigate(`/vercapsula/${id}`);
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
    </div>
  );
};

export default EditarCapsula;