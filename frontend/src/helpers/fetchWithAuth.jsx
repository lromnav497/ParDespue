export async function fetchWithAuth(url, options = {}) {
  // Busca el token en sessionStorage o localStorage
  const token =
    sessionStorage.getItem('token') || localStorage.getItem('token');
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    // Token expirado o inválido
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.dispatchEvent(new Event('user-updated'));
    window.location.href = '/login?expired=1';
    return null;
  }
  return res;
}