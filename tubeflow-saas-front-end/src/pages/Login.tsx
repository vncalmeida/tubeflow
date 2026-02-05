import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate, Link } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'
import VerificationModal from '../components/VerificationModal'
import { API_URL } from '../config'

type VerificationType = 'userExists' | 'passwordValid' | 'companyLink' | 'companyActive' | 'subscriptionValid'

interface VerificationState {
  type: VerificationType
  status: 'loading' | 'success' | 'error'
  message: string
}

interface LoginResponse {
  token: string
  roles: string[]
  isFreelancer: boolean
  companyId: number
  id: string
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [currentVerification, setCurrentVerification] = useState<VerificationState | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setCurrentVerification({ type: 'userExists', status: 'loading', message: 'Verificando existência do usuário...' })
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (!response.ok) {
        handleLoginError(data)
        setIsLoading(false)
        return
      }
      handleLoginSuccess(data as LoginResponse)
      setIsLoading(false)
      navigate('/welcome')
    } catch (error) {
      handleNetworkError(error)
      setIsLoading(false)
    }
  }

  const handleLoginError = (data: any) => {
    let type: VerificationType = 'userExists'
    let message = data.message || 'Erro no login'
    switch (data.message) {
      case 'Empresa inativa.':
        type = 'companyActive'
        break
      case 'Assinatura da empresa expirada.':
        type = 'subscriptionValid'
        break
      case 'Usuário não vinculado a uma empresa válida.':
        type = 'companyLink'
        break
      default:
        if (typeof data.message === 'string' && data.message.toLowerCase().includes('senha')) type = 'passwordValid'
    }
    setCurrentVerification({ type, status: 'error', message })
  }

  const handleLoginSuccess = (data: LoginResponse) => {
    localStorage.setItem('token', data.token)
    localStorage.setItem('roles', JSON.stringify(data.roles))
    localStorage.setItem('isFreelancer', data.isFreelancer.toString())
    localStorage.setItem('companyId', data.companyId.toString())
    if (data.isFreelancer) localStorage.setItem('userId', data.id)
    else localStorage.setItem('userIdA', data.id)
  }

  const handleNetworkError = (error: any) => {
    console.error('Erro na solicitação de login:', error)
    toast.error('Erro na conexão com o servidor.', { position: 'top-right', theme: 'dark' })
    setCurrentVerification(null)
  }

  return (
    <div className="relative min-h-screen bg-[#0b0b0b] text-white overflow-hidden">
      <ToastContainer theme="dark" />
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
            <h2 className="mb-6 text-center text-2xl font-semibold">Entrar</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/80">E-mail</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none ring-0 focus:border-white/20 focus:bg-white/7"
                  placeholder="seu@email.com"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-white/80">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-white placeholder-white/40 outline-none ring-0 focus:border-white/20 focus:bg-white/7"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-80"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>

              <div className="mt-6 flex items-center justify-between text-sm">
                <Link to="/recuperacao" className="text-white/80 hover:text-white">Esqueceu sua senha?</Link>
                <Link to="/registro" className="text-white/80 hover:text-white">Criar conta</Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <VerificationModal
        isOpen={currentVerification !== null}
        onClose={() => setCurrentVerification(null)}
        type={currentVerification?.type || 'userExists'}
        status={currentVerification?.status || 'loading'}
        message={currentVerification?.message}
      />
    </div>
  )
}

export default LoginPage
