import React, { useState, useEffect, useCallback } from 'react'
import { CreditCard, Calendar, Clock, CalendarCheck, Sparkles, Menu } from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useSidebar } from '../context/SidebarContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'

interface PlanPricing {
  monthly: number
  quarterly: number
  yearly: number
}

interface PricingCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  title: string
  period: string
  price: number
  monthlyPrice: string
  discount?: number
  isPopular?: boolean
  onChange: (value: number) => void
}

const PricingCard: React.FC<PricingCardProps> = ({
  icon: Icon,
  title,
  period,
  price,
  monthlyPrice,
  discount = 0,
  isPopular = false,
  onChange
}) => {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div
      className={`relative rounded-2xl bg-white/5 ring-1 ring-white/10 p-6 transition-all duration-300 hover:shadow-lg hover:bg-white/[0.07]`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-sm font-medium px-4 py-1 rounded-full flex items-center gap-1 shadow">
            <Sparkles className="w-4 h-4" />
            <span>Recomendado</span>
          </div>
        </div>
      )}

      <div className="w-16 h-16 rounded-2xl bg-red-600 flex items-center justify-center mb-6 mx-auto shadow">
        <Icon className="w-8 h-8 text-white" />
      </div>

      <div className="text-center space-y-1.5 mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="text-sm text-white/60">{period}</p>
      </div>

      {isEditing ? (
        <div className="relative mt-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60">R$</span>
          <input
            type="number"
            value={price}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
          />
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-4xl font-bold text-white">{monthlyPrice}</div>
          <div className="text-sm text-white/60">por mês</div>
          {discount > 0 && Number.isFinite(discount) && (
            <div className="text-sm font-medium text-green-300 bg-green-500/15 ring-1 ring-green-400/30 py-1 px-3 rounded-full inline-block">
              Economia de {discount}%
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setIsEditing((v) => !v)}
          className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 transition"
        >
          {isEditing ? 'Concluir' : 'Editar valor'}
        </button>
      </div>
    </div>
  )
}

function AdminPlans() {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [pricing, setPricing] = useState<PlanPricing>({ monthly: 0, quarterly: 0, yearly: 0 })
  const [originalPricing, setOriginalPricing] = useState<PlanPricing>({ monthly: 0, quarterly: 0, yearly: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPlanPricing()
  }, [])

  const fetchPlanPricing = async () => {
    try {
      const token = localStorage.getItem('adminToken') || ''
      const response = await fetch(`${API_URL}/api/admin/plans/pricing`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      })
      if (!response.ok) throw new Error('Falha ao carregar preços')
      const data = await response.json()
      setPricing(data)
      setOriginalPricing(data)
    } catch (error) {
      toast.error('Erro ao carregar preços dos planos', { position: 'top-right', theme: 'dark' })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/plans/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(pricing)
      })
      if (!response.ok) throw new Error('Falha ao atualizar preços')
      setOriginalPricing(pricing)
      toast.success('Preços atualizados com sucesso!', { position: 'top-right', theme: 'dark' })
    } catch (error) {
      toast.error('Erro ao atualizar preços', { position: 'top-right', theme: 'dark' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setPricing(originalPricing)
    toast.info('Alterações descartadas', { theme: 'dark' })
  }

  const handleMonthlyChange = useCallback((value: number) => setPricing((p) => ({ ...p, monthly: value })), [])
  const handleQuarterlyChange = useCallback((value: number) => setPricing((p) => ({ ...p, quarterly: value })), [])
  const handleYearlyChange = useCallback((value: number) => setPricing((p) => ({ ...p, yearly: value })), [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const calculateMonthlyValue = (total: number, months: number) => formatCurrency(total / months)

  const trimestralDiscount = pricing.monthly ? Math.round((1 - pricing.quarterly / 3 / pricing.monthly) * 100) : 0
  const anualDiscount = pricing.monthly ? Math.round((1 - pricing.yearly / 12 / pricing.monthly) * 100) : 0

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
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold">Gerenciar Planos</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-white/90 ring-1 ring-white/10 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-white/90 disabled:opacity-70 transition"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-xl sm:text-2xl font-bold">Plano Profissional</h2>
              <p className="mt-2 text-white/60">Configure os preços para diferentes períodos de assinatura</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <PricingCard
                icon={Clock}
                title="Mensal"
                period="Cobrança mensal"
                price={pricing.monthly}
                monthlyPrice={formatCurrency(pricing.monthly)}
                onChange={handleMonthlyChange}
              />
              <PricingCard
                icon={Calendar}
                title="Trimestral"
                period="A cada 3 meses"
                price={pricing.quarterly}
                monthlyPrice={calculateMonthlyValue(pricing.quarterly, 3)}
                discount={trimestralDiscount}
                isPopular
                onChange={handleQuarterlyChange}
              />
              <PricingCard
                icon={CalendarCheck}
                title="Anual"
                period="A cada 12 meses"
                price={pricing.yearly}
                monthlyPrice={calculateMonthlyValue(pricing.yearly, 12)}
                discount={anualDiscount}
                onChange={handleYearlyChange}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminPlans
