import React, { useState, useEffect } from 'react'
import { X, Video, Upload } from 'lucide-react'
import extractYouTubeId from '../utils/extractYouTubeId'

interface VideoSettings {
  title: string
  description: string
  thumbnail?: string
  videoUrl?: string
  enabled: boolean
}

interface ModalVideoSettingsProps {
  isOpen: boolean
  onClose: () => void
  videoSettings: VideoSettings
  onSave: (videoSettings: VideoSettings) => void
}

const ModalVideoSettings: React.FC<ModalVideoSettingsProps> = ({
  isOpen,
  onClose,
  videoSettings,
  onSave
}) => {
  const [formData, setFormData] = useState<VideoSettings>(videoSettings)
  const [showVideo, setShowVideo] = useState(false)
  const youtubeId = extractYouTubeId(formData.videoUrl || '')

  useEffect(() => {
    setFormData(videoSettings)
  }, [videoSettings])

  useEffect(() => {
    setShowVideo(false)
  }, [youtubeId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-black text-white ring-1 ring-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Configurar Seção de Vídeo</h2>
              <p className="text-sm text-white/60">Configure o vídeo tutorial</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Fechar">
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
            <span className="text-sm">Exibir seção de vídeo</span>
          </label>

          {formData.enabled && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Título do Vídeo</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Tutorial: Primeiros Passos"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="Ex: Aprenda a usar a plataforma em 5 minutos"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">URL do Vídeo (Opcional)</label>
                <input
                  type="url"
                  value={formData.videoUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
                <p className="text-xs text-white/60">Cole a URL do YouTube, Vimeo ou outro serviço de vídeo</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail (Opcional)</label>
                <div className="rounded-lg p-6 ring-1 ring-white/10 bg-white/5">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-white/50" />
                    <div className="mt-4">
                      <label htmlFor="thumbnail" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium">Clique para fazer upload da thumbnail</span>
                        <input
                          id="thumbnail"
                          name="thumbnail"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              console.log('Upload da thumbnail:', file)
                            }
                          }}
                        />
                      </label>
                      <p className="mt-1 text-xs text-white/50">PNG, JPG, GIF até 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="rounded-xl p-6 bg-white/5 ring-1 ring-white/10">
                <h4 className="text-sm font-medium mb-4">Preview</h4>
                <div className="bg-black/60 rounded-xl aspect-video relative overflow-hidden ring-1 ring-white/10">
                  {youtubeId ? (
                    showVideo ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        title="YouTube video"
                        className="w-full h-full rounded-xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <img
                        src={`https://img.youtube.com/vi/${youtubeId}/0.jpg`}
                        alt="Miniatura do vídeo"
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowVideo(true)}
                      />
                    )
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                        <Video className="w-5 h-5 text-black ml-0.5" />
                      </div>
                    </div>
                  )}
                  {!showVideo && (
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black/80 backdrop-blur-sm rounded-xl p-3 ring-1 ring-white/10">
                        <h4 className="font-medium text-sm mb-1">{formData.title || 'Título do vídeo'}</h4>
                        <p className="text-white/70 text-xs">{formData.description || 'Descrição do vídeo'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 font-semibold transition">
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalVideoSettings
