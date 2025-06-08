import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faFileAlt,
  faMusic,
  faLock,
  faClock,
  faUser,
  faBoxArchive,
  faDownload,
  faImage,
  faVideo,
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

const VerCapsula = () => {
  const { id } = useParams();
  const [capsula, setCapsula] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  // Nuevo estado para comentarios
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [comentLoading, setComentLoading] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [comentarioEditado, setComentarioEditado] = useState('');
  const [modal, setModal] = useState({ open: false, title: '', message: '' });
  const [deleteTarget, setDeleteTarget] = useState(null);

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

  useEffect(() => {
    // Sumar una visualización al cargar
    fetch(`/api/capsules/${id}/view`, { method: 'POST' });
  }, [id]);

  useEffect(() => {
    if (capsula) {
      setLikes(capsula.Likes ?? capsula.likes ?? 0);
      // Saber si el usuario ya dio like
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        fetchWithAuth(`/api/capsules/${id}/liked`)
          .then(res => res.json())
          .then(data => setLiked(data.liked));
      }
    }
  }, [capsula, id]);

  // Cargar comentarios al montar
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

  const handleLike = async () => {
    if (likeLoading) return;
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return alert('Debes iniciar sesión para dar me gusta');
    setLikeLoading(true);
    let newLiked = liked;
    if (liked) {
      const res = await fetchWithAuth(`/api/capsules/${id}/like`, { method: 'DELETE' });
      if (res.ok) {
        setLiked(false);
        setLikes(likes - 1);
        newLiked = false;
      }
    } else {
      const res = await fetchWithAuth(`/api/capsules/${id}/like`, { method: 'POST' });
      if (res.ok) {
        setLiked(true);
        setLikes(likes + 1);
        newLiked = true;
      }
    }
    setLikeLoading(false);
  };

  // Función para enviar comentario
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
      // Recarga comentarios
      const data = await res.json();
      setComentarios(prev => [...prev, { ...data, Name: user.name }]);
    }
    setComentLoading(false);
  };

  if (loading) {
    return <div className="text-center text-[#F5E050] py-10">Cargando cápsula...</div>;
  }

  if (!capsula) {
    return <div className="text-center text-red-500 py-10">No se encontró la cápsula.</div>;
  }

  if (capsula && capsula.error === 'forbidden') {
    return (
      <div className="text-center text-[#F5E050] py-10">
        {capsula.message || 'Esta cápsula aún no está disponible.'}
      </div>
    );
  }

  // Validación de fecha de apertura
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

  // Obtén el usuario actual
  const user = JSON.parse(localStorage.getItem('user'));
  const isOwner = user && capsula && user.id === capsula.Creator_User_ID;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2E2E7A] via-[#1a1a4a] to-[#23235b] py-8 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-white">
          {/* Información */}
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
              <div className="flex flex-col items-center mt-4 md:mt-0">
                <FontAwesomeIcon icon={faUser} className="text-4xl text-[#F5E050] animate-bounce-slow" />
                <span className="text-sm mt-2 text-gray-300">Creador: Usuario #{capsula.Creator_User_ID}</span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faFileAlt} /> Contenido
            </h3>
            {Array.isArray(archivos) && archivos.length === 0 ? (
              <p className="text-gray-400">No hay archivos en esta cápsula.</p>
            ) : (
              <div className="flex flex-wrap gap-6">
                {Array.isArray(archivos) && archivos.map(archivo => (
                  <div
                    key={archivo.Content_ID}
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow-lg transition-transform duration-200 hover:scale-105"
                  >
                    {archivo.Type === 'image' && archivo.Path ? (
                      <img
                        src={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`}
                        alt={archivo.Name}
                        className="object-cover w-full h-full"
                      />
                    ) : archivo.Type === 'video' && archivo.Path ? (
                      <video
                        src={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`}
                        className="object-cover w-full h-full"
                        controls
                        poster="https://placehold.co/160x160?text=Video"
                      />
                    ) : archivo.Type === 'audio' && archivo.Path ? (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <FontAwesomeIcon icon={faMusic} className="text-4xl text-[#2E2E7A] mb-2 animate-fade-in" />
                        <audio controls className="w-full">
                          <source src={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`} />
                          Tu navegador no soporta audio.
                        </audio>
                      </div>
                    ) : archivo.Path ? (
                      <a
                        href={`/api${archivo.Path.startsWith('/') ? archivo.Path : '/' + archivo.Path}`}
                        download
                        className="flex flex-col items-center justify-center w-full h-full"
                      >
                        <FontAwesomeIcon icon={faDownload} className="text-3xl text-[#2E2E7A] mb-2" />
                        <span className="text-xs text-[#2E2E7A]">{archivo.Name || 'Archivo'}</span>
                      </a>
                    ) : (
                      <span className="text-[#2E2E7A] font-bold text-xs text-center px-2">
                        {archivo.Name || 'ARCHIVO'}<br />
                        <span className="block">{archivo.Type}</span>
                        <span className="block">{archivo.Path}</span>
                      </span>
                    )}
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

          {/* Configuración */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} /> Configuración
            </h3>
            <p><span className="text-[#F5E050]">Privacidad:</span> {capsula.Privacy}</p>
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

          {/* Interacciones */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faHeart} /> Interacciones
            </h3>
            <div className="flex items-center gap-4 mt-2">
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
              <span className="flex items-center gap-1 text-gray-400">
                <FontAwesomeIcon icon={faEye} />
                {capsula.Views ?? capsula.views ?? 0}
              </span>
            </div>
          </div>

          {/* Comentarios */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-xl mt-8 animate-fade-in-up transition-transform duration-300 hover:scale-[1.01]">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              Comentarios
            </h3>
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
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {comentarios.length === 0 && (
                <div className="text-gray-400">Sé el primero en comentar.</div>
              )}
              {comentarios.map(com => (
                <div key={com.Comment_ID} className="bg-[#23236a] rounded p-2 text-sm animate-fade-in">
                  <span className="font-bold text-[#F5E050]">{com.Name || `Usuario #${com.User_ID}`}</span>
                  <span className="ml-2 text-gray-400">{new Date(com.Creation_Date).toLocaleString()}</span>
                  <div className="mt-1 text-white">
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

      {/* Modal de confirmación */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ ...modal, open: false })}
        title={modal.title}
      >
        <div>{modal.message}</div>
      </Modal>

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