import React, { useState, useEffect } from 'react'
import { X, Settings, Building2, Youtube, Users, Star, Target, Zap } from 'lucide-react'

interface FeatureCard {
  id: string
  title: string
  description: string
  icon: string
  order: number
}

interface ModalFeatureCardProps {
  isOpen: boolean
  onClose: () => void
  feature: FeatureCard | null
  onSave: (feature: FeatureCard) => void
}

const iconOptions = [
  { name: 'Building2', icon: Building2, label: 'Organizações' },
  { name: 'Youtube', icon: Youtube, label: 'Canais' },
  { name: 'Users', icon: Users, label: 'Usuários' },
  { name: 'Settings', icon: Settings, label: 'Configurações' },
  { name: 'Star', icon: Star, label: 'Favoritos' },
  { name: 'Target', icon: Target, label: 'Objetivos' },
  { name: 'Zap', icon: Zap, label: 'Automação' }
]

const ModalFeatureCard: React.FC<ModalFeatureCardProps> = ({ isOpen, onClose, feature, onSave }) => {
  const [formData, setFormData] = useState<Omit<FeatureCard, 'id'>>({
    title: '',
    description: '',
    icon: 'Settings',
    order: 1
  })

  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title,
        description: feature.description,
        icon: feature.icon,
        order: feature.order
      })
    } else {
      setFormData({ title: '', description: '', icon: 'Settings', order: 1 })
    }
  }, [feature])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newFeature: FeatureCard = { id: feature?.id || Date.now().toString(), ...formData }
    onSave(newFeature)
    onClose()
  }

  const selectedIcon = iconOptions.find(opt => opt.name === formData.icon)
  const IconComponent = selectedIcon?.icon || Settings

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black text-white ring-1 ring-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{feature ? 'Editar Card' : 'Novo Card'}</h2>
              <p className="text-sm text-white/60">Configure as informações do card de funcionalidade</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Fechar">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Col esquerda */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Conteúdo</h3>

              <div className="space-y-2">
                <label className="text-sm font-medium">Título</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Organizações"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Descreva a funcionalidade..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Ícone</label>
                <div className="grid grid-cols-4 gap-3">
                  {iconOptions.map((option) => {
                    const Icon = option.icon
                    const selected = formData.icon === option.name
                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: option.name }))}
                        className={`p-3 rounded-lg transition-all ring-1 ${
                          selected ? 'bg-white/10 ring-white' : 'bg-white/5 ring-white/10 hover:bg-white/10'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto ${selected ? 'text-white' : 'text-white/70'}`} />
                        <span className="text-xs text-white/60 mt-1 block">{option.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Pré-visualização</h3>
              <div className="rounded-xl p-4 bg-white/5 ring-1 ring-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1">{formData.title || 'Título do Card'}</h3>
                    <p className="leading-relaxed font-light text-sm text-white/70">
                      {formData.description || 'Descrição do card será exibida aqui...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-white/10 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 font-semibold transition">
              {feature ? 'Salvar Alterações' : 'Criar Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalFeatureCard
