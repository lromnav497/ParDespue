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

  useEffect(() => {
    // Aquí cargarías los datos de la cápsula desde tu API
    // Por ahora usamos datos de ejemplo
    setCapsula({
      titulo: "Memorias 2024",
      descripcion: "Una colección de momentos especiales",
      fechaApertura: "2025-01-01",
      categoria: "recuerdos",
      privacidad: "privada",
      notificaciones: true,
      contenido: {
        imagenes: [{ id: 1, url: "https://picsum.photos/400/300" }],
        videos: [{ id: 2, url: "video.mp4" }],
        mensajes: [{ id: 3, contenido: "Mensaje especial" }],
        audios: [{ id: 4, url: "audio.mp3" }]
      }
    });
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCapsula(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

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
          // Agrega aquí los demás campos que tu backend acepte
          // Por ejemplo: Categoria, Privacidad, etc.
        }),
      });
      if (res.ok) {
        alert('Cápsula actualizada correctamente');
        navigate('/miscapsulas');
      } else {
        const error = await res.json();
        alert(error.message || 'Error al actualizar la cápsula');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/capsules/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Cápsula eliminada correctamente');
        navigate('/miscapsulas');
      } else {
        const error = await res.json();
        alert(error.message || 'Error al eliminar la cápsula');
      }
    } catch (err) {
      alert('Error de red');
    }
  };

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
          </div>

          {/* Contenido actual */}
          <div>
            <h3 className="text-xl text-[#F5E050] mb-4">Contenido actual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(capsula.contenido).map(([tipo, items]) => (
                <div key={tipo} className="bg-[#1a1a4a] p-4 rounded-lg">
                  <h4 className="text-white mb-2 capitalize">{tipo}</h4>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div 
                        key={item.id}
                        className="flex justify-between items-center text-gray-300"
                      >
                        <span>{tipo === 'mensajes' ? item.contenido : item.url}</span>
                        <button 
                          className="text-red-500 hover:text-red-400"
                          onClick={() => {/* Lógica para eliminar item */}}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agregar nuevo contenido */}
          <div>
            <h3 className="text-xl text-[#F5E050] mb-4">Agregar contenido</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: faImage, text: 'Imagen' },
                { icon: faVideo, text: 'Video' },
                { icon: faFileAlt, text: 'Mensaje' },
                { icon: faMusic, text: 'Audio' }
              ].map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className="bg-[#1a1a4a] p-4 rounded-lg flex flex-col items-center 
                    gap-2 hover:bg-[#3d3d9e] transition-colors"
                >
                  <FontAwesomeIcon icon={item.icon} className="text-[#F5E050] text-2xl" />
                  <span className="text-white">{item.text}</span>
                </button>
              ))}
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