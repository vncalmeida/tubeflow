import React, { useState, useEffect, useMemo } from 'react';
import { FileSpreadsheet, File, Filter, Search, RefreshCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../config';
import { VIDEO_STATUSES } from '../constants/videoStatus';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface ReportData {
  id: string;
  channelName: string;
  videoTitle: string;
  logDate: string;
  statusTransition: { from: string; to: string };
  duration: { formatted: string; seconds: number };
  freelancerId: string | null;
  timeSpentInSeconds?: number;
  timeSpent?: string;
  status?: string;
}

interface Channel {
  id: string;
  name: string;
}

interface Freelancer {
  id: string;
  name: string;
}

interface GlobalStats {
  totalTasks: number;
  averageTime: number;
  topFreelancer: string;
  topChannel: string;
}

interface StatusCount {
  status: string;
  count: number;
}

type SortKey = 'channelName' | 'videoTitle' | 'statusFrom' | 'statusTo' | 'durationSeconds' | 'logDate';

function CustomReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedFreelancer, setSelectedFreelancer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ totalTasks: 0, averageTime: 0, topFreelancer: '', topChannel: '' });
  const [statusCounts, setStatusCounts] = useState<StatusCount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortKey, setSortKey] = useState<SortKey>('logDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const COLORS = ['#ef4444', '#f87171', '#dc2626', '#fb7185', '#b91c1c', '#991b1b', '#7f1d1d'];
  const STATUS_OPTIONS = VIDEO_STATUSES;

  const formatTimeSpent = (totalSeconds: number): string => {
    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0m 0s';
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const d = days > 0 ? `${days}d ` : '';
    const h = hours > 0 ? `${hours}h ` : '';
    const m = minutes > 0 ? `${minutes}m ` : '';
    return `${d}${h}${m}${seconds}s`.trim();
  };

  useEffect(() => {
    const load = async () => {
      await Promise.all([fetchChannels(), fetchFreelancers()]);
    };
    load();
  }, []);

  const fetchChannels = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await fetch(`${API_URL}/api/channels3?companyId=${companyId}`);
      const json = await response.json();
      setChannels(Array.isArray(json.channels) ? json.channels : []);
    } catch {
      toast.error('Erro ao carregar canais');
    }
  };

  const fetchFreelancers = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await fetch(`${API_URL}/api/freelancers2?companyId=${companyId}`);
      const json = await response.json();
      setFreelancers(Array.isArray(json.data) ? json.data : []);
    } catch {
      toast.error('Erro ao carregar freelancers');
    }
  };

  const generateReport = async () => {
    setIsLoading(true);
    try {
      const companyId = localStorage.getItem('companyId');
      const params = new URLSearchParams({
        companyId: companyId || '',
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedChannel && { channelId: selectedChannel }),
        ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
        ...(selectedStatus && { status: selectedStatus })
      });
      const [reportResponse, statsResponse, statusResponse] = await Promise.all([
        fetch(`${API_URL}/api/reports/data?${params}`),
        fetch(`${API_URL}/api/reports/stats?${params}`),
        fetch(`${API_URL}/api/reports/status?${params}`)
      ]);
      if (!reportResponse.ok) throw new Error();
      if (!statsResponse.ok) throw new Error();
      if (!statusResponse.ok) throw new Error();
      const rawReport = await reportResponse.json();
      const statsData = await statsResponse.json();
      const rawStatus = await statusResponse.json();
      const formattedStatusData = (Array.isArray(rawStatus) ? rawStatus : []).map((item: { status: string; count: string }) => ({
        status: item.status,
        count: Number(item.count) || 0
      }));
      setStatusCounts(formattedStatusData);
      const formattedReportData: ReportData[] = (Array.isArray(rawReport) ? rawReport : []).map((item: any) => ({
        id: String(item.id),
        channelName: item.channelName || 'Não informado',
        videoTitle: item.videoTitle || 'Sem título',
        logDate: item.logDate,
        statusTransition: { from: item.statusTransition?.from || 'Não definido', to: item.statusTransition?.to || 'Não definido' },
        duration: { formatted: item.duration?.formatted || '0m 0s', seconds: Number(item.duration?.seconds) || 0 },
        freelancerId: item.freelancerId ? String(item.freelancerId) : null,
        timeSpentInSeconds: Number(item.duration?.seconds) || 0,
        timeSpent: formatTimeSpent(Number(item.duration?.seconds) || 0),
        status: (item.statusTransition?.to || '').replace(/_/g, ' ')
      }));
      setReportData(formattedReportData);
      setGlobalStats({
        totalTasks: Number(statsData.totaltasks) || 0,
        averageTime: Number(statsData.averagetime) || 0,
        topFreelancer: statsData.topfreelancer || 'Nenhum',
        topChannel: statsData.topchannel || 'Nenhum'
      });
      setUpdatedAt(new Date().toISOString());
      setPage(1);
      toast.success('Relatório gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar relatório');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedChannel('');
    setSelectedFreelancer('');
    setSelectedStatus('');
    setSearch('');
    setPage(1);
  };

  const exportReport = async (format: 'excel' | 'pdf') => {
    try {
      const companyId = localStorage.getItem('companyId');
      const params = new URLSearchParams({
        format,
        companyId: companyId || '',
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(selectedChannel && { channelId: selectedChannel }),
        ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
        ...(selectedStatus && { status: selectedStatus })
      });
      const response = await fetch(`${API_URL}/api/reports/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString()}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Relatório exportado em ${format.toUpperCase()}`);
    } catch {
      toast.error('Erro ao exportar relatório');
    }
  };

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = q
      ? reportData.filter((r) => r.videoTitle.toLowerCase().includes(q) || r.channelName.toLowerCase().includes(q) || r.statusTransition.to.toLowerCase().includes(q))
      : reportData.slice();
    const sorted = base.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortKey === 'channelName') return a.channelName.localeCompare(b.channelName) * dir;
      if (sortKey === 'videoTitle') return a.videoTitle.localeCompare(b.videoTitle) * dir;
      if (sortKey === 'statusFrom') return a.statusTransition.from.localeCompare(b.statusTransition.from) * dir;
      if (sortKey === 'statusTo') return a.statusTransition.to.localeCompare(b.statusTransition.to) * dir;
      if (sortKey === 'durationSeconds') return ((a.duration.seconds || 0) - (b.duration.seconds || 0)) * dir;
      if (sortKey === 'logDate') return (new Date(a.logDate).getTime() - new Date(b.logDate).getTime()) * dir;
      return 0;
    });
    return sorted;
  }, [reportData, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredSorted.slice(start, end);
  }, [filteredSorted, page, pageSize]);

  const changeSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  return (
    <Layout>
      <PageHeader title="Relatórios Personalizados" description="Crie, visualize e exporte relatórios sob medida" />
      <ToastContainer />
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-6 border-b border-gray-100 dark:border-white/10">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
              <div className="lg:col-span-2 grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">Data Inicial</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">Data Final</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">Canal</label>
                <select value={selectedChannel} onChange={(e) => setSelectedChannel(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Todos os Canais</option>
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">Freelancer</label>
                <select value={selectedFreelancer} onChange={(e) => setSelectedFreelancer(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Todos os Freelancers</option>
                  {freelancers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-white/70 mb-1">Status</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Todos os Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-stretch gap-2 w-full lg:w-auto">
              <button onClick={generateReport} disabled={isLoading} className="flex-1 lg:flex-none inline-flex items-center justify-center px-4 h-10 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {isLoading ? 'Gerando...' : 'Gerar Relatório'}
              </button>
              <button onClick={clearFilters} className="flex-1 lg:flex-none inline-flex items-center justify-center px-3 h-10 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/40">
                <Filter className="w-5 h-5 mr-2" />
                Limpar
              </button>
              <button onClick={() => setFiltersOpen((v) => !v)} className="hidden">
                Toggle
              </button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 px-4 lg:px-6 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/60">
              <RefreshCcw className="w-4 h-4" />
              <span>{updatedAt ? `Atualizado em ${new Date(updatedAt).toLocaleString('pt-BR')}` : 'Gere um relatório para ver os dados'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => exportReport('excel')} className="inline-flex items-center px-3 h-9 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/40">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Excel
              </button>
              <button onClick={() => exportReport('pdf')} className="inline-flex items-center px-3 h-9 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/30 dark:hover:bg-red-900/40">
                <File className="w-4 h-4 mr-2" />
                PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-red-600 to-red-700 text-white">
            <div className="text-sm opacity-90">Total de Tarefas</div>
            <div className="mt-2 text-3xl font-bold">{globalStats.totalTasks}</div>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="text-sm opacity-90">Média de Tempo</div>
            <div className="mt-2 text-3xl font-bold">{globalStats.averageTime > 0 ? formatTimeSpent(globalStats.averageTime) : '0m 0s'}</div>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-red-400 to-red-500 text-white">
            <div className="text-sm opacity-90">Top Freelancer</div>
            <div className="mt-2 text-2xl font-semibold truncate">{globalStats.topFreelancer}</div>
          </div>
          <div className="rounded-2xl p-5 bg-gradient-to-br from-red-700 to-red-800 text-white">
            <div className="text-sm opacity-90">Canal Mais Ativo</div>
            <div className="mt-2 text-2xl font-semibold truncate">{globalStats.topChannel}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-white/10 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Distribuição por Status</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusCounts} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status.replace(/_/g, ' ')}: ${count}`}>
                    {statusCounts.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(value: number, name: string) => [`${value}`, name.replace(/_/g, ' ')]} />
                  <Legend wrapperStyle={{ paddingTop: 12 }} formatter={(value) => value.replace(/_/g, ' ')} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-white/10 p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Progresso ao Longo do Tempo</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="logDate" tickFormatter={(str) => new Date(str).toLocaleDateString('pt-BR')} />
                  <YAxis tickFormatter={(value) => formatTimeSpent(Number(value))} />
                  <Tooltip contentStyle={{ background: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: 12, color: '#fff' }} formatter={(value: number) => formatTimeSpent(Number(value))} labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')} />
                  <Line type="monotone" dataKey="timeSpentInSeconds" stroke="#ef4444" name="Tempo por Log" dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-black rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 lg:p-5 border-b border-gray-100 dark:border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-6 rounded-full bg-red-600" />
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 dark:text-white">Detalhamento</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search className="w-4 h-4 text-gray-400 dark:text-white/50" />
                </div>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por vídeo, canal ou status" className="pl-9 h-10 w-64 max-w-[70vw] rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500" />
              </div>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }} className="h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white">
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={50}>50 por página</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 sticky top-0 z-10">
                <tr>
                  <th onClick={() => changeSort('channelName')} className="cursor-pointer select-none px-4 lg:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300">Canal {sortKey === 'channelName' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('videoTitle')} className="cursor-pointer select-none px-4 lg:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300">Vídeo {sortKey === 'videoTitle' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('statusFrom')} className="cursor-pointer select-none px-4 lg:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300">Status Anterior {sortKey === 'statusFrom' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('statusTo')} className="cursor-pointer select-none px-4 lg:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300">Novo Status {sortKey === 'statusTo' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('durationSeconds')} className="cursor-pointer select-none px-4 lg:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300">Duração {sortKey === 'durationSeconds' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  <th onClick={() => changeSort('logDate')} className="cursor-pointer select-none px-4 lg:px-6 py-3 text-left font-semibold text-red-900 dark:text-red-300">Data/Hora {sortKey === 'logDate' ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/10">
                {isLoading && (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-4 lg:px-6 py-4"><div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-4 lg:px-6 py-4"><div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-4 lg:px-6 py-4"><div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-4 lg:px-6 py-4"><div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-4 lg:px-6 py-4"><div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded" /></td>
                      <td className="px-4 lg:px-6 py-4"><div className="h-4 w-44 bg-gray-200 dark:bg-white/10 rounded" /></td>
                    </tr>
                  ))
                )}
                {!isLoading && pageData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-white/60">
                      Nenhum dado para exibir
                    </td>
                  </tr>
                )}
                {!isLoading && pageData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                    <td className="px-4 lg:px-6 py-4 text-gray-700 dark:text-white/80">{item.channelName}</td>
                    <td className="px-4 lg:px-6 py-4 font-medium text-gray-900 dark:text-white">{item.videoTitle}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-white/70">{item.statusTransition.from.replace(/_/g, ' ')}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-white/70">{item.statusTransition.to.replace(/_/g, ' ')}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-white/70">{item.duration.formatted}</td>
                    <td className="px-4 lg:px-6 py-4 text-gray-600 dark:text-white/70 whitespace-nowrap">{new Date(item.logDate).toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 lg:px-6 py-4 border-t border-gray-100 dark:border-white/10">
            <div className="text-xs sm:text-sm text-gray-600 dark:text-white/70">
              Página {page} de {totalPages} • {filteredSorted.length} registros
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50">
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="inline-flex items-center gap-2 px-3 h-9 rounded-lg border border-gray-300 dark:border-white/10 text-gray-700 dark:text-white/80 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50">
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

export default CustomReports;
