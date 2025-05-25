import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic } from '@fortawesome/free-solid-svg-icons';

const CapsuleCreatedModal = ({ isOpen, onClose, archivos }) => {
  const [current, setCurrent] = useState(0);

  // Auto-avance cada 3 segundos
  useEffect(() => {
    if (!isOpen || archivos.length === 0) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % archivos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, archivos]);

  // Reinicia al abrir/cambiar archivos
  useEffect(() => {
    setCurrent(0);
  }, [isOpen, archivos]);

  if (!isOpen) return null;

  // Calcula índices para mostrar anterior, actual y siguiente
  const prevIdx = (current - 1 + archivos.length) % archivos.length;
  const nextIdx = (current + 1) % archivos.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#2E2E7A] rounded-2xl p-8 w-full max-w-2xl relative shadow-2xl border-4 border-[#F5E050]">
        <button
          className="absolute top-4 right-4 text-[#2E2E7A] bg-[#F5E050] rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold hover:bg-[#e6d047] transition"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h2 className="text-3xl font-bold mb-2 text-[#F5E050] passero-font text-center">¡Cápsula creada!</h2>
        <p className="mb-6 text-white text-center">Aquí tienes una muestra de tus archivos:</p>
        <div className="flex items-center justify-center gap-2 relative h-56">
          {[prevIdx, current, nextIdx].map((idx, i) => {
            const archivo = archivos[idx];
            // Tamaño y opacidad según posición
            const isCenter = idx === current;
            const size = isCenter ? 'w-48 h-48 z-20 scale-110' : 'w-32 h-32 z-10 opacity-60 scale-90';
            return (
              <div
                key={idx}
                className={`bg-[#F5E050] rounded-xl flex items-center justify-center overflow-hidden relative group shadow-lg transition-all duration-500 ${size} mx-2`}
                style={{ transitionProperty: 'all' }}
                tabIndex={0}
              >
                {archivo.type.startsWith('image') ? (
                  <>
                    <img
                      src={`http://44.209.31.187:3000/${archivo.path.replace(/^\/?/, '')}`}
                      alt={archivo.name}
                      className="object-cover w-full h-full"
                    />
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {archivo.name}
                    </span>
                  </>
                ) : archivo.type.startsWith('video') ? (
                  <>
                    <video
                      src={`http://44.209.31.187:3000/${archivo.path.replace(/^\/?/, '')}`}
                      className="object-cover w-full h-full"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {archivo.name}
                    </span>
                  </>
                ) : archivo.type.startsWith('audio') ? (
                  <>
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2E2E7A] mb-2">
                        <FontAwesomeIcon icon={faMusic} className="text-[#F5E050] text-3xl" />
                      </div>
                      {isCenter && (
                        <audio
                          src={`http://44.209.31.187:3000/${archivo.path.replace(/^\/?/, '')}`}
                          autoPlay
                          style={{ display: 'none' }}
                          onLoadedMetadata={e => {
                            const audio = e.target;
                            audio.currentTime = 0;
                            audio.play();
                            setTimeout(() => audio.pause(), 10000); // 10 segundos
                          }}
                        />
                      )}
                    </div>
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {archivo.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <span className="text-[#2E2E7A] text-center px-2 font-bold text-lg">{archivo.name.split('.').pop().toUpperCase()}</span>
                    </div>
                    <span
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-[#2E2E7A] text-[#F5E050] text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {archivo.name}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex justify-center mt-6">
          <button
            className="bg-[#F5E050] text-[#2E2E7A] px-6 py-2 rounded-full font-bold hover:bg-[#e6d047] transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CapsuleCreatedModal;