import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Enlace de verificación inválido.");
      return;
    }
    fetch(`/api/auth/verify/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message && data.message.toLowerCase().includes("verificado")) {
          setStatus("success");
          setMessage("¡Tu cuenta ha sido verificada correctamente! Ya puedes iniciar sesión.");
        } else {
          setStatus("error");
          setMessage(data.message || "No se pudo verificar el usuario.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexión con el servidor.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-[#2E2E7A] rounded-xl p-8 max-w-md w-full shadow-lg text-center">
        <h2 className="text-2xl text-[#F5E050] mb-4 font-bold">Verificación de correo</h2>
        {status === "verifying" && (
          <p className="text-white">Verificando tu cuenta...</p>
        )}
        {status === "success" && (
          <>
            <p className="text-green-400 mb-4">{message}</p>
            <Link to="/login" className="text-[#F5E050] hover:underline font-bold">
              Iniciar sesión
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-red-400 mb-4">{message}</p>
            <Link to="/resend-verification" className="text-[#F5E050] hover:underline font-bold">
              Reenviar correo de verificación
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;