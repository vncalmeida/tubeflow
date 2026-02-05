import React, { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react'
import { FooterElement } from '../pages/AdminFooterSettings'

interface FooterElementModalProps {
  isOpen: boolean
  onClose: () => void
  element: FooterElement | null
  columnId: string
  onSave: (element: FooterElement) => void
}

const FooterElementModal: React.FC<FooterElementModalProps> = ({
  isOpen,
  onClose,
  element,
  columnId,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<FooterElement>>({})
  const [elementType, setElementType] = useState<string>('text')

  useEffect(() => {
    if (element) {
      setFormData(element)
      setElementType(element.type)
    } else {
      setFormData({
        type: 'text',
        title: '',
        content: '',
        style: {
          alignment: 'left',
          textColor: '#d1d5db',
          fontSize: 'sm',
          fontWeight: 'normal',
          spacing: 'normal'
        },
        columnId
      })
      setElementType('text')
    }
  }, [element, columnId])

  const handleSave = () => {
    if (!formData.content && elementType !== 'custom') return

    const newElement: FooterElement = {
      id: element?.id || Date.now().toString(),
      type: elementType as FooterElement['type'],
      title: formData.title || '',
      content: formData.content,
      style:
        formData.style || {
          alignment: 'left',
          textColor: '#d1d5db',
          fontSize: 'sm',
          fontWeight: 'normal',
          spacing: 'normal'
        },
      order: element?.order || 1,
      columnId
    }

    onSave(newElement)
    onClose()
  }

  const updateStyle = (key: keyof NonNullable<FooterElement['style']>, value: any) => {
    setFormData(prev => ({
      ...prev,
      style: {
        ...(prev.style || {}),
        [key]: value
      }
    }))
  }

  const addLink = () => {
    const currentLinks = Array.isArray(formData.content) ? (formData.content as any[]) : []
    setFormData(prev => ({
      ...prev,
      content: [...currentLinks, { text: '', url: '' }]
    }))
  }

  const updateLink = (index: number, field: 'text' | 'url', value: string) => {
    const links = Array.isArray(formData.content) ? [...(formData.content as any[])] : []
    links[index] = { ...(links[index] || {}), [field]: value }
    setFormData(prev => ({ ...prev, content: links }))
  }

  const removeLink = (index: number) => {
    const links = Array.isArray(formData.content) ? [...(formData.content as any[])] : []
    links.splice(index, 1)
    setFormData(prev => ({ ...prev, content: links }))
  }

  const getAlignmentIcon = (alignment: string) => {
    switch (alignment) {
      case 'left':
        return AlignLeft
      case 'center':
        return AlignCenter
      case 'right':
        return AlignRight
      default:
        return AlignLeft
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-black text-white ring-1 ring-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{element ? 'Editar Elemento' : 'Adicionar Elemento'}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition" aria-label="Fechar">
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Tipo de Elemento */}
            {!element && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Elemento</label>
                <select
                  value={elementType}
                  onChange={(e) => {
                    setElementType(e.target.value)
                    setFormData(prev => ({ ...prev, type: e.target.value as FooterElement['type'], content: '' }))
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="text">Texto</option>
                  <option value="links">Links</option>
                  <option value="social">Redes Sociais</option>
                  <option value="contact">Contato</option>
                  <option value="logo">Logo</option>
                  <option value="newsletter">Newsletter</option>
                  <option value="custom">HTML Personalizado</option>
                </select>
              </div>
            )}

            {/* Título */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Título (opcional)</label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                placeholder="Título do elemento"
              />
            </div>

            {/* Conteúdo dinamico */}
            {elementType === 'text' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Texto</label>
                <textarea
                  value={(formData.content as string) || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  rows={4}
                  placeholder="Digite o texto aqui..."
                />
              </div>
            )}

            {elementType === 'links' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Links</label>
                  <button
                    type="button"
                    onClick={addLink}
                    className="flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-white text-black hover:bg-white/90 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Link
                  </button>
                </div>

                <div className="space-y-3">
                  {((formData.content as any[]) || []).map((link: any, index: number) => (
                    <div key={index} className="flex gap-2 p-3 rounded-lg bg-white/5 ring-1 ring-white/10">
                      <input
                        type="text"
                        value={link.text}
                        onChange={(e) => updateLink(index, 'text', e.target.value)}
                        placeholder="Texto do link"
                        className="flex-1 px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        placeholder="URL"
                        className="flex-1 px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="p-2 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {elementType === 'contact' && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Informações de Contato</label>
                <input
                  type="email"
                  value={(formData.content as any)?.email || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, content: { ...(prev.content as any), email: e.target.value } }))
                  }
                  placeholder="E-mail"
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <input
                  type="tel"
                  value={(formData.content as any)?.phone || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, content: { ...(prev.content as any), phone: e.target.value } }))
                  }
                  placeholder="Telefone"
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                />
                <input
                  type="text"
                  value={(formData.content as any)?.address || ''}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, content: { ...(prev.content as any), address: e.target.value } }))
                  }
                  placeholder="Endereço"
                  className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
            )}

            {elementType === 'custom' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">HTML Personalizado</label>
                <textarea
                  value={(formData.content as string) || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg bg-black text-white ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none font-mono text-sm"
                  rows={6}
                  placeholder="<div>Seu HTML personalizado aqui...</div>"
                />
              </div>
            )}

            {/* Estilo */}
            <div className="pt-6 border-t border-white/10">
              <h3 className="text-lg font-medium mb-4">Configurações de Estilo</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Alinhamento */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alinhamento</label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((alignment) => {
                      const AlignIcon = getAlignmentIcon(alignment)
                      const active = formData.style?.alignment === alignment
                      return (
                        <button
                          key={alignment}
                          type="button"
                          onClick={() => updateStyle('alignment', alignment)}
                          className={`p-2 rounded-lg transition-colors ${
                            active ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                          }`}
                        >
                          <AlignIcon className="w-4 h-4" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Tamanho da Fonte */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tamanho da Fonte</label>
                  <select
                    value={formData.style?.fontSize || 'sm'}
                    onChange={(e) => updateStyle('fontSize', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="sm">Pequeno</option>
                    <option value="base">Normal</option>
                    <option value="lg">Grande</option>
                    <option value="xl">Extra Grande</option>
                  </select>
                </div>

                {/* Peso da Fonte */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Peso da Fonte</label>
                  <select
                    value={formData.style?.fontWeight || 'normal'}
                    onChange={(e) => updateStyle('fontWeight', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="medium">Médio</option>
                    <option value="semibold">Semi-negrito</option>
                    <option value="bold">Negrito</option>
                  </select>
                </div>

                {/* Cor do Texto */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cor do Texto</label>
                  <input
                    type="color"
                    value={formData.style?.textColor || '#d1d5db'}
                    onChange={(e) => updateStyle('textColor', e.target.value)}
                    className="w-full h-10 rounded-lg ring-1 ring-white/10 bg-black cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 font-semibold transition"
          >
            <Save className="w-4 h-4" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default FooterElementModal
