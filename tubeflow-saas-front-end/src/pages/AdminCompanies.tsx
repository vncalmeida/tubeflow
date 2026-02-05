import React, { useState, useEffect } from 'react'
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronLeft,
  ChevronRight,
  Search,
  Plus,
  Menu,
  Trash2
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import ModalCompany from '../components/ModalCompany'
import ModalCompanyUser from '../components/ModalCompanyUser'
import { useSidebar } from '../context/SidebarContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'

interface Company {
  id: string
  name: string
  subdomain?: string
  created_at: string
  plan_status: 'active' | 'inactive'
  plan_ends_at: string | null
  users: User[]
}

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface PaginationResponse {
  data: Company[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

function AdminCompanies() {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [companies, setCompanies] = useState<Company[]>([])
  const [expandedCompanyId, setExpandedCompanyId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout>>()
  const [perPage, setPerPage] = useState(5)
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null)

  // Helper para formatar detalhes opcionais na mensagem de erro
  const detailsSafe = (v: any) => (v === undefined || v === null ? 'n/d' : String(v))

  // responsivo: reduz itens por página no mobile
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    const handleResize = (e: MediaQueryListEvent | MediaQueryList) => {
      if (e.matches) setPerPage(4)
      else setPerPage(5)
      setCurrentPage(1)
    }
    mq.addEventListener('change', handleResize)
    handleResize(mq)
    return () => mq.removeEventListener('change', handleResize)
  }, [])

  useEffect(() => {
    fetchCompanies(currentPage)
  }, [currentPage, perPage])

  // debounce da busca
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout)
    const t = setTimeout(() => {
      setCurrentPage(1)
      fetchCompanies(1, searchTerm)
    }, 500)
    setSearchTimeout(t)
    return () => clearTimeout(t)
  }, [searchTerm])

  const fetchCompanies = async (page: number, search: string = '') => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/admin/companies?page=${page}&per_page=${perPage}&search=${encodeURIComponent(search)}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } }
      )
      if (!response.ok) {
        let serverErr: any = null
        try { serverErr = await response.json() } catch {}
        const det = serverErr?.error
        const detailsMsg = det ? ` (code: ${detailsSafe(det.code)}, errno: ${detailsSafe(det.errno)})` : ''
        const msg = serverErr?.message || 'Falha ao carregar empresas'
        console.error('[AdminCompanies] Listagem de empresas falhou', { status: response.status, serverErr })
        throw new Error(`${msg}${detailsMsg}`)
      }
      const data: PaginationResponse = await response.json()
      setCompanies(data.data || [])
      setTotalPages(data.total_pages || 1)
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao carregar lista de empresas'
      toast.error(msg, { position: 'top-right', theme: 'dark' })
      setCompanies([])
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })

  const handleCompanyCreated = () => {
    fetchCompanies(currentPage, searchTerm)
    toast.success('Empresa criada com sucesso!', { theme: 'dark' })
  }

  const handleUserCreated = (companyId: string, user: User) => {
    setCompanies(prev => prev.map(c => (c.id === companyId ? { ...c, users: [...c.users, user] } : c)))
  }

  const openUserModal = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setIsUserModalOpen(true)
  }

  const confirmDeleteCompany = (company: Company) => {
    setCompanyToDelete(company)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return
    const token = localStorage.getItem('adminToken')
    if (!token) {
      toast.error('Token não encontrado. Faça login novamente.', { position: 'top-right', theme: 'dark' })
      return
    }
    try {
      const resp = await fetch(`${API_URL}/api/admin/companies/${companyToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!resp.ok) {
        let serverErr: any = null
        try { serverErr = await resp.json() } catch {}
        const msg = serverErr?.message || 'Falha ao excluir empresa'
        throw new Error(msg)
      }
      toast.success('Empresa removida com sucesso!', { position: 'top-right', theme: 'dark' })
      // Atualiza lista e fecha modal
      setIsDeleteModalOpen(false)
      setCompanyToDelete(null)
      if (expandedCompanyId === companyToDelete.id) setExpandedCompanyId(null)
      fetchCompanies(currentPage, searchTerm)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao excluir empresa'
      toast.error(msg, { position: 'top-right', theme: 'dark' })
    }
  }

  const Pagination = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    const showEllipsis = totalPages > 7
    let displayedPages = pages
    if (showEllipsis) {
      if (currentPage <= 4) displayedPages = [...pages.slice(0, 5), -1, totalPages]
      else if (currentPage >= totalPages - 3) displayedPages = [1, -1, ...pages.slice(totalPages - 5)]
      else displayedPages = [1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages]
    }

    return (
      <div className="flex items-center justify-between px-4 py-3">
        {/* mobile */}
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg bg-white/5 ring-1 ring-white/10 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima
          </button>
        </div>

        {/* desktop */}
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <p className="text-sm text-white/70">
            Página <span className="font-semibold text-white">{currentPage}</span> de{' '}
            <span className="font-semibold text-white">{totalPages}</span>
          </p>
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-l-lg px-2 py-2 text-white/60 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Anterior</span>
              <ChevronLeft className="h-5 w-5" />
            </button>

            {displayedPages.map((page, index) =>
              page === -1 ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2 text-sm font-semibold text-white/60 ring-1 ring-white/10"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 text-sm font-semibold ring-1 ring-white/10 ${
                    currentPage === page ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-r-lg px-2 py-2 text-white/60 ring-1 ring-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">Próxima</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    )
  }

  const CompanyCard = ({ company }: { company: Company }) => {
    const isExpanded = expandedCompanyId === company.id
    const remainingDays = company.plan_ends_at
      ? Math.ceil((new Date(company.plan_ends_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return (
      <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        <div
          onClick={() => setExpandedCompanyId(isExpanded ? null : company.id)}
          className="p-4 sm:p-6 cursor-pointer"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                {company.subdomain && <p className="text-sm text-white/60">{company.subdomain}</p>}
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="w-4 h-4 text-white/50" />
                  <span className="text-sm text-white/60">Criada em {formatDate(company.created_at)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
              <div className="flex flex-col items-start sm:items-end">
                <div
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ring-1 ${
                    company.plan_status === 'active'
                      ? 'bg-green-500/15 text-green-300 ring-green-400/30'
                      : 'bg-red-500/15 text-red-300 ring-red-400/30'
                  }`}
                >
                  {company.plan_status === 'active' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Plano Ativo</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4" />
                      <span>Plano Inativo</span>
                    </>
                  )}
                </div>
                {company.plan_status === 'active' && company.plan_ends_at && (
                  <div className="flex items-center gap-1 mt-1 text-sm text-white/60">
                    <Timer className="w-4 h-4" />
                    <span>{Math.floor(remainingDays)} dias restantes</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    confirmDeleteCompany(company)
                  }}
                  className="inline-flex items-center justify-center p-2 rounded-lg text-red-300 hover:text-red-200 ring-1 ring-red-400/30 hover:bg-red-500/10 transition"
                  title="Remover"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t border-white/10 bg-white/[0.03]">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-red-400" />
                  <h4 className="text-base font-medium text-white">
                    Usuários Vinculados ({company.users.length})
                  </h4>
                </div>
                <button
                  onClick={() => openUserModal(company.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-white/90 transition"
                  title="CPF do usuário é opcional"
                >
                  <Plus className="w-4 h-4" />
                  Novo Usuário
                </button>
              </div>

              <div className="space-y-4">
                {company.users.map(user => (
                  <div key={user.id} className="rounded-xl bg-white/5 ring-1 ring-white/10 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h5 className="text-sm font-medium text-white">{user.name}</h5>
                        <p className="text-sm text-white/60 mt-1">{user.email}</p>
                      </div>
                      <div className="flex flex-col sm:text-right">
                        <span className="text-xs font-medium text-red-300 bg-red-500/15 ring-1 ring-red-400/30 px-2.5 py-1 rounded-full w-fit sm:ml-auto">
                          {user.role}
                        </span>
                        <p className="text-xs text-white/60 mt-1">Desde {formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer theme="dark" />

      <AdminSidebar />

      <div className={`transition-[margin] duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="h-16 flex items-center justify-between">
              <button
                onClick={toggleSidebar}
                className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
                aria-label="Abrir menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-600 rounded-lg">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-semibold">Empresas</h1>
              </div>

              <div className="w-9 lg:hidden" />
            </div>
          </div>
        </header>

        {/* Barra de ações */}
        <div className="border-b border-white/10 bg-black">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-white/50" />
              </div>
              <input
                type="text"
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 rounded-xl bg-black text-white placeholder-white/50 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            <button
              onClick={() => setIsCompanyModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-semibold text-black hover:bg-white/90 transition w-full sm:w-auto justify-center"
            >
              <Plus className="w-5 h-5" />
              <span>Nova Empresa</span>
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold">Lista de Empresass</h2>
              <p className="mt-2 text-white/60">Visualize todas as empresas e seus usuários vinculados</p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white/70" />
              </div>
            ) : companies.length > 0 ? (
              <div className="space-y-4">
                {companies.map(company => (
                  <CompanyCard key={company.id} company={company} />
                ))}
                <Pagination />
              </div>
            ) : (
              <div className="text-center py-12">
                <Building2 className="mx-auto h-12 w-12 text-white/40" />
                <h3 className="mt-2 text-sm font-medium text-white">Nenhuma empresa encontrada</h3>
                <p className="mt-1 text-sm text-white/60">
                  {searchTerm ? 'Tente uma busca diferente' : 'Não há empresas cadastradas no momento'}
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modais */}
      <ModalCompany
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSuccess={handleCompanyCreated}
      />
      <ModalCompanyUser
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        companyId={selectedCompanyId || ''}
        onSuccess={(user) => {
          if (selectedCompanyId) handleUserCreated(selectedCompanyId, user)
        }}
      />
      {/* Modal: Excluir Empresa */}
      {isDeleteModalOpen && companyToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-black ring-1 ring-white/10 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Confirmar Exclusão</h2>
            <p className="text-white/70">
              Tem certeza que deseja remover a empresa <strong className="text-white">{companyToDelete.name}</strong>?
              Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3 pt-5">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setCompanyToDelete(null)
                }}
                className="px-4 py-2 rounded-lg text-white/90 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteCompany}
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

export default AdminCompanies

