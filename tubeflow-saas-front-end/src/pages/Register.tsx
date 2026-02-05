import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, Briefcase, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'

type FormErrors = {
  name: string
  email: string
  password: string
  company: string
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: '', email: '', password: '', company: '' })
  const [formErrors, setFormErrors] = useState<FormErrors>({ name: '', email: '', password: '', company: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    let isValid = true
    const next: FormErrors = { name: '', email: '', password: '', company: '' }

    if (!formData.name.trim()) {
      next.name = 'Por favor, insira seu nome completo'
      isValid = false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Por favor, insira um e-mail válido'
      isValid = false
    }
    if (formData.password.length < 8) {
      next.password = 'A senha deve ter pelo menos 8 caracteres'
      isValid = false
    }
    if (!formData.company.trim()) {
      next.company = 'Por favor, insira o nome da empresa'
      isValid = false
    }

    setFormErrors(next)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      setIsLoading(true)
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || 'Conta criada com sucesso!', { theme: 'dark' })
        setTimeout(() => navigate('/login'), 1400)
      } else {
        toast.error(data.message || 'Erro ao criar conta.', { theme: 'dark' })
      }
    } catch {
      toast.error('Erro ao conectar com o servidor', { theme: 'dark' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0b0b0b] text-white overflow-hidden">
      <ToastContainer theme="dark" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[30rem] w-[30rem] rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-2xl bg-white/5 p-8 ring-1 ring-white/10 backdrop-blur"
        >
          <div className="mb-8 flex items-center justify-center gap-3">
            <span className="text-2xl font-semibold"><span className="font-extrabold">Tube</span>Flow</span>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold">Criar Conta</h1>
            <p className="mt-1 text-white/70">Registre-se para começar a usar o TubeFlow</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Nome Completo</label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20"
                  placeholder="Seu nome completo"
                  autoComplete="name"
                />
              </div>
              {formErrors.name && <p className="mt-1 text-sm text-red-300">{formErrors.name}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">E-mail</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20"
                  placeholder="seu@email.com"
                  autoComplete="email"
                />
              </div>
              {formErrors.email && <p className="mt-1 text-sm text-red-300">{formErrors.email}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Senha</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-11 py-3 text-white placeholder-white/40 outline-none focus:border-white/20"
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formErrors.password && <p className="mt-1 text-sm text-red-300">{formErrors.password}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-white/80">Nome da Empresa</label>
              <div className="relative">
                <Briefcase className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 py-3 text-white placeholder-white/40 outline-none focus:border-white/20"
                  placeholder="Nome da empresa"
                  autoComplete="organization"
                />
              </div>
              {formErrors.company && <p className="mt-1 text-sm text-red-300">{formErrors.company}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-white py-3 font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-80"
            >
              {isLoading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/50 border-t-transparent" />
                  Criando...
                </span>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-white/80">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-semibold text-white hover:underline">
              Faça login aqui
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default RegisterPage
