import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import {
  LayoutDashboard,
  Building2,
  Settings,
  Users,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  CreditCard,
  Layout as LayoutIcon
} from 'lucide-react'

type MenuItem = {
  label: string
  path: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

function AdminSidebar() {
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    window.dispatchEvent(new Event('storage'))
    navigate('/admin/login')
  }

  const menuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Building2, label: 'Empresas', path: '/admin/companies' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: CreditCard, label: 'Planos', path: '/admin/plans' },
    { icon: Settings, label: 'Configurações', path: '/admin/config' },
    { icon: LayoutIcon, label: 'Rodapé', path: '/admin/footer' }
  ]

  const activeItem = menuItems.find(item => location.pathname.startsWith(item.path))

  const handleNavigation = (path: string) => {
    navigate(path)
    if (window.innerWidth < 1024) closeSidebar()
  }

  return (
    <>
      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden z-40 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-black text-white border-r border-white/10 transform transition-all duration-300 ease-in-out z-40 shadow-xl flex flex-col ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-16 lg:translate-x-0 -translate-x-full'
        } overflow-hidden`}
      >
        {/* Topo */}
        <div
          className={`h-16 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-black to-black flex-shrink-0 ${
            isSidebarOpen ? 'px-4' : 'px-2'
          }`}
        >
          <div className="flex items-center gap-3">
            {/* Marca */}
            {isSidebarOpen && (
              <span className="text-xl font-bold text-white">TubeFlow Admin</span>
            )}
          </div>

          {/* Fechar (mobile) */}
          <button
            onClick={closeSidebar}
            className="lg:hidden p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden ${isSidebarOpen ? 'p-3' : 'p-1'}`}>
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem?.path === item.path
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative ${
                  isSidebarOpen ? 'gap-3 px-3 justify-start' : 'justify-center px-1'
                } ${
                  isActive
                    ? 'bg-red-900/20 text-red-300 border border-red-800/30'
                    : 'text-white/80 hover:bg-red-900/10 hover:text-red-300'
                }`}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <div className={`${isActive ? 'text-red-300' : 'text-white/70 group-hover:text-red-300'}`}>
                  <Icon className="w-5 h-5" />
                </div>

                {isSidebarOpen && <span className="truncate">{item.label}</span>}

                {isActive && (
                  <div
                    className={`${
                      isSidebarOpen ? 'ml-auto' : 'absolute -right-1 top-1/2 -translate-y-1/2'
                    } w-2 h-2 bg-red-500 rounded-full flex-shrink-0`}
                  />
                )}

                {/* Tooltip quando colapsado */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black rotate-45"></div>
                  </div>
                )}
              </button>
            )
          })}
        </nav>

        {/* Rodapé do menu */}
        <div
          className={`border-t border-white/10 bg-black flex-shrink-0 overflow-hidden ${
            isSidebarOpen ? 'p-3 space-y-2' : 'p-1 space-y-1'
          }`}
        >
          {/* Perfil/estado (estático) */}
          <div className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center py-2 px-1'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center relative">
              <span className="text-xs font-semibold text-white">A</span>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-black rounded-full" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">Administrador</p>
                <p className="text-xs text-green-400">Online</p>
              </div>
            )}
          </div>

          {/* Sair */}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg transition-all duration-200 text-sm font-medium group relative ${
              isSidebarOpen ? 'gap-3 px-3 justify-start py-2.5' : 'justify-center px-1 py-2'
            } text-red-300 hover:bg-red-900/10`}
            title={!isSidebarOpen ? 'Sair' : undefined}
          >
            <div className="flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            {isSidebarOpen && <span className="truncate">Sair</span>}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Sair
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-black rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* Botão “orelha” (desktop) */}
      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-2 bg-black border border-white/10 rounded-r-lg shadow-lg text-white/80 hover:bg-red-900/10 hover:border-red-800/30 transition-all duration-300 hidden lg:flex items-center justify-center ${
          isSidebarOpen ? 'left-64' : 'left-16'
        }`}
        title={isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-red-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-red-300" />
        )}
      </button>

      {/* Botão “hambúrguer” (mobile) */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-black border border-white/10 rounded-lg shadow-lg text-white/80 hover:bg-red-900/10 hover:border-red-800/30 transition-all duration-200 lg:hidden"
        title="Menu"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 text-red-300" />
        ) : (
          <Menu className="w-5 h-5 text-red-300" />
        )}
      </button>
    </>
  )
}

export default AdminSidebar
