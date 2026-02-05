import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

type Notification = {
  type: 'success' | 'error';
  message: string;
};

export default function NewPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setNotification({ type: 'error', message: 'Por favor, preencha todos os campos.' });
      return;
    }
    if (password.length < 8) {
      setNotification({ type: 'error', message: 'A senha deve ter pelo menos 8 caracteres.' });
      return;
    }
    if (password !== confirmPassword) {
      setNotification({ type: 'error', message: 'As senhas não coincidem.' });
      return;
    }

    const email = localStorage.getItem('recoveryEmail');
    const code = localStorage.getItem('recoveryCode');

    if (!email || !code) {
      setNotification({ type: 'error', message: 'Dados de recuperação ausentes. Recomece o processo.' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotification({ type: 'success', message: 'Senha alterada com sucesso!' });
        localStorage.removeItem('recoveryEmail');
        localStorage.removeItem('recoveryCode');
        setTimeout(() => navigate('/login'), 900);
      } else {
        setNotification({ type: 'error', message: data.message || 'Erro ao alterar a senha.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Erro na conexão com o servidor.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0b0b0b] text-white overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-2xl font-semibold"><span className="font-extrabold">Tube</span>Flow</span>
          </div>

          <div className="rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur">
            <h2 className="mb-6 text-center text-2xl font-semibold">Nova senha</h2>

            {notification && (
              <div className="mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/90">
                {notification.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/80">Nova senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-white placeholder-white/40 outline-none ring-0 focus:border-white/20 focus:bg-white/7"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">Confirmar nova senha</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-white placeholder-white/40 outline-none ring-0 focus:border-white/20 focus:bg-white/7"
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                    aria-label={showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoading ? 'Alterando...' : 'Alterar senha'}
              </button>

              <div className="mt-6 flex items-center justify-between text-sm">
                <Link to="/codigo" className="text-white/80 hover:text-white">Voltar</Link>
                <Link to="/login" className="text-white/80 hover:text-white">Ir para login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
