import { useState } from "react";
import { Link } from "react-router-dom";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || "Correo reenviado. Revisa tu bandeja de entrada.");
      } else {
        setStatus("error");
        setMessage(data.message || "No se pudo reenviar el correo.");
      }
    } catch {
      setStatus("error");
      setMessage("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-[#2E2E7A] rounded-xl p-8 max-w-md w-full shadow-lg text-center">
        <h2 className="text-2xl text-[#F5E050] mb-4 font-bold">Reenviar verificación</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full mb-4 px-4 py-2 rounded bg-[#1a1a4a] text-white border border-[#3d3d9e]"
          />
          <button
            type="submit"
            className="bg-[#F5E050] text-[#2E2E7A] font-bold px-6 py-2 rounded hover:bg-[#e6d047] w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Enviando..." : "Reenviar correo"}
          </button>
        </form>
        {message && (
          <div className={`mt-4 ${status === "success" ? "text-green-400" : "text-red-400"}`}>
            {message}
          </div>
        )}
        <div className="mt-6">
          <Link to="/login" className="text-[#F5E050] hover:underline font-bold">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;