import React, { useState, useEffect } from 'react'
import { X, Sparkles, Play, ArrowRight, Star, Zap } from 'lucide-react'

interface CTASettings {
  title: string
  description: string
  buttonText: string
  buttonIcon: string
  enabled: boolean
}

interface ModalCTASettingsProps {
  isOpen: boolean
  onClose: () => void
  ctaSettings: CTASettings
  onSave: (ctaSettings: CTASettings) => void
}

const iconOptions = [
  { name: 'Play', icon: Play, label: 'Play' },
  { name: 'ArrowRight', icon: ArrowRight, label: 'Seta' },
  { name: 'Sparkles', icon: Sparkles, label: 'Brilho' },
  { name: 'Star', icon: Star, label: 'Estrela' },
  { name: 'Zap', icon: Zap, label: 'Raio' }
]

const ModalCTASettings: React.FC<ModalCTASettingsProps> = ({
  isOpen,
  onClose,
  ctaSettings,
  onSave
}) => {
  const [formData, setFormData] = useState<CTASettings>(ctaSettings)

  useEffect(() => {
    setFormData(ctaSettings)
  }, [ctaSettings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const selectedIcon = iconOptions.find(opt => opt.name === formData.buttonIcon)
  const IconComponent = selectedIcon?.icon || Play

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-black text-white ring-1 ring-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Configurar Call to Action</h2>
              <p className="text-sm text-white/60">Defina o conteúdo do bloco final</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Col esquerda */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Conteúdo</h3>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Exibir call to action</span>
              </label>

              {formData.enabled && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="Ex: Pronto para começar?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="Descreva a ação que o usuário deve tomar..."
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Texto do Botão</label>
                    <input
                      type="text"
                      value={formData.buttonText}
                      onChange={(e) => setFormData(prev => ({ ...prev, buttonText: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="Ex: Explorar Dashboard"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium">Ícone do Botão</label>
                    <div className="grid grid-cols-5 gap-3">
                      {iconOptions.map((option) => {
                        const Icon = option.icon
                        const selected = formData.buttonIcon === option.name
                        return (
                          <button
                            key={option.name}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, buttonIcon: option.name }))}
                            className={`p-3 rounded-lg transition-all ring-1 ${
                              selected
                                ? 'bg-white/10 ring-white'
                                : 'bg-white/5 ring-white/10 hover:bg-white/10'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto ${selected ? 'text-white' : 'text-white/70'}`} />
                            <span className="block mt-1 text-xs text-white/60">{option.label}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Col direita */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Pré-visualização</h3>
              {formData.enabled ? (
                <div className="rounded-xl p-6 bg-white/5 ring-1 ring-white/10">
                  <div className="text-center">
                    <h3 className="text-xl font-light mb-2">{formData.title || 'Título do CTA'}</h3>
                    <p className="mb-4 text-white/70">{formData.description || 'Descrição do call to action'}</p>
                    <button className="inline-flex items-center gap-2 px-6 py-3 font-medium rounded-xl bg-white text-black hover:bg-white/90 transition">
                      <IconComponent className="w-4 h-4" />
                      {formData.buttonText || 'Texto do Botão'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-white/60">CTA desativado</div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 font-semibold transition"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalCTASettings
