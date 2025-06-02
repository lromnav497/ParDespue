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
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { fetchWithAuth } from '../helpers/fetchWithAuth';

const VerCapsula = () => {
  const { id } = useParams();
  const [capsula, setCapsula] = useState(null);
  const [archivos, setArchivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="space-y-8 text-white">

          {/* Información */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-lg">
            <h3 className="text-lg font-bold text-[#F5E050] mb-2 flex items-center gap-2">
              <FontAwesomeIcon icon={faBoxArchive} /> Información
            </h3>
            <div className="flex flex-col md:flex-row md:items-center md:gap-8">
              <div className="flex-1 space-y-2">
                <p><span className="text-[#F5E050]">Nombre:</span> {capsula.Title}</p>
                <p><span className="text-[#F5E050]">Descripción:</span> {capsula.Description || 'Sin descripción'}</p>
                <p><span className="text-[#F5E050]">Fecha de apertura:</span> {new Date(capsula.Opening_Date).toLocaleDateString()}</p>
                <p><span className="text-[#F5E050]">Fecha de creación:</span> {new Date(capsula.Creation_Date).toLocaleDateString()}</p>
                <p><span className="text-[#F5E050]">Tags:</span> {capsula.Tags || 'Ninguno'}</p>
                <p><span className="text-[#F5E050]">Categoría:</span>{" "}
                  {capsula.Category?.Name || capsula.Category || capsula.Category_Name || 'Sin categoría'}
                </p>
              </div>
              <div className="flex flex-col items-center mt-4 md:mt-0">
                <FontAwesomeIcon icon={faUser} className="text-4xl text-[#F5E050]" />
                <span className="text-sm mt-2 text-gray-300">Creador: Usuario #{capsula.Creator_User_ID}</span>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-lg">
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
                    className="w-40 h-40 bg-[#F5E050] rounded-lg flex flex-col items-center justify-center overflow-hidden relative group shadow"
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
                        <FontAwesomeIcon icon={faMusic} className="text-4xl text-[#2E2E7A] mb-2" />
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
          <div className="bg-[#1a1a4a] p-6 rounded-lg space-y-2 shadow-lg">
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
            {/* Puedes agregar destinatarios, notificaciones, etc. aquí */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerCapsula;