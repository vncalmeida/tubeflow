import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../config';

function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [messageTemplate, setMessageTemplate] = useState('');
  const [autoNotify, setAutoNotify] = useState(false);
  const [companyId, setCompanyId] = useState('');

  useEffect(() => {
    const storedCompanyId = localStorage.getItem('companyId');
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!companyId) return;
      try {
        const response = await fetch(`${API_URL}/api/settings?companyId=${companyId}`);
        if (!response.ok) throw new Error('Erro ao carregar configurações.');
        const data = await response.json();
        setApiKey(data.api_key || '');
        setSenderPhone(data.sender_phone || '');
        setMessageTemplate(data.message_template?.replace(/\\n/g, '\n') || 'Olá, {name}! Um novo vídeo foi atribuído a você: {titulo}');
        setAutoNotify(data.auto_notify || false);
      } catch {
        toast.error('Erro ao carregar configurações.', { position: 'top-right' });
      }
    };
    fetchSettings();
  }, [companyId]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          apiKey,
          senderPhone,
          messageTemplate: messageTemplate.replace(/\n/g, '\\n'),
          autoNotify
        })
      });
      if (!response.ok) throw new Error('Erro ao salvar configurações.');
      toast.success('Configurações salvas com sucesso!', { position: 'top-right' });
    } catch {
      toast.error('Erro ao salvar configurações.', { position: 'top-right' });
    }
  };

  return (
    <Layout>
      <PageHeader title="Configurações" description="Gerencie as configurações do sistema" />
      <ToastContainer />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl">
          <form onSubmit={handleSaveSettings}>
            <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-white/10">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-white">
                  API Key do WhatsGW
                </label>
                <input
                  type="text"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Digite sua API Key"
                />
                <p className="mt-2 text-sm text-gray-600 dark:text-white/70">
                  Para obter sua API Key, acesse{' '}
                  <a
                    href="https://app.whatsgw.com.br/w_desenvolvedor.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    este link
                  </a>
                  .
                </p>
              </div>
              <div className="p-6 border-b border-gray-100 dark:border-white/10">
                <label htmlFor="senderPhone" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Número do Remetente (WhatsApp)
                </label>
                <input
                  type="text"
                  id="senderPhone"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Digite o número do remetente"
                />
              </div>
              <div className="p-6 border-b border-gray-100 dark:border-white/10">
                <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 dark:text-white">
                  Modelo de Mensagem (WhatsApp)
                </label>
                <textarea
                  id="messageTemplate"
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={4}
                  placeholder="Use {name} para o nome do freelancer e {titulo} para o título do vídeo"
                />
                <p className="mt-1 text-sm text-gray-600 dark:text-white/70">
                  Utilize <span className="text-red-600 dark:text-red-400">{'{name}'}</span> para o nome do freelancer e <span className="text-red-600 dark:text-red-400">{'{titulo}'}</span> para o título do vídeo.
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600 dark:text-white" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 dark:text-white">Notificações Automáticas</h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-white/70">Ative para enviar mensagens automáticas aos freelancers</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoNotify(!autoNotify)}
                    className={`relative inline-flex h-6 w-11 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out ${autoNotify ? 'bg-red-600 border-red-600' : 'bg-gray-200 border-gray-200 dark:bg-white/10 dark:border-white/10'}`}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow transition duration-200 ease-in-out ${autoNotify ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Salvar Configurações
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default Settings;
