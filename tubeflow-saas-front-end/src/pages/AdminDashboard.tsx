import React, { useState, useEffect } from 'react'
import { Building2, Users, AlertCircle, DollarSign, Menu } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useSidebar } from '../context/SidebarContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'

interface DashboardStats {
  totalCompanies: number
  activeCompanies: number
  inactiveCompanies: number
  lastMonthRevenue: number
}

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  value: number | string
  description: string
  accent?: 'red' | 'blue' | 'green' | 'purple'
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, title, value, description, accent = 'red' }) => {
  const accentBg =
    accent === 'red'
      ? 'bg-red-600'
      : accent === 'blue'
      ? 'bg-blue-600'
      : accent === 'green'
      ? 'bg-green-600'
      : 'bg-purple-600'

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${accentBg}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <p className="text-sm text-white/60">{description}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' && title.toLowerCase().includes('faturamento')
            ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : value}
        </p>
      </div>
    </div>
  )
}

function AdminDashboard() {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [stats, setStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeCompanies: 0,
    inactiveCompanies: 0,
    lastMonthRevenue: 0
  })

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard-stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        })
        if (!response.ok) throw new Error('Falha ao carregar estatísticas')
        const data = await response.json()
        setStats(data)
      } catch (error) {
        toast.error('Erro ao carregar estatísticas do dashboard', { position: 'top-right', theme: 'dark' })
      }
    }
    fetchDashboardStats()
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer theme="dark" />
      <AdminSidebar />

      <div className={`transition-[margin] duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-black/80 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-white/80 hover:bg-white/10 hover:text-white transition"
              aria-label="Abrir menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold">Dashboard</h1>
            <div className="w-9 lg:hidden" />
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Building2}
              title="Total de Empresas"
              value={stats.totalCompanies}
              description="Empresas registradas"
              accent="blue"
            />
            <StatCard
              icon={Users}
              title="Empresas Ativas"
              value={stats.activeCompanies}
              description="Com plano vigente"
              accent="green"
            />
            <StatCard
              icon={AlertCircle}
              title="Empresas Inativas"
              value={stats.inactiveCompanies}
              description="Plano não renovado"
              accent="red"
            />
            <StatCard
              icon={DollarSign}
              title="Faturamento"
              value={stats.lastMonthRevenue}
              description="Último mês"
              accent="purple"
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
