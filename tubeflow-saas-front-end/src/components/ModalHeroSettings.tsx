import React, { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'

interface HeroSettings {
  badge: { text: string; icon: string }
  title: { main: string; highlight: string }
  description: string
}

interface ModalHeroSettingsProps {
  isOpen: boolean
  onClose: () => void
  heroSettings: HeroSettings
  onSave: (heroSettings: HeroSettings) => void
}

const ModalHeroSettings: React.FC<ModalHeroSettingsProps> = ({
  isOpen,
  onClose,
  heroSettings,
  onSave
}) => {
  const [formData, setFormData] = useState<HeroSettings>(heroSettings)

  useEffect(() => {
    setFormData(heroSettings)
  }, [heroSettings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

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
              <h2 className="text-lg font-semibold">Configurar Seção Hero</h2>
              <p className="text-sm text-white/60">Edite o badge, o título e a descrição</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Fechar">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Conteúdo */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Conteúdo</h3>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white/80">Badge</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Texto do Badge</label>
                  <input
                    type="text"
                    value={formData.badge.text}
                    onChange={(e) => setFormData(prev => ({ ...prev, badge: { ...prev.badge, text: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Ex: Bem-vindo à Nossa Plataforma"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium text-white/80">Título</h4>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título Principal</label>
                  <input
                    type="text"
                    value={formData.title.main}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: { ...prev.title, main: e.target.value } }))}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Ex: Sua solução completa para"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Texto em Destaque</label>
                  <input
                    type="text"
                    value={formData.title.highlight}
                    onChange={(e) =>
                      setFormData(prev => ({ ...prev, title: { ...prev.title, highlight: e.target.value } }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="Ex: gerenciar criação de conteúdo"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Descreva os benefícios da plataforma..."
                />
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Pré-visualização</h3>
              <div className="rounded-xl p-6 bg-white/5 ring-1 ring-white/10">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm mb-6 bg-white/10">
                    <Sparkles className="w-4 h-4" />
                    {formData.badge.text || 'Bem-vindo à Nossa Plataforma'}
                  </div>
                  <h2 className="text-3xl font-light mb-3">
                    {formData.title.main || 'Sua solução completa para'}
                    <span className="block font-semibold">
                      {formData.title.highlight || 'gerenciar criação de conteúdo'}
                    </span>
                  </h2>
                  <p className="max-w-2xl mx-auto text-white/70">
                    {formData.description ||
                      'Gerencie projetos, colabore com freelancers e organize seus canais de conteúdo de forma eficiente e profissional.'}
                  </p>
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
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalHeroSettings
