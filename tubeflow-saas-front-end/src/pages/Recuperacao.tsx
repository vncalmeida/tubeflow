import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Mail, Check, AlertTriangle } from 'lucide-react'
import { API_URL } from '../config'

type Notification = {
  type: 'success' | 'error'
  message: string
}

export default function Recuperacao() {
  const [email, setEmail] = useState('')
  const [notification, setNotification] = useState<Notification | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setNotification({ type: 'error', message: 'Por favor, insira seu e-mail.' })
      return
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setNotification({ type: 'error', message: 'Por favor, insira um e-mail válido.' })
      return
    }

    setIsLoading(true)
    setNotification(null)

    try {
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setNotification({ type: 'success', message: data.message || 'Código enviado para seu e-mail.' })
        localStorage.setItem('recoveryEmail', email)
        setTimeout(() => navigate('/codigo'), 1200)
      } else {
        setNotification({ type: 'error', message: data.message || 'Erro ao enviar o código.' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Erro na conexão com o servidor.' })
    } finally {
      setIsLoading(false)
    }
  }

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
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-semibold">Recuperar Senha</h1>
              <p className="mt-1 text-white/70">Digite seu e-mail para receber um código de recuperação</p>
            </div>

            {notification && (
              <div
                role="status"
                className={`mb-6 flex items-start gap-3 rounded-xl p-4 ring-1 ${
                  notification.type === 'success'
                    ? 'bg-green-500/10 text-green-300 ring-green-500/20'
                    : 'bg-red-500/10 text-red-300 ring-red-500/20'
                }`}
              >
                {notification.type === 'success' ? <Check className="h-5 w-5 mt-0.5" /> : <AlertTriangle className="h-5 w-5 mt-0.5" />}
                <span className="text-sm">{notification.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/80">E-mail</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20"
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/50 border-t-transparent" />
                    Enviando...
                  </span>
                ) : (
                  'Enviar Código'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-white/80 hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
