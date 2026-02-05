import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSidebar } from '../context/SidebarContext'
import {
  Home,
  Users,
  Video,
  Shield,
  SettingsIcon,
  Clock,
  BarChart2,
  Play,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Moon,
  Sun,
  Menu,
  Handshake
} from 'lucide-react'

type MenuItem = {
  id: string
  label: string
  icon: React.ReactNode
  path: string
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebar()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const isFreelancer = localStorage.getItem('isFreelancer') === 'true'

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'dark'
    localStorage.setItem('theme', storedTheme)
    if (storedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      setIsDarkMode(true)
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark'
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
    setIsDarkMode(!isDarkMode)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('isFreelancer')
    window.location.href = '/login'
  }

  const menuItems: MenuItem[] = [
    { id: 'welcome', label: 'welcome', icon: <Handshake className="w-5 h-5" />, path: '/welcome' },
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/dashboard' },
    { id: 'freelancers', label: 'Freelancers', icon: <Users className="w-5 h-5" />, path: '/freelancers' },
    { id: 'Administradores', label: 'Administradores', icon: <Shield className="w-5 h-5" />, path: '/administradores' },
    { id: 'videos', label: 'Vídeos', icon: <Video className="w-5 h-5" />, path: '/videos' },
    { id: 'canais', label: 'Canais', icon: <Play className="w-5 h-5" />, path: '/canais' },
    { id: 'logs', label: 'Logs', icon: <Clock className="w-5 h-5" />, path: '/logs' },
    { id: 'reports', label: 'Relatórios', icon: <BarChart2 className="w-5 h-5" />, path: '/reports' },
    { id: 'configuracao', label: 'Configurações', icon: <SettingsIcon className="w-5 h-5" />, path: '/configuracoes' }
  ]

  const filteredMenuItems = isFreelancer
    ? menuItems.filter(item => item.id === 'welcome' || item.id === 'videos' || item.id === 'dashboard')
    : menuItems

  const activeItem = filteredMenuItems.find(item => location.pathname.startsWith(item.path))

  const handleNavigation = (item: MenuItem) => {
    navigate(item.path)
    if (window.innerWidth < 1024) {
      closeSidebar()
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 lg:hidden z-40 ${
          isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={closeSidebar}
      />
      <aside
        className={`fixed top-0 left-0 h-full bg-white dark:bg-black border-r border-gray-200 dark:border-white/10 transform transition-all duration-300 ease-in-out z-40 shadow-xl flex flex-col ${
          isSidebarOpen ? 'w-64 translate-x-0' : 'w-16 lg:translate-x-0 -translate-x-full'
        } overflow-hidden`}
      >
        {/* Topo com o mesmo SVG do header */}
        <div
          className={`h-16 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-red-50 to-red-100 dark:from-black dark:to-black flex-shrink-0 ${
            isSidebarOpen ? 'px-4' : 'px-2'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">

              {isSidebarOpen && (
                <span className="text-xl font-bold text-gray-900 dark:text-white flex items-center">TubeFlow</span>
              )}
            </div>
          </div>
        </div>

        <nav className={`flex-1 space-y-1 overflow-y-auto overflow-x-hidden ${isSidebarOpen ? 'p-3' : 'p-1'}`}>
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`w-full flex items-center py-2.5 rounded-lg transition-all duration-200 text-sm font-medium group relative ${
                isSidebarOpen ? 'gap-3 px-3 justify-start' : 'justify-center px-1'
              } ${
                activeItem?.id === item.id
                  ? 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800/30'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-white/80 dark:hover:bg-red-900/10 dark:hover:text-red-300'
              }`}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <div
                className={`${
                  activeItem?.id === item.id
                    ? 'text-red-600 dark:text-red-300'
                    : 'text-gray-500 dark:text-white/70 group-hover:text-gray-600 dark:group-hover:text-red-300'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
              </div>
              {isSidebarOpen && <span className="truncate">{item.label}</span>}
              {activeItem?.id === item.id && (
                <div
                  className={`${
                    isSidebarOpen ? 'ml-auto' : 'absolute -right-1 top-1/2 -translate-y-1/2'
                  } w-2 h-2 bg-red-600 dark:bg-red-500 rounded-full flex-shrink-0`}
                />
              )}
              {!isSidebarOpen && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-black rotate-45"></div>
                </div>
              )}
            </button>
          ))}
        </nav>

        <div
          className={`border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black flex-shrink-0 overflow-hidden ${
            isSidebarOpen ? 'p-3 space-y-2' : 'p-1 space-y-1'
          }`}
        >
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center rounded-lg transition-all duration-200 text-sm font-medium group relative ${
              isSidebarOpen ? 'py-2.5 gap-3 px-3 justify-start' : 'py-2 justify-center px-1'
            } text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-white/80 dark:hover:bg-red-900/10 dark:hover:text-red-300`}
            title={!isSidebarOpen ? (isDarkMode ? 'Modo claro' : 'Modo escuro') : undefined}
          >
            <div className="flex-shrink-0 text-gray-500 dark:text-white/70 group-hover:text-red-700 dark:group-hover:text-red-300">
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </div>
            {isSidebarOpen && <span className="truncate">{isDarkMode ? 'Modo claro' : 'Modo escuro'}</span>}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                {isDarkMode ? 'Modo claro' : 'Modo escuro'}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-black rotate-45"></div>
              </div>
            )}
          </button>

          <div className={`flex items-center ${isSidebarOpen ? 'gap-3 px-3 py-2' : 'justify-center py-2 px-1'}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-full flex items-center justify-center relative">
              <span className="text-xs font-semibold text-white">{isFreelancer ? 'F' : 'A'}</span>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-black rounded-full" />
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {isFreelancer ? 'Freelancer' : 'Administrador'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">Online</p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center rounded-lg transition-all duration-200 text-sm font-medium group relative ${
              isSidebarOpen ? 'gap-3 px-3 justify-start py-2.5' : 'justify-center px-1 py-2'
            } text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-900/10`}
            title={!isSidebarOpen ? 'Sair' : undefined}
          >
            <div className="flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            {isSidebarOpen && <span className="truncate">Sair</span>}
            {!isSidebarOpen && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-black text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                Sair
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-900 dark:bg-black rotate-45"></div>
              </div>
            )}
          </button>
        </div>
      </aside>

      <button
        onClick={toggleSidebar}
        className={`fixed top-1/2 -translate-y-1/2 z-50 p-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-r-lg shadow-lg text-gray-600 hover:text-gray-900 dark:text-white/80 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800/30 transition-all duration-300 hidden lg:flex items-center justify-center ${
          isSidebarOpen ? 'left-64' : 'left-16'
        }`}
        title={isSidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-red-600 dark:text-red-300" />
        ) : (
          <ChevronRight className="w-4 h-4 text-red-600 dark:text-red-300" />
        )}
      </button>

      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-lg shadow-lg text-gray-600 hover:text-gray-900 dark:text-white/80 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-300 dark:hover:border-red-800/30 transition-all duration-200 lg:hidden"
        title="Menu"
      >
        {isSidebarOpen ? (
          <X className="w-5 h-5 text-red-600 dark:text-red-300" />
        ) : (
          <Menu className="w-5 h-5 text-red-600 dark:text-red-300" />
        )}
      </button>
    </>
  )
}

export default Sidebar
