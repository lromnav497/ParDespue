import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import Modal from '../components/modals/Modal';

export const PrivacyModal = ({ isOpen, onClose }) => (
  <Modal title="Política de Privacidad" isOpen={isOpen} onClose={onClose}>
    <div className="text-white space-y-4">
      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">1. Información que Recopilamos</h3>
        <p>Recopilamos información que usted nos proporciona directamente:</p>
        <ul className="list-disc pl-6 mt-2 text-gray-300">
          <li>Información de registro (nombre, email, contraseña)</li>
          <li>Contenido de las cápsulas del tiempo</li>
          <li>Información de perfil</li>
        </ul>
      </section>

      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">2. Uso de la Información</h3>
        <p className="text-gray-300">
          Utilizamos la información recopilada para proporcionar, mantener y mejorar nuestros servicios,
          así como para desarrollar nuevos servicios.
        </p>
      </section>

      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">3. Compartir Información</h3>
        <p className="text-gray-300">
          No compartimos su información personal con terceros excepto en las siguientes circunstancias:
          con su consentimiento, por requisitos legales, o para proteger derechos.
        </p>
      </section>
    </div>
  </Modal>
);

export const TermsModal = ({ isOpen, onClose }) => (
  <Modal title="Términos y Condiciones" isOpen={isOpen} onClose={onClose}>
    <div className="text-white space-y-4">
      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">1. Aceptación de los Términos</h3>
        <p className="text-gray-300">
          Al acceder y utilizar ParDespue, usted acepta estar sujeto a estos términos y condiciones.
        </p>
      </section>

      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">2. Uso del Servicio</h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>Debe ser mayor de 13 años para usar el servicio</li>
          <li>Es responsable del contenido que sube</li>
          <li>No debe usar el servicio para fines ilegales</li>
        </ul>
      </section>

      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">3. Contenido del Usuario</h3>
        <p className="text-gray-300">
          Usted mantiene los derechos de cualquier contenido que envíe, publique o muestre en el servicio.
        </p>
      </section>
    </div>
  </Modal>
);

export const CookiesModal = ({ isOpen, onClose }) => (
  <Modal title="Política de Cookies" isOpen={isOpen} onClose={onClose}>
    <div className="text-white space-y-4">
      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">1. ¿Qué son las Cookies?</h3>
        <p className="text-gray-300">
          Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita nuestro sitio web.
        </p>
      </section>

      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">2. Tipos de Cookies que Usamos</h3>
        <ul className="list-disc pl-6 text-gray-300">
          <li>Cookies esenciales para el funcionamiento del sitio</li>
          <li>Cookies analíticas para mejorar nuestro servicio</li>
          <li>Cookies de preferencias para recordar sus ajustes</li>
        </ul>
      </section>

      <section>
        <h3 className="text-[#F5E050] text-xl mb-2">3. Control de Cookies</h3>
        <p className="text-gray-300">
          Puede controlar y/o eliminar las cookies según desee. Puede eliminar todas las cookies 
          que ya están en su computadora y configurar la mayoría de los navegadores para que las bloqueen.
        </p>
      </section>
    </div>
  </Modal>
);

const Privacy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FontAwesomeIcon icon={faShieldAlt} className="text-[#F5E050] text-4xl mb-4" />
          <h1 className="text-4xl text-[#F5E050] passero-font mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-300">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#2E2E7A] rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">1. Información que Recopilamos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                En ParDespue, recopilamos diferentes tipos de información para proporcionar
                y mejorar nuestro servicio:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Información de la cuenta (nombre, correo electrónico, contraseña)</li>
                <li>Contenido de las cápsulas (fotos, videos, textos, audios)</li>
                <li>Información del dispositivo y uso del servicio</li>
                <li>Información de cookies y tecnologías similares</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">2. Cómo Usamos su Información</h2>
            <div className="text-gray-300 space-y-4">
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Proporcionar y mantener nuestro servicio</li>
                <li>Notificarle sobre cambios en nuestro servicio</li>
                <li>Permitirle participar en funciones interactivas</li>
                <li>Proporcionar atención al cliente</li>
                <li>Detectar y prevenir actividades fraudulentas</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">3. Compartir Información</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                No vendemos ni compartimos su información personal con terceros, excepto en
                las siguientes circunstancias:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Con su consentimiento explícito</li>
                <li>Para cumplir con obligaciones legales</li>
                <li>Para proteger nuestros derechos y propiedad</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">4. Seguridad de Datos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                La seguridad de sus datos es importante para nosotros. Implementamos
                medidas de seguridad técnicas y organizativas apropiadas para proteger
                su información personal.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;