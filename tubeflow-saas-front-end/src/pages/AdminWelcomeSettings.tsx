import React, { useState, useEffect } from 'react'
import {
  Home, Edit3, Plus, Save, Eye, Video, Image, Settings, ChevronDown, ChevronUp,
  Trash2, Sparkles, Play, Building2, Youtube, Users, Sun, Moon, ArrowRight, Menu
} from 'lucide-react'
import AdminSidebar from '../components/AdminSidebar'
import ModalHeroSettings from '../components/ModalHeroSettings'
import ModalFeatureCard from '../components/ModalFeatureCard'
import ModalVideoSettings from '../components/ModalVideoSettings'
import ModalAdSettings from '../components/ModalAdSettings'
import ModalCTASettings from '../components/ModalCTASettings'
import { useSidebar } from '../context/SidebarContext'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { API_URL } from '../config'
import extractYouTubeId from '../utils/extractYouTubeId'

type HeroSettings = {
  badge: { text: string; icon: string }
  title: { main: string; highlight: string }
  description: string
}

type FeatureCard = {
  id: string
  title: string
  description: string
  icon: string
  order: number
}

type VideoSettings = {
  videoUrl?: string
  title: string
  description: string
  thumbnail?: string
  enabled: boolean
}

type AdSettings = {
  title: string
  description: string
  htmlContent: string
  enabled: boolean
}

type CTASettings = {
  title: string
  description: string
  buttonText: string
  buttonIcon: string
  enabled: boolean
}

type WelcomeConfig = {
  hero: HeroSettings;
  features: FeatureCard[];
  video: VideoSettings;
  ad: AdSettings;
  cta: CTASettings;
}

const defaultConfig: WelcomeConfig = {
  hero: {
    badge: { text: 'Bem-vindo à Nossa Plataforma', icon: 'Sparkles' },
    title: { main: 'Sua solução completa para', highlight: 'gerenciar criação de conteúdo' },
    description: 'Gerencie projetos, colabore com freelancers e organize seus canais de conteúdo de forma eficiente e profissional.'
  },
  features: [
    { id: '1', title: 'Organizações', description: 'Crie ou participe de organizações para centralizar seus projetos de criação de conteúdo.', icon: 'Building2', order: 1 },
    { id: '2', title: 'Canais', description: 'Configure canais para organizar seus conteúdos — cada canal pode conter múltiplos vídeos.', icon: 'Youtube', order: 2 },
    { id: '3', title: 'Freelancers', description: 'Gerencie seus colaboradores externos, distribua tarefas e acompanhe o progresso.', icon: 'Users', order: 3 }
  ],
  video: { title: 'Tutorial: Primeiros Passos', description: 'Aprenda a usar a plataforma em 5 minutos', enabled: true },
  ad: {
    title: 'Espaço para Anúncios',
    description: 'Conteúdo HTML personalizado será exibido aqui',
    htmlContent: `<div style="text-align: center; color: #6b7280; font-size: 14px;">
      <div style="background: linear-gradient(135deg, #3b82f6, #06b6d4); color: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
        <strong>Anúncio Exemplo</strong>
      </div>
      <p style="margin: 0; font-size: 12px;">Substitua este conteúdo pelo seu HTML de anúncio</p>
    </div>`,
    enabled: true
  },
  cta: {
    title: 'Pronto para começar?',
    description: 'Explore o dashboard e descubra todas as ferramentas disponíveis',
    buttonText: 'Explorar Dashboard',
    buttonIcon: 'Play',
    enabled: true
  }
}

const iconMap: Record<string, React.ElementType> = { Sparkles, Building2, Youtube, Users, Play, ArrowRight }

const AdminWelcomeSettings: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar()
  const [config, setConfig] = useState<WelcomeConfig>(defaultConfig)
  const [expandedSections, setExpandedSections] = useState<string[]>(['hero', 'features', 'video', 'ad', 'cta', 'preview'])
  const [modals, setModals] = useState({ hero: false, feature: false, video: false, ad: false, cta: false })
  const [selectedFeature, setSelectedFeature] = useState<FeatureCard | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [previewDark, setPreviewDark] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/welcome-settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        })
        if (response.ok) {
          const raw = await response.json()
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw
          if (data && Object.keys(data).length > 0) {
            setConfig(prev => ({
              ...prev,
              ...data,
              hero: { ...prev.hero, ...(data.hero || {}) },
              video: { ...prev.video, ...(data.video || {}) },
              ad: { ...prev.ad, ...(data.ad || {}) },
              cta: { ...prev.cta, ...(data.cta || {}) },
              features: Array.isArray(data.features) && data.features.length > 0 ? data.features : prev.features
            }))
          }
        }
      } catch (e) {
        console.error(e)
        toast.error('Não foi possível carregar as configurações.')
      }
    }
    fetchConfig()
  }, [])

  const saveAll = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/admin/welcome-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify(config)
      })
      if (!response.ok) throw new Error('Falha ao salvar')
      toast.success('Configurações salvas com sucesso!')
    } catch (e) {
      console.error(e)
      toast.error('Erro ao salvar as configurações.')
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (key: keyof typeof modals, feature?: FeatureCard) => {
    if (key === 'feature' && feature) setSelectedFeature(feature)
    setModals(prev => ({ ...prev, [key]: true }))
  }

  const closeModal = (key: keyof typeof modals) => {
    setSelectedFeature(null)
    setModals(prev => ({ ...prev, [key]: false }))
  }

  const toggleSection = (key: string) => {
    setExpandedSections(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const SectionCard = ({
    title, description, icon: Icon, sectionKey, children, actions
  }: {
    title: string
    description: string
    icon: React.ElementType
    sectionKey: string
    children: React.ReactNode
    actions?: React.ReactNode
  }) => {
    const isExpanded = expandedSections.includes(sectionKey)
    const headingId = `${sectionKey}-heading`
    return (
      <section role="region" aria-labelledby={headingId} className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/5 ring-1 ring-white/10">
                <Icon className="w-5 h-5 text-white/80" />
              </div>
              <div>
                <h2 id={headingId} className="text-lg font-semibold">{title}</h2>
                <p className="text-sm text-white/60">{description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <button
                aria-label={isExpanded ? 'Recolher seção' : 'Expandir seção'}
                onClick={(e) => { e.stopPropagation(); toggleSection(sectionKey) }}
                aria-expanded={isExpanded}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isExpanded ? <ChevronUp className="w-5 h-5 text-white/70" /> : <ChevronDown className="w-5 h-5 text-white/70" />}
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

  const BadgeIcon = iconMap[config.hero.badge.icon] || Sparkles
  const youtubeId = extractYouTubeId(config.video.videoUrl || '')
  const thumbnail =
    config.video.thumbnail ?? (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined)

  return (
    <div className="min-h-screen bg-black text-white">
      <ToastContainer theme="dark" />
      <AdminSidebar />

      {/* Topbar */}
      <div className={`fixed top-0 left-0 right-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-black/50 bg-black/60 border-b border-white/10 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={toggleSidebar} className="p-2 rounded-lg hover:bg-white/10">
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm text-white/60">Admin /</div>
            <div className="text-sm">Welcome Settings</div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className={`pt-16 ${isSidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

          {/* HERO */}
          <SectionCard
            title="Hero"
            description="Título, destaque, descrição e badge"
            icon={Home}
            sectionKey="hero"
            actions={
              <button
                onClick={() => openModal('hero')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            }
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm text-white/60 mb-2">Badge</div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full text-white/80">
                  <BadgeIcon className="w-4 h-4" />
                  {config.hero.badge.text}
                </div>
              </div>
              <div>
                <div className="text-sm text-white/60 mb-2">Título</div>
                <div className="text-white/90">
                  {config.hero.title.main} <span className="text-white/70">{config.hero.title.highlight}</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-white/60 mb-2">Descrição</div>
                <div className="text-white/70">{config.hero.description}</div>
              </div>
            </div>
          </SectionCard>

          {/* FEATURES */}
          <SectionCard
            title="Cards de Recursos"
            description="Gerencie os cards de destaque"
            icon={Settings}
            sectionKey="features"
            actions={
              <button
                onClick={() => openModal('feature')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
              >
                <Plus className="w-4 h-4" /> Novo Card
              </button>
            }
          >
            <div className="space-y-3">
              {config.features.map((f) => {
                const Icon = iconMap[f.icon] || Sparkles
                return (
                  <div key={f.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 ring-1 ring-white/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-white/5 ring-1 ring-white/10">
                        <Icon className="w-4 h-4 text-white/80" />
                      </div>
                      <div>
                        <div className="font-medium">{f.title}</div>
                        <div className="text-sm text-white/60">{f.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal('feature', f)} className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, features: prev.features.filter(x => x.id !== f.id) }))}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          {/* VÍDEO */}
          <SectionCard
            title="Vídeo"
            description="Configurações do vídeo de destaque"
            icon={Video}
            sectionKey="video"
            actions={
              <button
                onClick={() => openModal('video')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            }
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-white/60">Título</div>
                <div>{config.video.title}</div>
                <div className="text-sm text-white/60">Descrição</div>
                <div className="text-white/70">{config.video.description}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-white/60">URL do Vídeo</div>
                <div className="text-white/70 break-all">{config.video.videoUrl || '—'}</div>
                <div className="text-sm text-white/60">Thumbnail</div>
                <div className="text-white/70 break-all">{config.video.thumbnail || '—'}</div>
              </div>
            </div>
          </SectionCard>

          {/* ANÚNCIO */}
          <SectionCard
            title="Anúncio (HTML)"
            description="Conteúdo patrocinado ou informativo"
            icon={Image}
            sectionKey="ad"
            actions={
              <button
                onClick={() => openModal('ad')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            }
          >
            <div className="space-y-2">
              <div className="text-sm text-white/60">Título</div>
              <div>{config.ad.title}</div>
              <div className="text-sm text-white/60">Descrição</div>
              <div className="text-white/70">{config.ad.description}</div>
              <div className="text-sm text-white/60">HTML</div>
              <pre className="text-xs bg-white/5 ring-1 ring-white/10 p-3 rounded-lg overflow-auto">
                {config.ad.htmlContent}
              </pre>
            </div>
          </SectionCard>

          {/* CTA */}
          <SectionCard
            title="Call to Action"
            description="Bloco final de chamada"
            icon={Settings}
            sectionKey="cta"
            actions={
              <button
                onClick={() => openModal('cta')}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15"
              >
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            }
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="text-sm text-white/60">Título</div>
                <div>{config.cta.title}</div>
                <div className="text-sm text-white/60">Descrição</div>
                <div className="text-white/70">{config.cta.description}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-white/60">Botão</div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 ring-1 ring-white/10 rounded-lg">
                  {React.createElement(iconMap[config.cta.buttonIcon] || Play, { className: 'w-4 h-4' })}
                  <span>{config.cta.buttonText}</span>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* PREVIEW */}
          <SectionCard
            title="Pré-visualização"
            description="Veja a página em modo claro e escuro"
            icon={Eye}
            sectionKey="preview"
            actions={
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreviewDark(false) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${!previewDark ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                >
                  <Sun className="w-4 h-4" /> Claro
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setPreviewDark(true) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${previewDark ? 'bg-white text-black' : 'bg-white/10 text-white'}`}
                >
                  <Moon className="w-4 h-4" /> Escuro
                </button>
              </div>
            }
          >
            {/* *** PREVIEW CORRIGIDO PARA CLARO/ESCURO *** */}
            <div className={`${previewDark ? 'dark' : ''}`}>
              <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                <div className="text-center mb-16 max-w-4xl mx-auto pt-12">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 rounded-full text-red-600 dark:text-red-300 text-sm mb-8">
                    <BadgeIcon className="w-4 h-4" />
                    {config.hero.badge.text || defaultConfig.hero.badge.text}
                  </div>

                  <h1 className="text-5xl lg:text-6xl font-light text-gray-900 dark:text-white mb-6 leading-tight">
                    {config.hero.title?.main || defaultConfig.hero.title.main}
                    <span className="block font-semibold text-red-700 dark:text-red-400">
                      {config.hero.title?.highlight || defaultConfig.hero.title.highlight}
                    </span>
                  </h1>

                  <p className="text-xl text-gray-500 dark:text-white/60 max-w-2xl mx-auto font-light">
                    {config.hero.description || defaultConfig.hero.description}
                  </p>
                </div>

                <div className="max-w-7xl mx-auto">
                  <div className="bg-white dark:bg-black rounded-3xl border border-gray-100 dark:border-white/10 overflow-hidden">
                    <div className="p-8 lg:p-12 border-b border-gray-100 dark:border-white/10">
                      <div className="flex items-center gap-4 mb-2">
                        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                          <Play className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="text-2xl font-light text-gray-900 dark:text-white">Como Funciona</h2>
                      </div>
                      <p className="text-gray-500 dark:text-white/60 ml-12">
                        Descubra como nossa plataforma pode transformar sua produção de conteúdo
                      </p>
                    </div>

                    <div className="p-8 lg:p-12">
                      <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* FEATURES */}
                        <div className="lg:col-span-2 space-y-8">
                          {(config.features || []).map((feature, index) => {
                            const FeatureIcon = iconMap[feature.icon] || Sparkles
                            const fallback = defaultConfig.features[index]
                            return (
                              <div
                                key={feature.id || index}
                                className="group p-6 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all duration-300 border border-transparent dark:border-white/10"
                              >
                                <div className="flex items-start gap-4">
                                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                    <FeatureIcon className="w-5 h-5 text-red-600 dark:text-red-300" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                      {feature.title || fallback?.title}
                                      <ArrowRight className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-all duration-300" />
                                    </h3>
                                    <p className="text-gray-500 dark:text-white/60 leading-relaxed font-light">
                                      {feature.description || fallback?.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>

                        {/* VIDEO */}
                        <div className="lg:col-span-1 space-y-8">
                          {config.video?.enabled && (
                            <div className="sticky top-4">
                              <div
                                className={`bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden aspect-video relative ${isPlaying ? '' : 'group cursor-pointer'}`}
                                onClick={() => !isPlaying && setIsPlaying(true)}
                              >
                                {isPlaying && youtubeId ? (
                                  <iframe
                                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                ) : (
                                  <>
                                    {thumbnail ? (
                                      <img
                                        src={thumbnail}
                                        alt={config.video.title || defaultConfig.video.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="absolute inset-0" />
                                    )}

                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="w-12 h-12 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center ring-2 ring-red-500 group-hover:scale-110 transition-transform duration-300">
                                        <Play className="w-5 h-5 text-red-600 dark:text-red-400 ml-0.5" />
                                      </div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4">
                                      <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl p-3 border border-gray-200 dark:border-white/10">
                                        <h4 className="text-gray-900 dark:text-white font-medium text-sm mb-1">
                                          {config.video.title || defaultConfig.video.title}
                                        </h4>
                                        <p className="text-gray-500 dark:text-white/60 text-xs">
                                          {config.video.description || defaultConfig.video.description}
                                        </p>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ADS */}
                          {config.ad?.enabled && (
                            <div className="bg-gray-50 dark:bg-black rounded-2xl p-6 border-2 border-dashed border-gray-200 dark:border-white/10">
                              <div className="text-center">
                                <div className="w-8 h-8 bg-red-50 dark:bg-red-900/20 rounded-lg mx-auto mb-3 flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-red-600 dark:text-red-300" />
                                </div>
                                <h4 className="text-sm font-medium text-gray-600 dark:text-white mb-2">
                                  {config.ad.title || defaultConfig.ad.title}
                                </h4>
                                <p className="text-xs text-gray-400 dark:text-white/60">
                                  {config.ad.description || defaultConfig.ad.description}
                                </p>
                                <div
                                  className="mt-4 p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10"
                                  dangerouslySetInnerHTML={{ __html: config.ad.htmlContent || defaultConfig.ad.htmlContent }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* CTA */}
                      {config.cta?.enabled && (
                        <div className="mt-16 text-center">
                          <h3 className="text-2xl font-light text-gray-900 dark:text-white mb-4">
                            {config.cta.title || defaultConfig.cta.title}
                          </h3>
                          <p className="text-gray-500 dark:text-white/60 mb-8 max-w-2xl mx-auto font-light">
                            {config.cta.description || defaultConfig.cta.description}
                          </p>
                          <button className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700">
                            {React.createElement(iconMap[config.cta.buttonIcon] || Play, { className: 'w-4 h-4' })}
                            {config.cta.buttonText || defaultConfig.cta.buttonText}
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* AÇÕES */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={saveAll}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-100 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>

      {/* Modais */}
      <ModalHeroSettings
        isOpen={modals.hero}
        onClose={() => closeModal('hero')}
        heroSettings={config.hero}
        onSave={(heroSettings) => setConfig(prev => ({ ...prev, hero: heroSettings }))}
      />
      <ModalFeatureCard
        isOpen={modals.feature}
        onClose={() => closeModal('feature')}
        feature={selectedFeature}
        onSave={(feature) => {
          if (!feature) return
          setConfig(prev => {
            const exists = prev.features.some(f => f.id === feature.id)
            const features = exists
              ? prev.features.map(f => f.id === feature.id ? feature : f)
              : [...prev.features, feature]
            return { ...prev, features }
          })
        }}
      />
      <ModalVideoSettings
        isOpen={modals.video}
        onClose={() => closeModal('video')}
        videoSettings={config.video}
        onSave={(videoSettings) => setConfig(prev => ({ ...prev, video: videoSettings }))}
      />
      <ModalAdSettings
        isOpen={modals.ad}
        onClose={() => closeModal('ad')}
        adSettings={config.ad}
        onSave={adSettings => setConfig(prev => ({ ...prev, ad: adSettings }))}
      />
      <ModalCTASettings
        isOpen={modals.cta}
        onClose={() => closeModal('cta')}
        ctaSettings={config.cta}
        onSave={(ctaSettings) => setConfig(prev => ({ ...prev, cta: ctaSettings }))}
      />
    </div>
  )
}

export default AdminWelcomeSettings
