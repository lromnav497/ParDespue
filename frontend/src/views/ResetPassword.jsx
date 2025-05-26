import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'No se pudo restablecer la contraseña');
      } else {
        setMessage(data.message || 'Contraseña restablecida correctamente');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch {
      setError('Error de conexión con el servidor');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="bg-[#2E2E7A] rounded-xl p-8 max-w-md w-full shadow-lg text-center">
          <h2 className="text-2xl font-bold text-[#F5E050] mb-4">Enlace inválido</h2>
          <p>El enlace de recuperación no es válido o ha expirado.</p>
          <Link to="/recover-password" className="text-[#F5E050] underline font-bold block mt-4">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-[#2E2E7A] rounded-xl p-8 max-w-md w-full shadow-lg text-center">
        <h2 className="text-2xl font-bold text-[#F5E050] mb-4">Restablecer Contraseña</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-[#1a1a4a] text-white border border-[#3d3d9e]"
            required
          />
          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            className="w-full mb-4 px-4 py-2 rounded bg-[#1a1a4a] text-white border border-[#3d3d9e]"
            required
          />
          <button
            type="submit"
            className="bg-[#F5E050] text-[#2E2E7A] font-bold px-6 py-2 rounded hover:bg-[#e6d047] w-full"
          >
            Restablecer contraseña
          </button>
        </form>
        {error && <div className="text-red-400 mt-4">{error}</div>}
        {message && <div className="text-green-400 mt-4">{message}</div>}
        <div className="mt-6">
          <Link to="/login" className="text-[#F5E050] hover:underline font-bold">
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;