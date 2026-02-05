import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock, Download, Filter, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { API_URL } from '../config';

interface LogEntry {
  id: string;
  videoId: string;
  videoTitle: string;
  channelName: string;
  freelancerName: string;
  previousStatus: string;
  newStatus: string;
  timestamp: string;
}

interface FreelancerStats {
  id: string;
  name: string;
  tasksCompleted: number;
  averageTime: number;
  delays: number;
  averageTimeFormatted?: string;
}

interface Channel {
  id: string;
  name: string;
}

interface Freelancer {
  id: string;
  name: string;
}

type SortKey = 'timestamp' | 'videoTitle' | 'channelName' | 'freelancerName' | 'previousStatus' | 'newStatus';

function LogsAndStats() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<FreelancerStats[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('timestamp');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const COLORS = ['#ef4444', '#f87171', '#dc2626', '#fb7185', '#b91c1c', '#991b1b', '#7f1d1d'];
  const companyId = localStorage.getItem('companyId') || '';

  useEffect(() => {
    fetchChannels();
    fetchFreelancers();
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [startDate, endDate, selectedChannel, selectedFreelancer, currentPage]);

  const formatTime = (timeInSeconds: number): string => {
    const t = Math.max(0, Math.floor(Number(timeInSeconds) || 0));
    const days = Math.floor(t / 86400);
    const hours = Math.floor((t % 86400) / 3600);
    const minutes = Math.floor((t % 3600) / 60);
    const seconds = Math.floor(t % 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch(`${API_URL}/api/channels2?companyId=${encodeURIComponent(companyId)}`);
      const json = await response.json();
      setChannels(Array.isArray(json.channels) ? json.channels : []);
    } catch {
      toast.error('Erro ao carregar canais');
    }
  };

  const fetchFreelancers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/freelancers3?companyId=${encodeURIComponent(companyId)}`);
      const json = await response.json();
      setFreelancers(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error('Erro ao carregar freelancers');
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const params = new URLSearchParams({
        companyId: encodeURIComponent(companyId),
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedChannel && { channelId: selectedChannel }),
        ...(selectedFreelancer && { freelancerId: selectedFreelancer })
      });
      const response = await fetch(`${API_URL}/api/logs2?${params}`);
      const data = await response.json();
      setLogs(Array.isArray(data.logs) ? data.logs : []);
      setTotalPages(Math.max(1, Math.ceil(Number(data.total || 0) / ITEMS_PER_PAGE)));
      setUpdatedAt(new Date().toISOString());
    } catch {
      toast.error('Erro ao carregar logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const params = new URLSearchParams({
        companyId: encodeURIComponent(companyId),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedChannel && { channelId: selectedChannel }),
        ...(selectedFreelancer && { freelancerId: selectedFreelancer })
      });
      const response = await fetch(`${API_URL}/api/stats?${params}`);
      const data = await response.json();
      const formattedStats = (Array.isArray(data.stats) ? data.stats : []).map((stat: FreelancerStats) => ({
        ...stat,
        tasksCompleted: Number(stat.tasksCompleted),
        averageTime: Number(stat.averageTime),
        delays: Number(stat.delays || 0),
        averageTimeFormatted: formatTime(Number(stat.averageTime))
      }));
      setStats(formattedStats);
    } catch {
      toast.error('Erro ao carregar estatísticas');
    } finally {
      setIsLoadingStats(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedChannel('');
    setSelectedFreelancer('');
    setCurrentPage(1);
    setSearch('');
    setIsFilterOpen(false);
  };

  const exportData = async (type: 'logs' | 'stats' | 'all') => {
    try {
      const params = new URLSearchParams({
        companyId: encodeURIComponent(companyId),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedChannel && { channelId: selectedChannel }),
        ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
        type
      });
      const response = await fetch(`${API_URL}/api/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${type}-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Dados exportados com sucesso!');
    } catch {
      toast.error('Erro ao exportar dados');
    }
  };

  const validStats = stats.filter((s) => s.tasksCompleted > 0);
  const overallAverage = validStats.length > 0 ? validStats.reduce((acc, curr) => acc + curr.averageTime, 0) / validStats.length : 0;
  const overallAverageFormatted = formatTime(overallAverage);

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  const changeSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? logs.filter(
          (l) =>
            l.videoTitle.toLowerCase().includes(q) ||
            l.channelName.toLowerCase().includes(q) ||
            l.freelancerName.toLowerCase().includes(q) ||
            l.previousStatus.toLowerCase().includes(q) ||
            l.newStatus.toLowerCase().includes(q)
        )
      : logs.slice();
    const dir = sortDir === 'asc' ? 1 : -1;
    const sorted = base.sort((a, b) => {
      if (sortKey === 'timestamp') return (new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) * dir;
      if (sortKey === 'videoTitle') return a.videoTitle.localeCompare(b.videoTitle) * dir;
      if (sortKey === 'channelName') return a.channelName.localeCompare(b.channelName) * dir;
      if (sortKey === 'freelancerName') return a.freelancerName.localeCompare(b.freelancerName) * dir;
      if (sortKey === 'previousStatus') return a.previousStatus.localeCompare(b.previousStatus) * dir;
      if (sortKey === 'newStatus') return a.newStatus.localeCompare(b.newStatus) * dir;
      return 0;
    });
    return sorted;
  }, [logs, search, sortKey, sortDir]);

  const totalFilteredPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filteredSorted.slice(start, end);
  }, [filteredSorted, currentPage, pageSize]);

  return (
    <Layout>
      <PageHeader title="Logs e Estatísticas" description="Acompanhe mudanças e desempenho" />
      <ToastContainer />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="md:hidden mb-4">
          <button onClick={toggleFilters} className="w-full flex items-center justify-center h-10 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40">
            <Filter className="w-5 h-5 mr-2" />
            {isFilterOpen ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
        <div className={`bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-4 mb-6 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div className="col-span-1 sm:col-span-2 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Data Inicial</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Data Final</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Canal</label>
              <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option value="">Todos os Canais</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Freelancer</label>
              <select value={selectedFreelancer} onChange={(e) => setSelectedFreelancer(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500">
                <option value="">Todos os Freelancers</option>
                {freelancers.map((freelancer) => (
                  <option key={freelancer.id} value={freelancer.id}>
                    {freelancer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-center">
              <button onClick={clearFilters} className="flex items-center justify-center h-10 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors w-full dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40">
                <Filter className="w-5 h-5 mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Total de Tarefas Finalizadas</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{('0' + stats.reduce((acc, curr) => acc + curr.tasksCompleted, 0)).slice(-2)}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-4 sm:p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Média de Tempo</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{overallAverageFormatted}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tarefas Concluídas por Freelancer</h2>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.filter((stat) => stat.tasksCompleted > 0)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="tasksCompleted" fill="#ef4444" name="Tarefas Concluídas" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Atrasos por Freelancer</h2>
            <div className="h-60 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.filter((s) => (s.delays || 0) > 0)} dataKey="delays" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, delays }) => `${name}: ${delays}`}>
                    {stats.filter((s) => (s.delays || 0) > 0).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 rounded-full bg-red-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Alterações</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="w-4 h-4 text-gray-400 dark:text-white/50" />
                </div>
                <input value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar por vídeo, canal, freelancer ou status" className="pl-9 h-10 w-72 max-w-[70vw] rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }} className="h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white">
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
              </select>
              <button onClick={() => exportData('logs')} className="flex items-center px-3 h-10 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40">
                <Download className="w-4 h-4 mr-2" />
                Exportar Logs
              </button>
              <button onClick={() => exportData('stats')} className="flex items-center px-3 h-10 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40">
                <Download className="w-4 h-4 mr-2" />
                Exportar Estatísticas
              </button>
              <button onClick={() => exportData('all')} className="flex items-center px-3 h-10 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40">
                <Download className="w-4 h-4 mr-2" />
                Exportar Tudo
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <tr>
                  <th onClick={() => changeSort('timestamp')} className="px-3 sm:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300 cursor-pointer select-none">Data/Hora {sortKey === 'timestamp' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('videoTitle')} className="px-3 sm:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300 cursor-pointer select-none">Vídeo {sortKey === 'videoTitle' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('channelName')} className="px-3 sm:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300 cursor-pointer select-none">Canal {sortKey === 'channelName' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('freelancerName')} className="px-3 sm:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300 cursor-pointer select-none">Freelancer {sortKey === 'freelancerName' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('previousStatus')} className="px-3 sm:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300 cursor-pointer select-none">Status Anterior {sortKey === 'previousStatus' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('newStatus')} className="px-3 sm:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300 cursor-pointer select-none">Status Atual {sortKey === 'newStatus' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {isLoadingLogs &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-3 sm:px-6 py-4"><div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded" /></td>
                    </tr>
                  ))}
                {!isLoadingLogs && pageData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-white/60">Nenhum log encontrado</td>
                  </tr>
                )}
                {!isLoadingLogs &&
                  pageData.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-white/70 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap max-w-[220px] truncate">{log.videoTitle}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-white/70 whitespace-nowrap">{log.channelName}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-white/70 whitespace-nowrap">{log.freelancerName}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-white/70 whitespace-nowrap">{log.previousStatus?.replace(/_/g, ' ') || ''}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-gray-600 dark:text-white/70 whitespace-nowrap">{log.newStatus?.replace(/_/g, ' ') || ''}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 dark:border-white/10">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-white/70">
              Página {currentPage} de {totalFilteredPages} • {filteredSorted.length} registros {updatedAt ? `• Atualizado em ${new Date(updatedAt).toLocaleString('pt-BR')}` : ''}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button onClick={() => setCurrentPage((p) => Math.min(totalFilteredPages, p + 1))} disabled={currentPage === totalFilteredPages} className="inline-flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed">
                Próxima
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LogsAndStats;
