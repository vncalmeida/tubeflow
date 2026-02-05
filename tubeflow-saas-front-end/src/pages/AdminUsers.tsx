import React, { useState, useEffect } from 'react'
import { User, UserPlus, Mail, Edit2, Trash2, Shield, Menu } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useSidebar } from '../context/SidebarContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

function AdminUsers() {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/admins`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (!response.ok) throw new Error('Falha ao carregar administradores')
      const data = await response.json()
      setAdmins(data)
    } catch (error) {
      toast.error('Erro ao carregar lista de administradores', { position: 'top-right', theme: 'dark' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem', { position: 'top-right', theme: 'dark' })
      return
    }
    try {
      const response = await fetch(`${API_URL}/api/admin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password })
      })
      const responseData = await response.json()
      if (!response.ok) throw new Error(responseData.message || 'Falha ao criar administrador')
      toast.success('Administrador criado com sucesso!', { position: 'top-right', theme: 'dark' })
      setIsCreateModalOpen(false)
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      fetchAdmins()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao criar administrador', { position: 'top-right', theme: 'dark' })
    }
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return
    try {
      const response = await fetch(`${API_URL}/api/admin/admins/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ name: formData.name, email: formData.email })
      })
      const responseData = await response.json()
      if (!response.ok) throw new Error(responseData.message || 'Falha ao atualizar administrador')
      toast.success('Administrador atualizado com sucesso!', { position: 'top-right', theme: 'dark' })
      setIsEditModalOpen(false)
      setFormData({ name: '', email: '', password: '', confirmPassword: '' })
      fetchAdmins()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao atualizar administrador', { position: 'top-right', theme: 'dark' })
    }
  }

  const handleDeleteAdmin = async () => {
    if (!selectedUser) return
    try {
      const response = await fetch(`${API_URL}/api/admin/admins/${selectedUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      })
      if (!response.ok) throw new Error('Falha ao deletar administrador')
      toast.success('Administrador removido com sucesso!', { position: 'top-right', theme: 'dark' })
      setIsDeleteModalOpen(false)
      setSelectedUser(null)
      fetchAdmins()
    } catch (error) {
      toast.error('Erro ao remover administrador', { position: 'top-right', theme: 'dark' })
    }
  }

  const resetFormData = () => setFormData({ name: '', email: '', password: '', confirmPassword: '' })

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer theme="dark" />
      <AdminSidebar />

      <div className={`transition-[margin] duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold">Administradores</h1>
            </div>
            <button
              onClick={() => {
                resetFormData()
                setIsCreateModalOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-black hover:bg-white/90 transition"
            >
              <UserPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Novo Admin</span>
            </button>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
              {/* Tabela (desktop) */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/[0.03]">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Administrador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-white/60 uppercase tracking-wider">
                        E-mail
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-white/60 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8">
                          <div className="flex items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white/70" />
                          </div>
                        </td>
                      </tr>
                    ) : admins.length ? (
                      admins.map((admin) => (
                        <tr key={admin.id} className="hover:bg-white/[0.04] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-white" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-white">{admin.name}</div>
                                <div className="text-xs text-white/60">{admin.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-white">{admin.email}</div>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(admin)
                                  setFormData({ name: admin.name, email: admin.email, password: '', confirmPassword: '' })
                                  setIsEditModalOpen(true)
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-white/80 hover:text-white ring-1 ring-white/10 hover:bg-white/10 transition"
                                title="Editar"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedUser(admin)
                                  setIsDeleteModalOpen(true)
                                }}
                                className="inline-flex items-center justify-center p-2 rounded-lg text-red-300 hover:text-red-200 ring-1 ring-red-400/30 hover:bg-red-500/10 transition"
                                title="Remover"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-10 text-center text-white/70">
                          Nenhum administrador encontrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards (mobile) */}
              <div className="md:hidden divide-y divide-white/10">
                {loading ? (
                  <div className="p-6 flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white/70" />
                  </div>
                ) : admins.length ? (
                  admins.map((admin) => (
                    <div key={admin.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">{admin.name}</h3>
                            <p className="text-xs text-white/60">{admin.role}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(admin)
                              setFormData({ name: admin.name, email: admin.email, password: '', confirmPassword: '' })
                              setIsEditModalOpen(true)
                            }}
                            className="p-2 rounded-lg text-white/80 hover:text-white ring-1 ring-white/10 hover:bg-white/10"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(admin)
                              setIsDeleteModalOpen(true)
                            }}
                            className="p-2 rounded-lg text-red-300 hover:text-red-200 ring-1 ring-red-400/30 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-white/70">
                        <Mail className="h-4 w-4 mr-2" />
                        {admin.email}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-white/70">Nenhum administrador encontrado.</div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal: Criar */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-black ring-1 ring-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Novo Administrador</h2>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-1">Nome</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">E-mail</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    resetFormData()
                  }}
                  className="px-4 py-2 rounded-lg text-white/90 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition">
                  Criar Administrador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Editar */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-black ring-1 ring-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Editar Administrador</h2>
            <form onSubmit={handleUpdateAdmin} className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-white/80 mb-1">Nome</label>
                <input
                  id="editName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-white/80 mb-1">E-mail</label>
                <input
                  id="editEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-white/90 ring-1 ring-white/10 hover:bg-white/10 transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Excluir */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-black ring-1 ring-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Confirmar Exclusão</h2>
            <p className="text-white/70">
              Tem certeza que deseja remover o administrador <strong className="text-white">{selectedUser.name}</strong>?
              Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 pt-5">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedUser(null)
                }}
                className="px-4 py-2 rounded-lg text-white/90 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAdmin}
                className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers
