'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const params = useParams();
  const currentLocale = (params?.locale as 'es' | 'en') || 'es';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Credenciales incorrectas');
        setLoading(false);
        return;
      }

      // Save token in localStorage
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_username', data.user.username);
      
      // Redirect to quick-sell
      router.push(`/${currentLocale}/admin/quick-sell`);
    } catch (err) {
      console.error('[Login] Error:', err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F4EFE9] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-[#E8E2DA] overflow-hidden p-8 space-y-6">
        
        {/* Header / Logo */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <img src="/images/icon/Íconos WEB 1.png" alt="Boho Sunday" className="h-16 w-auto opacity-90" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-[#231E1A] font-sans">INICIAR SESIÓN</h1>
            <p className="text-xs text-[#7A6F5E] uppercase tracking-widest font-semibold font-sans">Acceso exclusivo para Staff Boho Sunday</p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 font-sans">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Usuario</label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full bg-[#FAF8F5] border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#7A6F5E] mb-1.5">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña de acceso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#FAF8F5] border border-[#E0D9D0] rounded-xl px-4 py-3 text-sm text-[#231E1A] focus:outline-none focus:ring-1 focus:ring-[#686A54] focus:border-[#686A54]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#686A54] text-[#F4EFE9] font-bold text-sm tracking-widest rounded-xl hover:opacity-90 transition-opacity uppercase flex justify-center items-center cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  AUTENTICANDO...
                </>
              ) : (
                'ENTRAR'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
