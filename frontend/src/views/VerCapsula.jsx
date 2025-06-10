import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faMusic,
  faLock,
  faUser,
  faBoxArchive,
  faDownload,
  faEye,
  faEyeSlash,
  faHeart
} from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../helpers/fetchWithAuth';
import Modal from '../components/modals/Modal';

function getImageUrl(capsula) {
  if (capsula.Cover_Image || capsula.cover_image) {
    const cover = capsula.Cover_Image || capsula.cover_image;
    return cover.startsWith('http')
      ? cover
      : `http://44.209.31.187:3000/api${cover}`;
  }
  return "https://picsum.photos/400/300";
}

// Componente para ver el detalle de una cápsula, sus archivos, comentarios e interacciones
const VerCapsula = () => {
  // Obtiene el parámetro de la URL (ID de la cápsula)
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados principales del componente
  const [capsula, setCapsula] = useState(null); // Datos de la cápsula
  const [archivos, setArchivos] = useState([]); // Archivos asociados a la cápsula
  const [loading, setLoading] = useState(true); // Estado de carga
  const [showPassword, setShowPassword] = useState(false); // Mostrar/ocultar contraseña
  const [liked, setLiked] = useState(false); // Si el usuario dio like
  const [likes, setLikes] = useState(0); // Número de likes
  const [likeLoading, setLikeLoading] = useState(false); // Estado de carga para like

  // Estados para comentarios
  const [comentarios, setComentarios] = useState([]); // Lista de comentarios
  const [nuevoComentario, setNuevoComentario] = useState(''); // Texto del nuevo comentario
  const [comentLoading, setComentLoading] = useState(false); // Estado de carga para comentar
  const [editandoId, setEditandoId] = useState(null); // ID del comentario en edición
  const [comentarioEditado, setComentarioEditado] = useState(''); // Texto editado
  const [modal, setModal] = useState({ open: false, title: '', message: '' }); // Modal de mensajes
  const [deleteTarget, setDeleteTarget] = useState(null); // ID del comentario a eliminar
  const [miRol, setMiRol] = useState(null); // Rol del usuario en la cápsula

  // Efecto: carga los datos de la cápsula al montar o cambiar el ID
  useEffect(() => {
    const fetchCapsula = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const res = await fetchWithAuth(`/api/capsules/${id}`, {
          headers: {
            'x-user-id': user?.id
          }
        });
        if (!res.ok) {
          const data = await res.json();
          if (res.status === 403) {
            setCapsula({ error: 'forbidden', message: data.message });
          } else {
            setCapsula(null);
          }
          setLoading(false);
          return;
        }
        const data = await res.json();
        setCapsula(data);
      } catch (err) {
        setCapsula(null);
      }
      setLoading(false);
    };
    fetchCapsula();
  }, [id]);

  // Efecto: carga los archivos de la cápsula
  useEffect(() => {
    const fetchArchivos = async () => {
      try {
        const res = await fetchWithAuth(`/api/contents/capsule/${id}`);
        const data = await res.json();
        setArchivos(data);
      } catch (err) {
        setArchivos([]);
      }
    };
    fetchArchivos();
  }, [id]);

  // Efecto: suma una visualización al cargar la cápsula
  useEffect(() => {
    fetch(`/api/capsules/${id}/view`, { method: 'POST' });
  }, [id]);

  // Efecto: actualiza likes y si el usuario ya dio like
  useEffect(() => {
    if (capsula) {
      setLikes(capsula.Likes ?? capsula.likes ?? 0);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        fetchWithAuth(`/api/capsules/${id}/liked`)
          .then(res => res.json())
          .then(data => setLiked(data.liked));
      }
    }
  }, [capsula, id]);

  // Efecto: carga los comentarios de la cápsula
  useEffect(() => {
    const fetchComentarios = async () => {
      try {
        const res = await fetch(`/api/comments?Capsule_ID=${id}`);
        const data = await res.json();
        setComentarios(data);
      } catch (err) {
        setComentarios([]);
      }
    };
    fetchComentarios();
  }, [id]);

  // Efecto: obtiene el rol del usuario en la cápsula (colaborador o lector)
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;
    fetch(`/api/recipients/capsule/${id}`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(r => r.Email === user.email);
        setMiRol(found ? found.RoleName : null); // 'Reader' o 'Collaborator'
      });
  }, [id]);

  // Handler para dar o quitar like a la cápsula
  const handleLike = async () => {
    if (likeLoading) return;
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert('Debes iniciar sesión para dar me gusta');
    setLikeLoading(true);
    let newLiked = liked;
    if (liked) {
      // Si ya dio like, lo quita
      const res = await fetchWithAuth(`/api/capsules/${id}/like`, { method: 'DELETE' });
      if (res.ok) {
        setLiked(false);
        setLikes(likes - 1);
        newLiked = false;
      }
    } else {
      // Si no ha dado like, lo agrega
      const res = await fetchWithAuth(`/api/capsules/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setLiked(true);
        setLikes(likes + 1);
        newLiked = true;
      }
    }
    setLikeLoading(false);
  };

  // Handler para enviar un nuevo comentario
  const handleComentar = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setComentLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      setComentLoading(false);
      return;
    }
    // Envía el comentario al backend
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': user.id
      },
      body: JSON.stringify({
        Content: nuevoComentario,
        Creation_Date: new Date().toISOString().slice(0, 19).replace('T', ' '),
        User_ID: user.id,
        Capsule_ID: id
      })
    });
    if (res.ok) {
      setNuevoComentario('');
      // Agrega el comentario a la lista local sin recargar todo
      const data = await res.json();
      setComentarios(prev => [...prev, { ...data, Name: user.name }]);
    }
    setComentLoading(false);
  };

  // Muestra un mensaje de carga mientras se obtienen los datos
  if (loading) {
    return <div className="text-center text-[#F5E050] py-10">Cargando cápsula...</div>;
  }

  // Si no se encontró la cápsula
  if (!capsula) {
    return <div className="text-center text-red-500 py-10">No se encontró la cápsula.</div>;
  }

  // Si la cápsula está protegida y el usuario no tiene acceso
  if (capsula && capsula.error === 'forbidden') {
    return (
      <div className="text-center text-[#F5E050] py-10">
        {capsula.message || 'Esta cápsula aún no está disponible.'}
      </div>
    );
  }

  // Valida si la cápsula está programada para el futuro
  const ahora = new Date();
  const apertura = new Date(capsula.Opening_Date);
  if (apertura > ahora) {
    return (
      <div className="text-center text-[#F5E050] py-10">
        Esta cápsula aún no está disponible.<br />
        Fecha de apertura: <b>{apertura.toLocaleDateString()}</b>
      </div>
    );
  }

  // Obtiene el usuario actual y verifica si es el creador
  const user = JSON.parse(localStorage.getItem('user'));
  const isOwner = user && capsula && user.id === capsula.Creator_User_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] py-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-white">
          {/* Sección de información general de la cápsula */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-down transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faBoxArchive} /> Información
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:gap-8">
              <div className="flex-1 space-y-2">
                <p><span className="text-[#F5E050]">Nombre:</span> {capsula.Title}</p>
                <p><span className="text-[#F5E050]">Descripción:</span> {capsula.Description || 'Sin descripción'}</p>
                <p><span className="text-[#F5E050]">Fecha de apertura:</span> {new Date(capsula.Opening_Date).toLocaleDateString()}</p>
                <p><span className="text-[#F5E050]">Fecha de creación:</span> {new Date(capsula.Creation_Date).toLocaleDateString()}</p>
                {/* Muestra los tags asociados */}
                <div className="flex items-center gap-2">
                  <span className="text-[#F5E050]">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(capsula.Tags)
                      ? capsula.Tags
                      : typeof capsula.Tags === "string"
                        ? capsula.Tags.split(',').map(t => t.trim()).filter(Boolean)
                        : []
                    ).map(tag => (
                      <span
                        key={tag}
                        className="bg-[#F5E050] text-[#2E2E7A] px-2 py-1 rounded text-xs animate-fade-in-up"
                      >
                        {tag}
                      </span>
                    ))}
                    {(!capsula.Tags || (Array.isArray(capsula.Tags) && capsula.Tags.length === 0)) && (
                      <span className="text-gray-400">Ninguno</span>
                    )}
                  </div>
                </div>
                <p><span className="text-[#F5E050]">Categoría:</span>{" "}
                  {capsula.Category?.Name || capsula.Category || capsula.Category_Name || 'Sin categoría'}
                </p>
              </div>
              {/* Muestra el creador de la cápsula */}
              <div className="flex flex-col items-center mt-4 md:mt-0">
                <FontAwesomeIcon icon={faUser} className="text-4xl text-[#F5E050] animate-bounce-slow" />
                <span className="text-sm mt-2 text-gray-300">Creador: Usuario #{capsula.Creator_User_ID}</span>
              </div>
            </div>
          </div>

          {/* Sección de archivos y contenidos de la cápsula */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} /> Contenido
            </h3>
            {Array.isArray(archivos) && archivos.length === 0 ? (
              <p className="text-gray-400">No hay archivos en esta cápsula.</p>
            ) : (
              <div className="flex flex-wrap gap-6">
                {/* Renderiza cada archivo según su tipo */}
                {Array.isArray(archivos) && archivos.map(archivo => (
                  <div
                    key={archivo.Content_ID}
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow-lg transition-transform duration-200 hover:scale-105"
                  >
                    {/* Imagen */}
                    {archivo.Type === 'image' && archivo.Path ? (
                      <img
                        src={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`}
                        alt={archivo.Name}
                        className="object-cover w-full h-full"
                      />
                    ) : archivo.Type === 'video' && archivo.Path ? (
                      // Video
                      <video
                        src={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`}
                        className="object-cover w-full h-full"
                        controls
                        poster="https://placehold.co/160x160?text=Video"
                      />
                    ) : archivo.Type === 'audio' && archivo.Path ? (
                      // Audio
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <FontAwesomeIcon icon={faMusic} className="text-4xl text-[#2E2E7A] mb-2 animate-fade-in" />
                        <audio controls className="w-full">
                          <source src={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`} />
                          Tu navegador no soporta audio.
                        </audio>
                      </div>
                    ) : archivo.Path ? (
                      // Otros archivos descargables
                      <a
                        href={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`}
                        download
                        className="flex flex-col items-center justify-center w-full h-full"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-3xl text-[#2E2E7A] mb-2" />
                        <span className="text-xs text-[#2E2E7A]">{archivo.Name || 'Archivo'}</span>
                      </a>
                    ) : (
                      // Si no hay archivo válido
                      <span className="text-[#2E2E7A] font-bold text-xs text-center px-2">
                        {archivo.Name || 'ARCHIVO'}<br />
                        <span className="block">{archivo.Type}</span>
                        <span className="block">{archivo.Path}</span>
                      </span>
                    )}
                    {/* Tooltip con el nombre del archivo */}
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {archivo.Name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sección de configuración y privacidad */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} /> Configuración
            </h3>
            <p><span className="text-[#F5E050]">Privacidad:</span> {capsula.Privacy}</p>
            {/* Si es privada, muestra la contraseña (solo para el dueño) */}
            {capsula.Privacy === 'private' && (
              <p className="flex items-center gap-2">
                <span className="text-[#F5E050]">Contraseña:</span>
                {(capsula.Password && String(capsula.Password).length > 0)
                  ? (
                    <>
                      {isOwner ? (
                        <>
                          <span>
                            {showPassword ? capsula.Password : '******'}
                          </span>
                          <button
                            type="button"
                            className="ml-2 text-[#F5E050] hover:text-[#e6d047] focus:outline-none"
                            onClick={() => setShowPassword(v => !v)}
                            title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                          >
                            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                          </button>
                        </>
                      ) : (
                        '******'
                      )}
                    </>
                  )
                  : 'No establecida'
                }
              </p>
            )}
          </div>

          {/* Sección de interacciones: likes y vistas */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faHeart} /> Interacciones
            </h3>
            <div className="flex items-center gap-4 mt-2">
              {/* Botón de like */}
              <button
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all duration-200 shadow-lg ${
                  liked ? 'bg-pink-500 text-white scale-105' : 'bg-gray-700 text-pink-500 hover:bg-pink-600 hover:text-white'
                }`}
                onClick={handleLike}
                disabled={likeLoading}
              >
                <FontAwesomeIcon icon={faHeart} />
                {likes}
              </button>
              {/* Número de vistas */}
              <span className="flex items-center gap-1 text-gray-400">
                <FontAwesomeIcon icon={faEye} />
                {capsula.Views ?? capsula.views ?? 0}
              </span>
            </div>
          </div>

          {/* Sección de comentarios */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl mt-8 animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              Comentarios
            </h3>
            {/* Formulario para agregar comentario */}
            <form onSubmit={handleComentar} className="flex gap-2 mb-4">
              <input
                type="text"
                value={nuevoComentario}
                onChange={e => setNuevoComentario(e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-gray-800 text-white border border-[#3d3d9e] focus:outline-none focus:border-[#F5E050] shadow-inner focus:shadow-[#F5E050]/20 transition-all duration-200"
                placeholder="Escribe un comentario..."
                disabled={comentLoading}
              />
              <button
                type="submit"
                className="bg-[#F5E050] text-[#2E2E7A] px-4 py-2 rounded font-bold hover:bg-[#e6d047] transition-all duration-200"
                disabled={comentLoading}
              >
                Comentar
              </button>
            </form>
            {/* Lista de comentarios */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comentarios.length === 0 && (
                <div className="text-gray-400">Sé el primero en comentar.</div>
              )}
              {comentarios.map(com => (
                <div key={com.Comment_ID} className="bg-[#23236a] rounded p-2 text-sm animate-fade-in">
                  <span className="font-bold text-[#F5E050]">{com.Name || `Usuario #${com.User_ID}`}</span>
                  <span className="ml-2 text-gray-400">{new Date(com.Creation_Date).toLocaleString()}</span>
                  <div className="mt-1 text-white">
                    {/* Si está editando este comentario, muestra input */}
                    {editandoId === com.Comment_ID ? (
                      <form
                        onSubmit={async e => {
                          e.preventDefault();
                          await fetch(`/api/comments/${com.Comment_ID}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ Content: comentarioEditado })
                          });
                          setComentarios(prev =>
                            prev.map(c =>
                              c.Comment_ID === com.Comment_ID
                                ? { ...c, Content: comentarioEditado }
                                : c
                            )
                          );
                          setEditandoId(null);
                        }}
                      >
                        <input
                          className="bg-gray-800 text-white border border-[#3d3d9e] rounded px-2 py-1 w-full"
                          value={comentarioEditado}
                          onChange={e => setComentarioEditado(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-1">
                          <button type="submit" className="bg-[#F5E050] text-[#2E2E7A] px-2 py-1 rounded text-xs font-bold hover:bg-[#e6d047] transition-all">Guardar</button>
                          <button type="button" className="bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-600 transition-all" onClick={() => setEditandoId(null)}>Cancelar</button>
                        </div>
                      </form>
                    ) : (
                      <>{com.Content}</>
                    )}
                  </div>
                  {/* Botones de editar/eliminar solo para el autor */}
                  {user && user.id === com.User_ID && editandoId !== com.Comment_ID && (
                    <div className="flex gap-2 mt-1">
                      <button
                        className="text-xs text-[#F5E050] underline hover:text-[#e6d047] transition-all"
                        onClick={() => {
                          setEditandoId(com.Comment_ID);
                          setComentarioEditado(com.Content);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className="text-xs text-red-400 underline hover:text-red-600 transition-all"
                        onClick={() => setDeleteTarget(com.Comment_ID)}
                      >
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para eliminar comentario */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirmar eliminación"
      >
        <div>¿Eliminar este comentario?</div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all"
            onClick={() => setDeleteTarget(null)}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-all"
            onClick={async () => {
              await fetch(`/api/comments/${deleteTarget}`, { method: 'DELETE' });
              setComentarios(prev => prev.filter(c => c.Comment_ID !== deleteTarget));
              setDeleteTarget(null);
            }}
          >
            Eliminar
          </button>
        </div>
      </Modal>
      {/* Modal para mensajes generales */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>
      {/* Estilos y animaciones para efectos visuales */}
      <style>
        {`
          .animate-fade-in { animation: fadeIn 1s; }
          .animate-fade-in-down { animation: fadeInDown 1s; }
          .animate-fade-in-up { animation: fadeInUp 1s; }
          .animate-bounce-slow { animation: bounce 2s infinite; }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes fadeInDown { from { opacity: 0; transform: translateY(-30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px);} to { opacity: 1; transform: translateY(0);} }
          @keyframes bounce {
            0%, 100% { transform: translateY(0);}
            50% { transform: translateY(-10px);}
          }
        `}
      </style>
    </div>
  );
};

export default VerCapsula;