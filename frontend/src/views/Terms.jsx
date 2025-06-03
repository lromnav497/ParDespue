import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGavel } from '@fortawesome/free-solid-svg-icons';

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <FontAwesomeIcon icon={faGavel} className="text-[#F5E050] text-4xl mb-4" />
          <h1 className="text-4xl text-[#F5E050] passero-font mb-4">
            Términos y Condiciones
          </h1>
          <p className="text-gray-300">
            Última actualización: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#2E2E7A] rounded-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">1. Aceptación de los Términos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Al acceder y utilizar ParDespue, usted acepta estar sujeto a estos
                términos y condiciones. Si no está de acuerdo con alguna parte de estos
                términos, no podrá acceder al servicio.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">2. Uso del Servicio</h2>
            <div className="text-gray-300 space-y-4">
              <p>Para usar nuestro servicio, usted debe:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ser mayor de 13 años</li>
                <li>Proporcionar información precisa y completa</li>
                <li>Mantener la seguridad de su cuenta</li>
                <li>No usar el servicio para fines ilegales</li>
                <li>Respetar los derechos de otros usuarios</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">3. Contenido del Usuario</h2>
            <div className="text-gray-300 space-y-4">
              <p>Al crear cápsulas del tiempo, usted:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantiene los derechos de su contenido</li>
                <li>Nos otorga licencia para almacenar y mostrar su contenido</li>
                <li>Es responsable del contenido que comparte</li>
                <li>No debe violar derechos de propiedad intelectual</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">4. Limitación de Responsabilidad</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                ParDespue se proporciona "tal cual" y no ofrecemos garantías sobre
                su disponibilidad o funcionamiento. No nos hacemos responsables de
                pérdidas o daños derivados del uso del servicio.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl text-[#F5E050] mb-4">5. Cambios en los Términos</h2>
            <div className="text-gray-300 space-y-4">
              <p>
                Nos reservamos el derecho de modificar estos términos en cualquier
                momento. Los cambios entrarán en vigor inmediatamente después de su
                publicación en el sitio web.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;