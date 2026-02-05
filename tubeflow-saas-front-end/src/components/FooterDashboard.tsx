import React, { useEffect, useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Youtube, Globe, ExternalLink } from 'lucide-react';
import { API_URL } from '../config';

interface FooterElement {
  id: string;
  type: 'text' | 'links' | 'social' | 'contact' | 'logo' | 'newsletter' | 'custom';
  title?: string;
  content: any;
  style: {
    alignment: 'left' | 'center' | 'right';
    textColor: string;
    fontSize: 'sm' | 'base' | 'lg' | 'xl';
    fontWeight: 'normal' | 'medium' | 'semibold' | 'bold';
    spacing: 'tight' | 'normal' | 'loose';
  };
  order: number;
  columnId: string;
}

interface FooterColumn {
  id: string;
  title?: string;
  width: 'sm' | 'md' | 'lg' | 'full';
  elements: FooterElement[];
  order: number;
}

interface FooterSettings {
  enabled: boolean;
  backgroundColor: string;
  textColor: string;
  borderTop: boolean;
  borderColor: string;
  padding: 'sm' | 'md' | 'lg';
  columns: FooterColumn[];
  copyright: {
    enabled: boolean;
    text: string;
    alignment: 'left' | 'center' | 'right';
  };
  socialLinks: {
    enabled: boolean;
    links: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
  };
}

const FooterDashboard: React.FC = () => {
  const { isSidebarOpen } = useSidebar();
  const [footerSettings, setFooterSettings] = useState<FooterSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/admin/footer-settings`, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
        if (response.ok) {
          const raw = await response.json();
          const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
          setFooterSettings(data);
        } else {
          setFooterSettings({
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
            copyright: {
              enabled: true,
              text: '© 2024 Sua Empresa. Todos os direitos reservados.',
              alignment: 'center'
            },
            socialLinks: {
              enabled: true,
              links: [
                { platform: 'Facebook', url: 'https://facebook.com', icon: 'Facebook' },
                { platform: 'Twitter', url: 'https://twitter.com', icon: 'Twitter' },
                { platform: 'Instagram', url: 'https://instagram.com', icon: 'Instagram' },
                { platform: 'YouTube', url: 'https://youtube.com', icon: 'Youtube' }
              ]
            }
          });
        }
      } catch {
        setFooterSettings(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFooterSettings();
  }, []);

  const getSocialIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      Facebook: <Facebook className="w-5 h-5" />,
      Twitter: <Twitter className="w-5 h-5" />,
      Instagram: <Instagram className="w-5 h-5" />,
      Linkedin: <Linkedin className="w-5 h-5" />,
      Youtube: <Youtube className="w-5 h-5" />,
      Globe: <Globe className="w-5 h-5" />
    };
    return iconMap[iconName] || <Globe className="w-5 h-5" />;
  };

  const getColumnWidthClass = (width: string, totalColumns: number) => {
    if (totalColumns === 1) return 'col-span-full';
    if (totalColumns === 2) return 'col-span-1';
    if (totalColumns === 3) return 'col-span-1';
    switch (width) {
      case 'sm':
        return 'col-span-1';
      case 'md':
        return 'col-span-1 md:col-span-1';
      case 'lg':
        return 'col-span-1 md:col-span-2';
      case 'full':
        return 'col-span-full';
      default:
        return 'col-span-1';
    }
  };

  const getGridClass = (columnCount: number) => {
    switch (columnCount) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2';
      case 3:
        return 'grid-cols-1 md:grid-cols-3';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
    }
  };

  const getPaddingClass = (padding: string) => {
    switch (padding) {
      case 'sm':
        return 'py-8';
      case 'md':
        return 'py-12';
      case 'lg':
        return 'py-16';
      default:
        return 'py-12';
    }
  };

  const getAlignmentClass = (alignment: string) => {
    switch (alignment) {
      case 'left':
        return 'text-left';
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const renderElement = (element: FooterElement) => {
    const size = element.style.fontSize === 'xl' ? 'text-xl' : element.style.fontSize === 'lg' ? 'text-lg' : element.style.fontSize === 'base' ? 'text-base' : 'text-sm';
    const weight = element.style.fontWeight === 'bold' ? 'font-bold' : element.style.fontWeight === 'semibold' ? 'font-semibold' : element.style.fontWeight === 'medium' ? 'font-medium' : 'font-normal';
    const align = element.style.alignment === 'center' ? 'text-center' : element.style.alignment === 'right' ? 'text-right' : 'text-left';
    if (element.type === 'text') {
      return (
        <div key={element.id} className={`${size} ${weight} ${align} text-gray-600 dark:text-white/70`}>
          <p className="leading-relaxed">{element.content}</p>
        </div>
      );
    }
    if (element.type === 'links') {
      return (
        <div key={element.id} className={align}>
          <ul className="space-y-2">
            {element.content.map((link: any, idx: number) => (
              <li key={idx} className="group">
                <a href={link.url} className="transition-colors underline-offset-2 hover:underline text-gray-900 dark:text-white flex items-center gap-1">
                  {link.text}
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    if (element.type === 'contact') {
      return (
        <div key={element.id} className={`${align} text-gray-600 dark:text-white/70`}>
          <div className="space-y-3">
            {element.content.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href={`mailto:${element.content.email}`} className="transition-opacity hover:opacity-80">
                  {element.content.email}
                </a>
              </div>
            )}
            {element.content.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href={`tel:${element.content.phone}`} className="transition-opacity hover:opacity-80">
                  {element.content.phone}
                </a>
              </div>
            )}
            {element.content.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>{element.content.address}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    if (element.type === 'social') {
      return (
        <div key={element.id} className={`${align}`}>
          <div className="flex gap-3">
            {footerSettings?.socialLinks.enabled &&
              footerSettings.socialLinks.links.map((social, idx) => (
                <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20" title={social.platform}>
                  {getSocialIcon(social.icon)}
                </a>
              ))}
          </div>
        </div>
      );
    }
    if (element.type === 'logo') {
      return (
        <div key={element.id} className={`${align}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gray-900 text-white dark:bg-white dark:text-gray-900">
              <Youtube className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">{element.content || 'Logo'}</span>
          </div>
        </div>
      );
    }
    if (element.type === 'newsletter') {
      return (
        <div key={element.id} className={`${align}`}>
          <div className="space-y-3">
            <p className="text-gray-600 dark:text-white/70">Receba nossas novidades</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Seu e-mail" className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-900 dark:border-white/10 dark:text-white dark:placeholder-white/50" />
              <button className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200">
                <Mail className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    }
    if (element.type === 'custom') {
      return <div key={element.id} className={align} dangerouslySetInnerHTML={{ __html: element.content }} />;
    }
    return null;
  };

  if (isLoading) {
    return (
      <footer className={`transition-all duration-300 mt-auto ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
        <div className="bg-white dark:bg-black border-t border-gray-200 dark:border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-white/10 rounded w-3/4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 dark:bg-white/10 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg.white/10 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 dark:bg.white/10 rounded w-4/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  if (!footerSettings || !footerSettings.enabled) {
    return null;
  }

  return (
    <footer className={`transition-all duration-300 mt-auto ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'}`}>
      <div className="bg-white text-gray-900 dark:bg-black dark:text-white border-t border-gray-200 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={getPaddingClass(footerSettings.padding)}>
            <div className={`grid gap-8 ${getGridClass(footerSettings.columns.length)}`}>
              {footerSettings.columns.sort((a, b) => a.order - b.order).map(column => (
                <div key={column.id} className={getColumnWidthClass(column.width, footerSettings.columns.length)}>
                  {column.title && <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{column.title}</h3>}
                  <div className="space-y-4">
                    {column.elements.sort((a, b) => a.order - b.order).map(element => renderElement(element))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {(footerSettings.copyright.enabled || footerSettings.socialLinks.enabled) && (
            <div className={`py-6 ${footerSettings.borderTop ? 'border-t border-gray-200 dark:border-white/10' : ''}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {footerSettings.copyright.enabled && (
                  <div className={getAlignmentClass(footerSettings.copyright.alignment)}>
                    <p className="text-sm text-gray-600 dark:text-white/70">
                      {footerSettings.copyright.text}
                    </p>
                  </div>
                )}
                {footerSettings.socialLinks.enabled && footerSettings.socialLinks.links.length > 0 && (
                  <div className="flex items-center gap-4">
                    {footerSettings.socialLinks.links.map((social, idx) => (
                      <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20" title={social.platform}>
                        {getSocialIcon(social.icon)}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default FooterDashboard;
