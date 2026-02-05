import { useState, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, AlertTriangle, Eye } from 'lucide-react';
import { API_URL } from '../config';

export default function VerificationCode() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const inputRefs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));
  const navigate = useNavigate();
  const email = localStorage.getItem('recoveryEmail') || '';

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasteData)) {
      const newCode = pasteData.split('');
      setCode(newCode);
      const lastIndex = Math.min(newCode.length - 1, 5);
      inputRefs[lastIndex]?.current?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join('');
    if (verificationCode.length === 6) {
      try {
        const response = await fetch(`${API_URL}/api/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: verificationCode }),
        });
        const data = await response.json();
        if (response.ok) {
          setNotification({ type: 'success', message: 'Código verificado com sucesso!' });
          localStorage.setItem('recoveryCode', verificationCode);
          setTimeout(() => navigate('/reset-password'), 900);
        } else {
          setNotification({ type: 'error', message: data.message || 'Erro ao verificar código.' });
        }
      } catch (error) {
        setNotification({ type: 'error', message: 'Erro na conexão com o servidor.' });
      }
    } else {
      setNotification({ type: 'error', message: 'Por favor, insira um código válido.' });
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
            <h2 className="mb-6 text-center text-2xl font-semibold">Verificação</h2>

            {notification && (
              <div className={`mb-6 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm flex items-center gap-2`}>
                {notification.type === 'success' ? <Check className="h-5 w-5 text-emerald-400" /> : <AlertTriangle className="h-5 w-5 text-red-400" />}
                <span className="text-white/90">{notification.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center text-sm text-white/70">
                Digite o código de 6 dígitos enviado para o seu e-mail.
              </div>

              <div className="flex justify-between gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    maxLength={1}
                    value={digit}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="h-12 w-12 rounded-lg border border-white/10 bg-white/5 text-center text-xl font-semibold text-white outline-none focus:border-white/20 focus:bg-white/7"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-white/90"
              >
                Verificar
              </button>

              <div className="mt-6 flex items-center justify-between text-sm">
                <Link to="/recuperacao" className="text-white/80 hover:text-white">Voltar</Link>
                <Link to="/login" className="text-white/80 hover:text-white">Ir para login</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
