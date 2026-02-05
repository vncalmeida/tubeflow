import React, { useEffect, useState } from 'react'
import {
  Layers, Edit3, Plus, Save, Eye, Settings, ChevronDown, ChevronUp, Trash2, Sparkles, Grid3X3,
  Type, Link as LinkIcon, Image as ImageIcon, Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin,
  AlignLeft, AlignCenter, AlignRight, Sun, Moon, Menu
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import { useSidebar } from '../context/SidebarContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'
import FooterElementModal from '../components/FooterElementModal'
import DragDropProvider from '../components/DragDropProvider'
// ✅ alias correto do componente da coluna (evita colisão com a interface FooterColumn)
import FooterColumnComponent from '../components/FooterColumn'

export interface FooterElement {
  id: string
  type: 'text' | 'links' | 'social' | 'contact' | 'logo' | 'newsletter' | 'custom'
  title?: string
  content: any
  style: {
    alignment: 'left' | 'center' | 'right'
    textColor: string
    fontSize: 'sm' | 'base' | 'lg' | 'xl'
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold'
    spacing: 'tight' | 'normal' | 'loose'
  }
  order: number
  columnId: string
}

export interface FooterColumn {
  id: string
  title?: string
  width: 'sm' | 'md' | 'lg' | 'full'
  elements: FooterElement[]
  order: number
}

interface FooterSettings {
  enabled: boolean
  backgroundColor: string
  textColor: string
  borderTop: boolean
  borderColor: string
  padding: 'sm' | 'md' | 'lg'
  columns: FooterColumn[]
  copyright: {
    enabled: boolean
    text: string
    alignment: 'left' | 'center' | 'right'
  }
  socialLinks: {
    enabled: boolean
    links: Array<{
      platform: string
      url: string
      icon: string
    }>
  }
}

const defaultFooterSettings: FooterSettings = {
  enabled: true,
  backgroundColor: '#1f2937',
  textColor: '#f9fafb',
  borderTop: true,
  borderColor: '#374151',
  padding: 'md',
  columns: [
    {
      id: '1',
      title: 'Empresa',
      width: 'md',
      order: 1,
      elements: [
        {
          id: '1-1',
          type: 'text',
          content: 'Nossa empresa é líder em soluções inovadoras para criação de conteúdo digital.',
          style: { alignment: 'left', textColor: '#d1d5db', fontSize: 'sm', fontWeight: 'normal', spacing: 'normal' },
          order: 1,
          columnId: '1'
        }
      ]
    },
    {
      id: '2',
      title: 'Links Rápidos',
      width: 'md',
      order: 2,
      elements: [
        {
          id: '2-1',
          type: 'links',
          content: [
            { text: 'Início', url: '/' },
            { text: 'Sobre', url: '/about' },
            { text: 'Serviços', url: '/services' },
            { text: 'Contato', url: '/contact' }
          ],
          style: { alignment: 'left', textColor: '#d1d5db', fontSize: 'sm', fontWeight: 'normal', spacing: 'normal' },
          order: 1,
          columnId: '2'
        }
      ]
    },
    {
      id: '3',
      title: 'Contato',
      width: 'md',
      order: 3,
      elements: [
        {
          id: '3-1',
          type: 'contact',
          content: { email: 'contato@empresa.com', phone: '+55 11 99999-9999', address: 'São Paulo, SP' },
          style: { alignment: 'left', textColor: '#d1d5db', fontSize: 'sm', fontWeight: 'normal', spacing: 'normal' },
          order: 1,
          columnId: '3'
        }
      ]
    }
  ],
  copyright: { enabled: true, text: '© 2024 Sua Empresa. Todos os direitos reservados.', alignment: 'center' },
  socialLinks: {
    enabled: true,
    links: [
      { platform: 'Facebook', url: 'https://facebook.com', icon: 'Facebook' },
      { platform: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
      { platform: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
      { platform: 'YouTube', url: 'https://youtube.com', icon: 'Youtube' }
    ]
  }
}

const elementTypes = [
  { type: 'text', label: 'Texto', icon: Type, description: 'Adicionar texto personalizado' },
  { type: 'links', label: 'Links', icon: LinkIcon, description: 'Lista de links de navegação' },
  { type: 'social', label: 'Redes Sociais', icon: Facebook, description: 'Ícones de redes sociais' },
  { type: 'contact', label: 'Contato', icon: Phone, description: 'Informações de contato' },
  { type: 'logo', label: 'Logo', icon: ImageIcon, description: 'Logo da empresa' },
  { type: 'newsletter', label: 'Newsletter', icon: Mail, description: 'Formulário de newsletter' },
  { type: 'custom', label: 'HTML Personalizado', icon: Settings, description: 'Conteúdo HTML customizado' }
]

const AdminFooterSettings: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [settings, setSettings] = useState<FooterSettings>(defaultFooterSettings)
  const [expandedSections, setExpandedSections] = useState<string[]>(['preview', 'columns'])
  const [selectedElement, setSelectedElement] = useState<FooterElement | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previewDark, setPreviewDark] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/footer-settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        })
        if (response.ok) {
          const data = await response.json()
          if (data && Object.keys(data).length > 0) {
            setSettings(prev => ({ ...prev, ...data }))
          }
        }
      } catch {
        // silencioso
      }
    }
    fetchSettings()
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => (prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]))
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      const payload = {
        enabled: settings.enabled,
        padding: settings.padding,
        borderTop: settings.borderTop,
        columns: settings.columns,
        copyright: settings.copyright,
        socialLinks: settings.socialLinks
      }
      const response = await fetch(`${API_URL}/api/admin/footer-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(payload)
      })
      if (!response.ok) throw new Error('Erro ao salvar')
      toast.success('Configurações do rodapé salvas com sucesso!', { theme: 'dark' })
    } catch {
      toast.error('Erro ao salvar configurações', { theme: 'dark' })
    } finally {
      setIsLoading(false)
    }
  }

  const addColumn = () => {
    const newColumn: FooterColumn = {
      id: Date.now().toString(),
      title: 'Nova Coluna',
      width: 'md',
      elements: [],
      order: settings.columns.length + 1
    }
    setSettings(prev => ({ ...prev, columns: [...prev.columns, newColumn] }))
  }

  const updateColumn = (columnId: string, updates: Partial<FooterColumn>) => {
    setSettings(prev => ({
      ...prev,
      columns: prev.columns.map((col: FooterColumn) => (col.id === columnId ? { ...col, ...updates } : col))
    }))
  }

  const deleteColumn = (columnId: string) => {
    setSettings(prev => ({ ...prev, columns: prev.columns.filter((col: FooterColumn) => col.id !== columnId) }))
    toast.success('Coluna removida com sucesso!', { theme: 'dark' })
  }

  const addElement = (_type: string, columnId: string) => {
    setSelectedElement(null)
    setSelectedColumn(columnId)
    setIsModalOpen(true)
  }

  const editElement = (element: FooterElement) => {
    setSelectedElement(element)
    setSelectedColumn(element.columnId)
    setIsModalOpen(true)
  }

  const saveElement = (element: FooterElement) => {
    setSettings(prev => ({
      ...prev,
      columns: prev.columns.map((col: FooterColumn) => {
        if (col.id === element.columnId) {
          const existingIndex = col.elements.findIndex((el: FooterElement) => el.id === element.id)
          if (existingIndex >= 0) {
            return {
              ...col,
              elements: col.elements.map((el: FooterElement, idx: number) => (idx === existingIndex ? element : el))
            }
          } else {
            return { ...col, elements: [...col.elements, { ...element, id: Date.now().toString() }] }
          }
        }
        return col
      })
    }))
    setIsModalOpen(false)
    setSelectedElement(null)
    setSelectedColumn('')
  }

  const deleteElement = (elementId: string, columnId: string) => {
    setSettings(prev => ({
      ...prev,
      columns: prev.columns.map((col: FooterColumn) =>
        col.id === columnId ? { ...col, elements: col.elements.filter((el: FooterElement) => el.id !== elementId) } : col
      )
    }))
    toast.success('Elemento removido com sucesso!', { theme: 'dark' })
  }

  const moveColumn = (columnId: string, direction: 'left' | 'right') => {
    setSettings(prev => {
      const columns = [...prev.columns].sort((a: FooterColumn, b: FooterColumn) => a.order - b.order)
      const index = columns.findIndex((col: FooterColumn) => col.id === columnId)
      if ((direction === 'left' && index === 0) || (direction === 'right' && index === columns.length - 1)) return prev
      const newIndex = direction === 'left' ? index - 1 : index + 1
      ;[columns[index], columns[newIndex]] = [columns[newIndex], columns[index]]
      columns.forEach((column: FooterColumn, idx: number) => {
        column.order = idx + 1
      })
      return { ...prev, columns }
    })
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

  const SectionCard = ({
    title,
    description,
    icon: Icon,
    sectionKey,
    children,
    actions
  }: {
    title: string
    description: string
    icon: React.ElementType
    sectionKey: string
    children: React.ReactNode
    actions?: React.ReactNode
  }) => {
    const isExpanded = expandedSections.includes(sectionKey)
    const headingId = `footer-${sectionKey}-heading`
    return (
      <section
        role="region"
        aria-labelledby={headingId}
        className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-4 cursor-pointer select-none"
              onClick={() => toggleSection(sectionKey)}
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 id={headingId} className="text-lg font-semibold text-white">
                  {title}
                </h3>
                <p className="text-sm text-white/60 mt-1">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div onClick={(e) => e.stopPropagation()}>{actions}</div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  toggleSection(sectionKey)
                }}
                aria-expanded={isExpanded}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-white/70" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-white/70" />
                )}
              </button>
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="border-t border-white/10 bg-black/40">
            <div className="p-6">{children}</div>
          </div>
        )}
      </section>
    )
  }

  const getPaddingClass = (padding: FooterSettings['padding']) => {
    if (padding === 'sm') return 'py-8'
    if (padding === 'lg') return 'py-16'
    return 'py-12'
  }

  const getGridClass = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    if (count === 3) return 'grid-cols-1 md:grid-cols-3'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <DragDropProvider>
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
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-semibold">Configurar Rodapé</h1>
                  <p className="text-sm text-white/60">Apenas conteúdo. As cores seguem o tema do sistema.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-black hover:bg-white/90 transition disabled:opacity-70"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? 'Salvando...' : 'Salvar Configurações'}
              </button>
            </div>
          </header>

          {/* Conteúdo */}
          <main className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <SectionCard
                title="Configurações Gerais"
                description="Defina opções básicas do rodapé"
                icon={Settings}
                sectionKey="general"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="footer-enabled" className="block text-sm font-medium text-white/80">
                      Habilitar Rodapé
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="footer-enabled"
                        type="checkbox"
                        checked={settings.enabled}
                        onChange={(e) => setSettings((prev) => ({ ...prev, enabled: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-white/60">Exibir rodapé no site</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="footer-padding" className="block text-sm font-medium text-white/80">
                      Espaçamento Vertical
                    </label>
                    <select
                      id="footer-padding"
                      value={settings.padding}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, padding: e.target.value as FooterSettings['padding'] }))
                      }
                      className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                    >
                      <option value="sm">Pequeno</option>
                      <option value="md">Médio</option>
                      <option value="lg">Grande</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="footer-border-top" className="block text-sm font-medium text-white/80">
                      Borda Superior
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="footer-border-top"
                        type="checkbox"
                        checked={settings.borderTop}
                        onChange={(e) => setSettings((prev) => ({ ...prev, borderTop: e.target.checked }))}
                        className="rounded"
                      />
                      <span className="text-sm text-white/60">Exibir borda superior</span>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Pré-visualização"
                description="Veja o rodapé em modo claro e escuro"
                icon={Eye}
                sectionKey="preview"
                actions={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewDark(false)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                        !previewDark ? 'bg-white text-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      <Sun className="w-4 h-4" /> Claro
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewDark(true)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                        previewDark ? 'bg-white text-black' : 'bg-white/10 text-white'
                      }`}
                    >
                      <Moon className="w-4 h-4" /> Escuro
                    </button>
                  </div>
                }
              >
                <div className={`${previewDark ? 'dark' : ''}`}>
                  <div className="rounded-xl overflow-hidden bg-white text-gray-900 dark:bg黑 dark:bg-black dark:text-white ring-1 ring-white/10">
                    <div className={`px-8 ${getPaddingClass(settings.padding)}`}>
                      <div className={`grid gap-8 ${getGridClass(settings.columns.length)}`}>
                        {settings.columns
                          .slice()
                          .sort((a: FooterColumn, b: FooterColumn) => a.order - b.order)
                          .map((column: FooterColumn) => (
                            <div key={column.id} className="space-y-4">
                              {column.title && <h3 className="text-lg font-semibold">{column.title}</h3>}
                              {column.elements
                                .slice()
                                .sort((a: FooterElement, b: FooterElement) => a.order - b.order)
                                .map((element: FooterElement) => (
                                  <div
                                    key={element.id}
                                    className={`${
                                      element.style.alignment === 'center'
                                        ? 'text-center'
                                        : element.style.alignment === 'right'
                                        ? 'text-right'
                                        : 'text-left'
                                    }`}
                                  >
                                    {element.type === 'text' && (
                                      <p
                                        className={`${
                                          element.style.fontSize === 'xl'
                                            ? 'text-xl'
                                            : element.style.fontSize === 'lg'
                                            ? 'text-lg'
                                            : element.style.fontSize === 'base'
                                            ? 'text-base'
                                            : 'text-sm'
                                        } ${
                                          element.style.fontWeight === 'bold'
                                            ? 'font-bold'
                                            : element.style.fontWeight === 'semibold'
                                            ? 'font-semibold'
                                            : element.style.fontWeight === 'medium'
                                            ? 'font-medium'
                                            : 'font-normal'
                                        } text-gray-600 dark:text-white/70`}
                                      >
                                        {element.content}
                                      </p>
                                    )}

                                    {element.type === 'links' && (
                                      <ul className="space-y-2">
                                        {element.content.map((link: any, idx: number) => (
                                          <li key={idx}>
                                            <a
                                              href={link.url}
                                              className="underline-offset-2 hover:underline text-gray-900 dark:text-white"
                                            >
                                              {link.text}
                                            </a>
                                          </li>
                                        ))}
                                      </ul>
                                    )}

                                    {element.type === 'contact' && (
                                      <div className="space-y-2 text-gray-600 dark:text-white/70">
                                        {element.content.email && (
                                          <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{element.content.email}</span>
                                          </div>
                                        )}
                                        {element.content.phone && (
                                          <div className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            <span>{element.content.phone}</span>
                                          </div>
                                        )}
                                        {element.content.address && (
                                          <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            <span>{element.content.address}</span>
                                          </div>
                                        )}
                                      </div>
                                    )}

                                    {element.type === 'social' && (
                                      <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white">
                                          <Facebook className="w-5 h-5" />
                                        </div>
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white">
                                          <Instagram className="w-5 h-5" />
                                        </div>
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white">
                                          <Twitter className="w-5 h-5" />
                                        </div>
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white">
                                          <Youtube className="w-5 h-5" />
                                        </div>
                                      </div>
                                    )}

                                    {element.type === 'logo' && (
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 text-white dark:bg-white dark:text-gray-900">
                                          <Youtube className="w-5 h-5" />
                                        </div>
                                        <span className="text-xl font-bold">{element.content || 'Logo'}</span>
                                      </div>
                                    )}

                                    {element.type === 'newsletter' && (
                                      <div className="space-y-3">
                                        <p className="text-gray-600 dark:text-white/70">Receba nossas novidades</p>
                                        <div className="flex gap-2">
                                          <input
                                            type="email"
                                            placeholder="Seu e-mail"
                                            className="flex-1 px-3 py-2 rounded-lg bg-black text-white placeholder-white/50 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                                          />
                                          <button className="px-4 py-2 rounded-lg bg-white text-black">
                                            <Mail className="w-4 h-4" />
                                          </button>
                                        </div>
                                      </div>
                                    )}

                                    {element.type === 'custom' && (
                                      <div
                                        className="prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: element.content }}
                                      />
                                    )}
                                  </div>
                                ))}
                            </div>
                          ))}
                      </div>

                      <div className={`mt-12 pt-8 ${settings.borderTop ? 'border-t border-white/10' : ''}`}>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                          {settings.copyright.enabled && (
                            <div
                              className={`${
                                settings.copyright.alignment === 'center'
                                  ? 'text-center'
                                  : settings.copyright.alignment === 'right'
                                  ? 'text-right'
                                  : 'text-left'
                              } text-sm text-white/70`}
                            >
                              {settings.copyright.text}
                            </div>
                          )}

                          {settings.socialLinks.enabled && (
                            <div className="flex items-center gap-3">
                              {settings.socialLinks.links.map((s, i: number) => (
                                <div
                                  key={i}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-white"
                                >
                                  {s.icon === 'Facebook' ? (
                                    <Facebook className="w-4 h-4" />
                                  ) : s.icon === 'Twitter' ? (
                                    <Twitter className="w-4 h-4" />
                                  ) : s.icon === 'Instagram' ? (
                                    <Instagram className="w-4 h-4" />
                                  ) : (
                                    <Youtube className="w-4 h-4" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Colunas do Rodapé"
                description={`Gerencie colunas e elementos (${settings.columns.length} colunas)`}
                icon={Grid3X3}
                sectionKey="columns"
                actions={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      addColumn()
                    }}
                    className="p-2 bg-white text-black rounded-lg hover:bg-white/90 transition"
                    aria-label="Adicionar coluna"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                }
              >
                <div className="space-y-6">
                  {settings.columns
                    .slice()
                    .sort((a: FooterColumn, b: FooterColumn) => a.order - b.order)
                    .map((column: FooterColumn) => (
                      <FooterColumnComponent
                        key={column.id}
                        column={column}
                        onUpdate={(updates: Partial<FooterColumn>) => updateColumn(column.id, updates)}
                        onDelete={() => deleteColumn(column.id)}
                        onMove={(direction: 'left' | 'right') => moveColumn(column.id, direction)}
                        onAddElement={(type: string) => addElement(type, column.id)}
                        onEditElement={(element: FooterElement) => editElement(element)}
                        onDeleteElement={(elementId: string) => deleteElement(elementId, column.id)}
                        elementTypes={elementTypes}
                        canMoveLeft={column.order > 1}
                        canMoveRight={column.order < settings.columns.length}
                      />
                    ))}
                </div>
              </SectionCard>

              <SectionCard
                title="Copyright e Redes Sociais"
                description="Ajuste o texto e os links exibidos no rodapé"
                icon={Sparkles}
                sectionKey="footer-bottom"
              >
                <div className="space-y-6">
                  <div className="rounded-2xl p-6 bg-white/5 ring-1 ring-white/10">
                    <h4 className="text-lg font-medium mb-4">Copyright</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          id="copyright-enabled"
                          type="checkbox"
                          checked={settings.copyright.enabled}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              copyright: { ...prev.copyright, enabled: e.target.checked }
                            }))
                          }
                          className="rounded"
                        />
                        <label htmlFor="copyright-enabled" className="text-sm font-medium">
                          Exibir texto de copyright
                        </label>
                      </div>

                      {settings.copyright.enabled && (
                        <>
                          <div className="space-y-2">
                            <label htmlFor="copyright-text" className="block text-sm font-medium text-white/80">
                              Texto
                            </label>
                            <input
                              id="copyright-text"
                              type="text"
                              value={settings.copyright.text}
                              onChange={(e) =>
                                setSettings((prev) => ({
                                  ...prev,
                                  copyright: { ...prev.copyright, text: e.target.value }
                                }))
                              }
                              className="w-full px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none"
                              placeholder="© 2024 Sua Empresa. Todos os direitos reservados."
                            />
                          </div>

                          <div className="space-y-2">
                            <span className="block text-sm font-medium text-white/80">Alinhamento</span>
                            <div className="flex gap-2" role="group" aria-label="Alinhamento do copyright">
                              {(['left', 'center', 'right'] as const).map((alignment) => {
                                const Icon = getAlignmentIcon(alignment)
                                const active = settings.copyright.alignment === alignment
                                return (
                                  <button
                                    key={alignment}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSettings((prev) => ({
                                        ...prev,
                                        copyright: { ...prev.copyright, alignment }
                                      }))
                                    }}
                                    className={`p-2 rounded-lg transition-colors ${
                                      active ? 'bg-white text-black' : 'bg-white/10 text-white hover:bg-white/15'
                                    }`}
                                  >
                                    <Icon className="w-4 h-4" />
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl p-6 bg-white/5 ring-1 ring-white/10">
                    <h4 className="text-lg font-medium mb-4">Redes Sociais</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <input
                          id="social-enabled"
                          type="checkbox"
                          checked={settings.socialLinks.enabled}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              socialLinks: { ...prev.socialLinks, enabled: e.target.checked }
                            }))
                          }
                          className="rounded"
                        />
                        <label htmlFor="social-enabled" className="text-sm font-medium">
                          Exibir links das redes sociais
                        </label>
                      </div>

                      {settings.socialLinks.enabled && (
                        <div className="space-y-3">
                          {settings.socialLinks.links.map((social, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 ring-1 ring-white/10">
                              <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm font-medium w-24">{social.platform}:</span>
                                <input
                                  type="url"
                                  value={social.url}
                                  onChange={(e) => {
                                    const newLinks = [...settings.socialLinks.links]
                                    newLinks[idx] = { ...social, url: e.target.value }
                                    setSettings((prev) => ({
                                      ...prev,
                                      socialLinks: { ...prev.socialLinks, links: newLinks }
                                    }))
                                  }}
                                  className="flex-1 px-3 py-2 rounded-lg bg-black text-white placeholder-white/40 ring-1 ring-white/10 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                                  placeholder={`URL do ${social.platform}`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSettings((prev) => ({
                                    ...prev,
                                    socialLinks: {
                                      ...prev.socialLinks,
                                      links: prev.socialLinks.links.filter((_, i: number) => i !== idx)
                                    }
                                  }))
                                }}
                                className="p-2 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-500/10 transition"
                                title="Remover"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          </main>
        </div>

        <FooterElementModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedElement(null)
            setSelectedColumn('')
          }}
          element={selectedElement as FooterElement | null}
          columnId={selectedColumn}
          onSave={saveElement}
        />
      </div>
    </DragDropProvider>
  )
}

export default AdminFooterSettings
