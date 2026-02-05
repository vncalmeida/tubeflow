import React, { useState, useEffect } from 'react'
import { X, Image, Code } from 'lucide-react'

interface AdSettings {
  title: string
  description: string
  htmlContent: string
  enabled: boolean
}

interface ModalAdSettingsProps {
  isOpen: boolean
  onClose: () => void
  adSettings: AdSettings
  onSave: (adSettings: AdSettings) => void
}

const ModalAdSettings: React.FC<ModalAdSettingsProps> = ({
  isOpen,
  onClose,
  adSettings,
  onSave
}) => {
  const [formData, setFormData] = useState<AdSettings>(adSettings)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    setFormData(adSettings)
  }, [adSettings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-black text-white ring-1 ring-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Image className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Configurar Seção de Anúncios</h2>
              <p className="text-sm text-white/60">Configure o conteúdo HTML personalizado</p>
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="rounded"
            />
            <span className="text-sm">Exibir seção de anúncios</span>
          </label>

          {formData.enabled && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Título da Seção</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Espaço para Anúncios"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Conteúdo HTML personalizado será exibido aqui"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Conteúdo HTML</label>
                  <div className="flex items-center rounded-lg p-1 bg-white/10">
                    <button
                      type="button"
                      onClick={() => setActiveTab('edit')}
                      className={`px-3 py-1 rounded-md text-sm transition ${
                        activeTab === 'edit' ? 'bg-white text-black shadow' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Code className="w-4 h-4 inline mr-1" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 rounded-md text-sm transition ${
                        activeTab === 'preview' ? 'bg-white text-black shadow' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Image className="w-4 h-4 inline mr-1" />
                      Preview
                    </button>
                  </div>
                </div>

                {activeTab === 'edit' ? (
                  <div>
                    <textarea
                      rows={12}
                      value={formData.htmlContent}
                      onChange={(e) => setFormData(prev => ({ ...prev, htmlContent: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg font-mono text-sm bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="Cole seu código HTML aqui..."
                    />
                    <p className="text-xs text-white/60 mt-2">
                      Certifique-se de que o HTML é seguro e confiável antes de salvar.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg p-4 bg-white/5 ring-1 ring-white/10 min-h-[300px]">
                    <h4 className="text-sm font-medium mb-3">Preview do HTML</h4>
                    <div
                      className="rounded-lg p-4 bg-black ring-1 ring-white/10"
                      dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
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

export default ModalAdSettings
