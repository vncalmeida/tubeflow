import React, { useEffect, useState } from 'react';
import { Building2, Youtube, Users, Play, ArrowRight, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useSidebar } from '../context/SidebarContext';
import { API_URL } from '../config';
import extractYouTubeId from '../utils/extractYouTubeId';

interface HeroSettings {
  badge: {
    text: string;
    icon: string;
  };
  title: {
    main: string;
    highlight: string;
  };
  description: string;
}

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
}

interface VideoSettings {
  title: string;
  description: string;
  thumbnail?: string;
  videoUrl?: string;
  enabled: boolean;
}

interface AdSettings {
  title: string;
  description: string;
  htmlContent: string;
  enabled: boolean;
}

interface CTASettings {
  title: string;
  description: string;
  buttonText: string;
  buttonIcon: string;
  enabled: boolean;
}

interface WelcomeConfig {
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
    { id: '1', title: 'Organizations', description: 'Crie ou participe de organizações para gerenciar seus projetos de criação de conteúdo.', icon: 'Building2', order: 1 },
    { id: '2', title: 'Channels', description: 'Configure canais para organizar seu conteúdo. Cada canal pode conter múltiplos vídeos.', icon: 'Youtube', order: 2 },
    { id: '3', title: 'Freelancers', description: 'Gerencie seus membros freelancers, atribua tarefas e acompanhe o progresso.', icon: 'Users', order: 3 }
  ],
  video: { title: 'Tutorial: Primeiros Passos', description: 'Aprenda a usar a plataforma em 5 minutos', enabled: true },
  ad: {
    title: 'Espaço para Anúncios',
    description: 'Conteúdo HTML personalizado será exibido aqui',
    htmlContent: `<div style="text-align: center; color: #6b7280; font-size: 14px;">
        <div style="background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
          <strong>Anúncio Exemplo</strong>
        </div>
        <p style="margin: 0; font-size: 12px;">Substitua este conteúdo pelo seu HTML de anúncio</p>
      </div>`,
    enabled: true
  },
  cta: { title: 'Pronto para começar?', description: 'Explore o dashboard para ver todas as funcionalidades disponíveis.', buttonText: 'Explorar Dashboard', buttonIcon: 'Play', enabled: true }
};

const iconMap: Record<string, React.ElementType> = { Sparkles, Building2, Youtube, Users, Play, ArrowRight };

const Welcome: React.FC = () => {
  const { isSidebarOpen } = useSidebar();
  const [config, setConfig] = useState<WelcomeConfig>(defaultConfig);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_URL}/api/welcome-settings`);
        if (response.ok) {
          const raw = await response.json();
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (data && Object.keys(data).length > 0) {
            setConfig(prev => ({ ...prev, ...data }));
          }
        } else {
          setConfig(defaultConfig);
        }
      } catch {
        setConfig(defaultConfig);
      }
    };
    fetchConfig();
  }, []);

  const BadgeIcon = iconMap[config.hero.badge.icon] || Sparkles;
  const youtubeId = extractYouTubeId(config.video.videoUrl || '');
  const thumbnail = config.video.thumbnail ?? (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : undefined);

  return (
    <div className="min-h-screen bg-white dark:bg-black dark:text-white">
      <Sidebar />
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <main className="flex-1 p-6 lg:p-12 pt-20">
          <div className="text-center mb-16 max-w-4xl mx-auto">
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
                <p className="text-gray-500 dark:text-white/60 ml-12">Descubra como nossa plataforma pode transformar sua produção de conteúdo</p>
              </div>
              <div className="p-8 lg:p-12">
                <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                  <div className="lg:col-span-2 space-y-8">
                    {(config.features || []).map((feature, index) => {
                      const FeatureIcon = iconMap[feature.icon] || Sparkles;
                      const fallback = defaultConfig.features[index];
                      return (
                        <div key={feature.id || index} className="group p-6 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all duration-300 border border-transparent dark:border-white/10">
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
                      );
                    })}
                  </div>
                  <div className="lg:col-span-1 space-y-8">
                    {config.video?.enabled && (
                      <div className="sticky top-4">
                        <div className={`bg-gray-100 dark:bg-white/5 rounded-2xl overflow-hidden aspect-video relative ${isPlaying ? '' : 'group cursor-pointer'}`} onClick={() => !isPlaying && setIsPlaying(true)}>
                          {isPlaying && youtubeId ? (
                            <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                          ) : (
                            <>
                              {thumbnail ? <img src={thumbnail} alt={config.video.title || defaultConfig.video.title} className="w-full h-full object-cover" /> : <div className="absolute inset-0" />}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 bg-white/90 dark:bg-black/90 rounded-full flex items-center justify-center ring-2 ring-red-500 group-hover:scale-110 transition-transform duration-300">
                                  <Play className="w-5 h-5 text-red-600 dark:text-red-400 ml-0.5" />
                                </div>
                              </div>
                              <div className="absolute bottom-4 left-4 right-4">
                                <div className="bg-white/90 dark:bg-black/90 backdrop-blur-sm rounded-xl p-3 border dark:border-white/10">
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
                          <div className="mt-4 p-4 bg-white dark:bg-black rounded-xl border border-gray-200 dark:border-white/10" dangerouslySetInnerHTML={{ __html: config.ad.htmlContent || defaultConfig.ad.htmlContent }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
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
        </main>
      </div>
    </div>
  );
};

export default Welcome;
