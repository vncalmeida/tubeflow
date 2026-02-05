import React, { useState } from 'react'
import { X } from 'lucide-react'
import InputMask from 'react-input-mask'
import { toast } from 'react-toastify'
import { API_URL } from '../config'

interface ModalCompanyUserProps {
  isOpen: boolean
  onClose: () => void
  companyId: string
  onSuccess: (user: User) => void
}

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface FormData {
  name: string
  email: string
  cpf?: string
}

const ModalCompanyUser: React.FC<ModalCompanyUserProps> = ({ isOpen, onClose, companyId, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', cpf: '' })
  const [formErrors, setFormErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: Partial<FormData> = {}

    if (!formData.name?.trim()) errors.name = 'Nome é obrigatório'
    if (!formData.email?.trim()) errors.email = 'E-mail é obrigatório'
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/
    if (formData.cpf && formData.cpf.trim() !== '' && !cpfRegex.test(formData.cpf)) {
      errors.cpf = 'CPF inválido (use o formato 000.000.000-00)'
    }

    setFormErrors(errors)
    if (Object.keys(errors).length) return

    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Token não encontrado. Faça login novamente.', { position: 'top-right' })
      window.location.href = '/login'
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/admin/companies/${companyId}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          ...(formData.cpf ? { cpf: formData.cpf } : {})
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast.success('Usuário criado com sucesso!', { position: 'top-right' })
        onSuccess(data.data)
        onClose()
        setFormData({ name: '', email: '', cpf: '' })
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Erro ao criar usuário.', { position: 'top-right' })
      }
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error)
      toast.error('Erro na conexão com o servidor.', { position: 'top-right' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-black text-white ring-1 ring-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Cadastrar Novo Usuário</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Fechar">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 focus:ring-2 outline-none ${
                formErrors.name ? 'ring-red-500 focus:ring-red-500' : 'ring-white/10 focus:ring-red-500'
              }`}
              placeholder="Digite o nome completo"
            />
            {formErrors.name && <p className="mt-1 text-sm text-red-400">{formErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">E-mail</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 focus:ring-2 outline-none ${
                formErrors.email ? 'ring-red-500 focus:ring-red-500' : 'ring-white/10 focus:ring-red-500'
              }`}
              placeholder="Digite o e-mail"
            />
            {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="cpf" className="block text-sm font-medium mb-1">CPF (opcional)</label>
            <InputMask
              id="cpf"
              mask="999.999.999-99"
              value={formData.cpf}
              onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
            >
              {(inputProps: any) => (
                <input
                  {...inputProps}
                  className={`w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 focus:ring-2 outline-none ${
                    formErrors.cpf ? 'ring-red-500 focus:ring-red-500' : 'ring-white/10 focus:ring-red-500'
                  }`}
                  placeholder="CPF (opcional)"
                />
              )}
            </InputMask>
            {formErrors.cpf && <p className="mt-1 text-sm text-red-400">{formErrors.cpf}</p>}
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 font-semibold transition disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalCompanyUser
