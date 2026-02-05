import React, { useEffect, useState } from 'react';
import { Plus, X, Edit2, Trash2, AlertTriangle, Youtube, ExternalLink, Search, Filter, Video, MessageSquare, Send, XCircle, BellRing, MessageSquareWarning } from 'lucide-react';
import Layout from '../components/Layout';
import CommentsModal from '../components/CommentsModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../config';
import { extractYouTubeId } from '../utils/extractYouTubeId';
import PageHeader from '../components/PageHeader';
import { VIDEO_STATUSES, VideoStatus } from '../constants/videoStatus';

interface Assignment {
  freelancerId: string;
  freelancerName?: string;
  role: string;
}

interface VideoRow {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  assignments: Assignment[];
  status: VideoStatus;
  observations?: string;
  youtubeUrl?: string;
  createdAt: string;
}

interface Channel {
  id: string;
  name: string;
}

interface Freelancer {
  id: string;
  name: string;
  roles: string[];
}

function Videos() {
  const [activeTab, setActiveTab] = useState<'production' | 'published' | 'cancelled'>('production');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = useState(false);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ videoId: string; newStatus: string } | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoRow | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedFreelancer, setSelectedFreelancer] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoChannel, setNewVideoChannel] = useState('');
  const [newVideoAssignments, setNewVideoAssignments] = useState<Assignment[]>([]);
  const [newVideoObservations, setNewVideoObservations] = useState('');
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedVideoForComments, setSelectedVideoForComments] = useState<VideoRow | null>(null);
  const [preview, setPreview] = useState<{ x: number; y: number; thumb: string | null }>({ x: 0, y: 0, thumb: null });

  const roles = (JSON.parse(localStorage.getItem('roles') || '[]') as string[]).map((r) => r.replace(/\s+/g, '_').toLowerCase());
  const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
  const isAdmin = roles.includes('admin');

  const optionClasses = 'bg-white text-gray-900 dark:bg-black dark:text-white';

  const SelectThemeFix = () => (
    <style>{`
      select option { background:#ffffff; color:#111111; }
      .dark select option { background:#000000; color:#ffffff; }
    `}</style>
  );

  const useVideoStatuses = () => {
    const [allStatuses, setAllStatuses] = useState<VideoStatus[]>(VIDEO_STATUSES);
    useEffect(() => {
      (async () => {
        try {
          const r = await fetch(`${API_URL}/api/video-status`);
          const data = await r.json();
          const arr = Array.isArray(data)
            ? data
            : Array.isArray((data as any).statuses)
            ? (data as any).statuses
            : Array.isArray(Object.values(data)[0])
            ? (Object.values(data)[0] as string[])
            : null;
          if (arr?.length) {
            const filtered = (arr as string[]).filter((s) => (VIDEO_STATUSES as readonly string[]).includes(s)) as VideoStatus[];
            if (filtered.length) setAllStatuses(filtered);
          }
        } catch {}
      })();
    }, []);
    return allStatuses;
  };

  const allStatuses = useVideoStatuses();

  const statusColors: Record<VideoStatus, { bg: string; text: string }> = {
    Pendente: { bg: 'bg-gray-200 dark:bg-white/10', text: 'text-gray-700 dark:text-white' },
    Roteiro_Solicitado: { bg: 'bg-blue-200 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-200' },
    Roteiro_Em_Andamento: { bg: 'bg-orange-200 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-200' },
    Roteiro_Concluído: { bg: 'bg-green-200 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-200' },
    Narração_Solicitada: { bg: 'bg-teal-200 dark:bg-teal-900/40', text: 'text-teal-700 dark:text-teal-200' },
    Narração_Em_Andamento: { bg: 'bg-orange-300 dark:bg-orange-900/50', text: 'text-orange-800 dark:text-orange-300' },
    Narração_Concluída: { bg: 'bg-green-300 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300' },
    Edição_Solicitada: { bg: 'bg-indigo-200 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-200' },
    Edição_Em_Andamento: { bg: 'bg-yellow-200 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-200' },
    Edição_Concluída: { bg: 'bg-green-400 dark:bg-green-900/60', text: 'text-green-900 dark:text-green-200' },
    Thumbnail_Solicitada: { bg: 'bg-purple-200 dark:bg-purple-900/40', text: 'text-purple-700 dark:text-purple-200' },
    Thumbnail_Em_Andamento: { bg: 'bg-yellow-300 dark:bg-yellow-900/50', text: 'text-yellow-800 dark:text-yellow-300' },
    Thumbnail_Concluída: { bg: 'bg-green-500 dark:bg-green-900/70', text: 'text-green-900 dark:text-green-200' },
    Publicado: { bg: 'bg-green-600 dark:bg-green-800', text: 'text-white dark:text-white' },
    Cancelado: { bg: 'bg-red-300 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300' }
  };

  const getAssignment = (video: VideoRow, role: string) => video.assignments.find((a) => a.role === role);
  const getFreelancerName = (video: VideoRow, role: string) => getAssignment(video, role)?.freelancerName || 'N/A';
  const isUserAssigned = (video: VideoRow, id: number, role?: string) => video.assignments.some((a) => parseInt(a.freelancerId, 10) === id && (!role || a.role === role));

  const getRoleFromStatus = (status: VideoStatus): string | null => {
    if (status.startsWith('Roteiro')) return 'roteirista';
    if (status.startsWith('Narração')) return 'narrador';
    if (status.startsWith('Edição')) return 'editor';
    if (status.startsWith('Thumbnail')) return 'thumb_maker';
    return null;
  };

  const statusesByRole: Record<string, readonly VideoStatus[]> = {
    roteirista: ['Pendente', 'Roteiro_Solicitado', 'Roteiro_Em_Andamento', 'Roteiro_Concluído'],
    narrador: ['Narração_Solicitada', 'Narração_Em_Andamento', 'Narração_Concluída'],
    editor: ['Edição_Solicitada', 'Edição_Em_Andamento', 'Edição_Concluída'],
    thumb_maker: ['Thumbnail_Solicitada', 'Thumbnail_Em_Andamento', 'Thumbnail_Concluída'],
    admin: allStatuses
  };

  const getFilterStatuses = (): VideoStatus[] => {
    if (isAdmin) return [...allStatuses];
    if (activeTab === 'published' || activeTab === 'cancelled') return ['Publicado', 'Cancelado'] as VideoStatus[];
    const statusSet = new Set<VideoStatus>();
    roles.forEach((role) => {
      const statuses = statusesByRole[role as keyof typeof statusesByRole];
      statuses?.forEach((s) => statusSet.add(s));
    });
    return Array.from(statusSet);
  };

  const getStatusOptionsForVideo = (currentStatus: VideoStatus): VideoStatus[] => {
    if (isAdmin) return [...allStatuses];
    const role = getRoleFromStatus(currentStatus);
    if (role && roles.includes(role)) return statusesByRole[role as keyof typeof statusesByRole] as VideoStatus[];
    return [currentStatus];
  };

  const canDeleteVideo = () => isAdmin;
  const canCreateVideo = () => isAdmin;
  const canEditVideo = () => isAdmin;

  useEffect(() => {
    fetchChannels();
    fetchFreelancers();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [selectedChannel, selectedFreelancer, selectedStatus, searchTerm]);

  const fetchVideos = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const isAdmin = roles.includes('admin');
      const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
      const userRoles = JSON.parse(localStorage.getItem('roles') || '[]');
      const userId = isFreelancer ? localStorage.getItem('userId') || '' : '';
      
      const params = new URLSearchParams({
        companyId: companyId || '',
        ...(selectedChannel && { channelId: selectedChannel }),
        ...(selectedFreelancer && { freelancerId: selectedFreelancer }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(searchTerm && { searchTerm }),
        isAdmin: isAdmin.toString(),
        isFreelancer: isFreelancer.toString(),
        userRoles: userRoles.join(','),
        ...(isFreelancer && userId ? { userId } : {})
      });
      
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/api/videos?${params.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const data = await response.json();
      const mappedVideos = data.map((video: any) => ({
        id: video.id,
        title: video.title,
        channelId: video.channel_id,
        channelName: video.channel_name || '',
        assignments: (video.roles || []).map((r: any) => ({
          freelancerId: r.freelancer_id,
          freelancerName: r.freelancer_name,
          role: r.role
        })),
        status: video.status,
        observations: video.observations || '',
        youtubeUrl: video.youtube_url || null,
        createdAt: video.created_at
      }));
      setVideos(mappedVideos);
    } catch {
      toast.error('Erro ao buscar vídeos.', { position: 'top-right' });
    }
  };

  const fetchChannels = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await fetch(`${API_URL}/api/channels4?companyId=${companyId}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.channels && Array.isArray(data.channels)) setChannels(data.channels);
      else throw new Error();
    } catch {
      toast.error('Erro ao buscar canais.', { position: 'top-right' });
      setChannels([]);
    }
  };

  const fetchFreelancers = async () => {
    try {
      const companyId = localStorage.getItem('companyId');
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/freelancers4?companyId=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (data.freelancers && Array.isArray(data.freelancers)) {
        const normalized = data.freelancers.map((f: any) => ({ ...f, roles: Array.isArray(f.roles) ? f.roles : [] }));
        setFreelancers(normalized);
      } else throw new Error();
    } catch {
      toast.error('Erro ao buscar freelancers.', { position: 'top-right' });
      setFreelancers([]);
    }
  };

  useEffect(() => {
    if (isEditModalOpen && selectedVideo) {
      setNewVideoTitle(selectedVideo.title);
      setNewVideoChannel(selectedVideo.channelId);
      setNewVideoAssignments(selectedVideo.assignments || []);
      setNewVideoObservations(selectedVideo.observations || '');
    }
  }, [isEditModalOpen, selectedVideo]);

  const clearCreateVideoFields = () => {
    setNewVideoTitle('');
    setNewVideoChannel('');
    setNewVideoAssignments([
      { role: 'roteirista', freelancerId: '' },
      { role: 'narrador', freelancerId: '' },
      { role: 'editor', freelancerId: '' },
      { role: 'thumb_maker', freelancerId: '' }
    ]);
    setNewVideoObservations('');
  };

  const handleCreateVideo = async () => {
    if (!newVideoTitle) {
      toast.error('O título do vídeo é obrigatório.', { position: 'top-right' });
      return;
    }
    if (!newVideoChannel) {
      toast.error('O canal do vídeo é obrigatório.', { position: 'top-right' });
      return;
    }
    const requiredRoles = ['roteirista', 'narrador', 'editor', 'thumb_maker'];
    for (const role of requiredRoles) {
      if (!newVideoAssignments.some((a) => a.role === role && a.freelancerId)) {
        toast.error(`O ${role} do vídeo é obrigatório.`, { position: 'top-right' });
        return;
      }
    }
    const companyId = localStorage.getItem('companyId');
    const data = {
      title: newVideoTitle,
      channelId: newVideoChannel,
      freelancerRoles: newVideoAssignments,
      status: 'Pendente',
      observations: newVideoObservations || null,
      youtubeUrl: null,
      companyId,
      userId: localStorage.getItem('userIdA')
    };
    try {
      const response = await fetch(`${API_URL}/api/videos`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) {
        fetchVideos();
        setIsCreateModalOpen(false);
        clearCreateVideoFields();
        toast.success('Vídeo criado com sucesso!', { position: 'top-right' });
      } else {
        const error = await response.json();
        toast.error(error.message, { position: 'top-right' });
      }
    } catch {
      toast.error('Erro ao criar vídeo.', { position: 'top-right' });
    }
  };

  const handleEditVideo = async () => {
    if (!selectedVideo) return;
    if (!newVideoTitle || !newVideoChannel) {
      toast.error('Todos os campos obrigatórios devem ser preenchidos.', { position: 'top-right' });
      return;
    }
    const requiredRoles = ['roteirista', 'narrador', 'editor', 'thumb_maker'];
    for (const role of requiredRoles) {
      if (!newVideoAssignments.some((a) => a.role === role && a.freelancerId)) {
        toast.error('Todos os campos obrigatórios devem ser preenchidos.', { position: 'top-right' });
        return;
      }
    }
    const isFreelancerUser = localStorage.getItem('isFreelancer') === 'true';
    const userId = isFreelancerUser ? localStorage.getItem('userId') : localStorage.getItem('userIdA');
    if (!userId) {
      toast.error('Usuário não identificado.', { position: 'top-right' });
      return;
    }
    const companyId = localStorage.getItem('companyId');
    const freelancerRoles = newVideoAssignments.map(({ freelancerId, role }) => ({ freelancerId, role }));
    const updatedData = {
      title: newVideoTitle,
      channelId: newVideoChannel,
      status: selectedVideo.status,
      observations: newVideoObservations || null,
      youtubeUrl: selectedVideo.youtubeUrl || null,
      freelancerRoles,
      companyId,
      userId
    };
    try {
      const response = await fetch(`${API_URL}/api/videos/${selectedVideo?.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedData) });
      if (response.ok) {
        fetchVideos();
        setIsEditModalOpen(false);
        toast.success('Vídeo atualizado com sucesso!', { position: 'top-right' });
      } else {
        const error = await response.json();
        toast.error(error.message, { position: 'top-right' });
      }
    } catch {
      toast.error('Erro ao editar vídeo.', { position: 'top-right' });
    }
  };

  const handleDeleteVideo = async () => {
    if (!selectedVideo) return;
    try {
      const companyId = localStorage.getItem('companyId');
      if (!companyId) {
        toast.error('Company ID não encontrado', { position: 'top-right' });
        return;
      }
      const response = await fetch(`${API_URL}/api/videos/${selectedVideo.id}?companyId=${companyId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (response.ok) {
        fetchVideos();
        setIsDeleteModalOpen(false);
        setSelectedVideo(null);
        toast.success(data.message || 'Vídeo excluído com sucesso!', { position: 'top-right' });
      } else {
        toast.error(data.message || 'Erro ao excluir vídeo', { position: 'top-right' });
      }
    } catch {
      toast.error('Erro de conexão ao excluir vídeo', { position: 'top-right' });
    }
  };

  const handleStatusChange = async (videoId: string, currentStatus: VideoStatus, newStatus: VideoStatus) => {
    const availableStatuses = getStatusOptionsForVideo(currentStatus);
    if (!availableStatuses.includes(newStatus) && !isAdmin) {
      toast.error('Você não tem permissão para definir este status.', { position: 'top-right' });
      return;
    }
    
    // Verificar se é um status que solicita trabalho
    if (['Roteiro_Solicitado', 'Narração_Solicitada', 'Edição_Solicitada', 'Thumbnail_Solicitada'].includes(newStatus)) {
      // Consultar configurações da empresa para notificações automáticas
      const companyId = localStorage.getItem('companyId');
      if (companyId) {
        try {
          const response = await fetch(`${API_URL}/api/settings?companyId=${companyId}`);
          if (response.ok) {
            const settings = await response.json();
            // Se auto_notify estiver ativado, enviar automaticamente sem mostrar modal
            if (settings.auto_notify) {
              await updateVideoStatus(videoId, newStatus, 1);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao consultar configurações:', error);
        }
      }
      
      // Se auto_notify estiver desativado ou ocorrer erro, mostrar modal
      setPendingStatusChange({ videoId, newStatus });
      setIsSendMessageModalOpen(true);
      return;
    }
    
    await updateVideoStatus(videoId, newStatus, 0);
  };

  const updateVideoStatus = async (videoId: string, newStatus: string, sendMessage: number) => {
    const companyId = localStorage.getItem('companyId');
    const isFreelancerUser = localStorage.getItem('isFreelancer') === 'true';
    const userId = isFreelancerUser ? localStorage.getItem('userId') : localStorage.getItem('userIdA');
    if (!userId) {
      toast.error('Usuário não identificado.', { position: 'top-right' });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/videos/${videoId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, status: newStatus, userId, isUser: !isFreelancerUser, sendMessage })
      });
      if (response.ok) {
        fetchVideos();
        toast.success('Status atualizado com sucesso!', { position: 'top-right' });
      } else {
        const error = await response.json();
        toast.error(error.message, { position: 'top-right' });
      }
    } catch {
      toast.error('Erro ao atualizar status.', { position: 'top-right' });
    }
  };

  const clearFilters = () => {
    setSelectedChannel('');
    setSelectedStatus('');
    setSelectedFreelancer('');
    setSearchTerm('');
  };

  const openCommentsModal = (video: VideoRow) => {
    setSelectedVideoForComments(video);
    setIsCommentsModalOpen(true);
  };

  const closeCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setSelectedVideoForComments(null);
  };

  const renderObservation = (url?: string) => {
    const id = extractYouTubeId(url || '');
    const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    return id ? (
      <div
        className="relative inline-block"
        onMouseMove={(e) => setPreview({ x: e.clientX, y: e.clientY, thumb })}
        onMouseLeave={() => setPreview({ x: 0, y: 0, thumb: null })}
      >
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-red-600 dark:text-red-400 underline">
          {url}
        </a>
        {preview.thumb === thumb && (
          <img
            src={thumb}
            alt="Pré-visualização"
            className="fixed z-50 w-48 rounded shadow-lg pointer-events-none"
            style={{ top: preview.y + 10, left: preview.x + 10 }}
          />
        )}
      </div>
    ) : (
      <span className="text-gray-600 dark:text-white/70">{url || 'N/A'}</span>
    );
  };

  const filteredVideos = videos.filter((video) => {
    if (activeTab === 'cancelled') {
      if (isAdmin) return video.status === 'Cancelado';
      if (isFreelancer) {
        const userId = localStorage.getItem('userId');
        if (!userId) return false;
        const normalizedUserId = parseInt(userId, 10);
        return video.status === 'Cancelado' && isUserAssigned(video, normalizedUserId);
      }
      return false;
    }
    if (activeTab === 'published') {
      if (isAdmin) return video.status === 'Publicado';
      if (isFreelancer) {
        const userId = localStorage.getItem('userId');
        if (!userId) return false;
        const normalizedUserId = parseInt(userId, 10);
        return video.status === 'Publicado' && isUserAssigned(video, normalizedUserId);
      }
      return false;
    }
    if (activeTab === 'production') {
      if (video.status === 'Publicado' || video.status === 'Cancelado') return false;
      if (isAdmin) return true;
      if (isFreelancer) {
        const userId = localStorage.getItem('userId');
        if (!userId) return false;
        const normalizedUserId = parseInt(userId, 10);
        if (Number.isNaN(normalizedUserId)) return false;
        
        const normalizedRoles = roles.filter(
          (role): role is keyof typeof statusesByRole => role in statusesByRole
        );
        if (!normalizedRoles.length) return false;

        return normalizedRoles.some((roleKey) => {
          const allowedStatuses = statusesByRole[roleKey] ?? [];
          const isAssigned = roleKey === 'admin'
            ? isUserAssigned(video, normalizedUserId)
            : isUserAssigned(video, normalizedUserId, roleKey);
          return isAssigned && allowedStatuses.includes(video.status);
        });
      }
      return false;
    }
    return false;
  });

  return (
    <Layout>
      <SelectThemeFix />
      <ToastContainer />
      <PageHeader title="Vídeos" description="Gerencie todos os vídeos do sistema" />
      {isAdmin && (
        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end mb-6 gap-4">
          {canCreateVideo() && (
            <button
              onClick={() => {
                clearCreateVideoFields();
                setIsCreateModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors w-full sm:w-auto justify-center shadow-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Vídeo
            </button>
          )}
        </div>
      )}
      <div className="flex border-b border-gray-200 dark:border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('production')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'production' ? 'text-red-600 border-red-600' : 'text-gray-500 border-transparent hover:text-red-600 hover:border-red-300'}`}
        >
          Em Produção
        </button>
        <button
          onClick={() => setActiveTab('published')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'published' ? 'text-red-600 border-red-600' : 'text-gray-500 border-transparent hover:text-red-600 hover:border-red-300'}`}
        >
          Publicados
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'cancelled' ? 'text-red-600 border-red-600' : 'text-gray-500 border-transparent hover:text-red-600 hover:border-red-300'}`}
        >
          Cancelados
        </button>
      </div>
      <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-white/50" />
            </div>
            <input
              type="text"
              placeholder="Buscar vídeos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option className={optionClasses} value="">Todos os Canais</option>
            {channels.map((channel) => (
              <option className={optionClasses} key={channel.id} value={channel.id}>
                {channel.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option className={optionClasses} value="">Todos os Status</option>
            {getFilterStatuses().map((status) => (
              <option className={optionClasses} key={status} value={status}>
                {status.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {isAdmin && (
            <select
              value={selectedRole || ''}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{ colorScheme: 'dark' }}
              className="w-full h-10 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-black text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
            >
              <option className={optionClasses} value="">Selecione uma Role</option>
              <option className={optionClasses} value="editor">Editor</option>
              <option className={optionClasses} value="roteirista">Roteirista</option>
              <option className={optionClasses} value="narrador">Narrador</option>
              <option className={optionClasses} value="thumbnail">Thumbnail</option>
            </select>
          )}
          <button
            onClick={clearFilters}
            className="flex items-center justify-center h-10 px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
          >
            <Filter className="w-5 h-5 mr-2" />
            Limpar Filtros
          </button>
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20">
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Título</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Canal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10 w-[300px]">Observações</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Roteirista</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Narrador</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Editor</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Thumb Maker</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-red-900 dark:text-red-300 border-b border-gray-200 dark:border-white/10">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredVideos.map((video) => {
                const statusOptions = getStatusOptionsForVideo(video.status);
                return (
                  <tr key={video.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white break-words">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Youtube className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-white/70 break-words">{video.channelName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={video.status}
                        onChange={(e) => handleStatusChange(video.id, video.status, e.target.value as VideoStatus)}
                        style={{ colorScheme: 'dark' }}
                        className={`inline-flex items-center px-3 py-2 rounded-full text-sm border focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-150 border-gray-200 dark:border-white/10 ${statusColors[video.status]?.bg || 'bg-gray-100 dark:bg-white/10'} ${statusColors[video.status]?.text || 'text-gray-600 dark:text-white'}`}
                        disabled={!isAdmin && statusOptions.length === 1}
                      >
                        {statusOptions.map((status) => (
                          <option className={optionClasses} key={status} value={status}>
                            {status.replace(/_/g, ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative group">
                        <div className="max-h-24 overflow-hidden">{renderObservation(video.observations)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-white/70 break-words">{getFreelancerName(video, 'roteirista')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-white/70 break-words">{getFreelancerName(video, 'narrador')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-white/70 break-words">{getFreelancerName(video, 'editor')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 dark:text-white/70 break-words">{getFreelancerName(video, 'thumb_maker')}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {canEditVideo(video) && (
                          <button
                            onClick={() => {
                              setSelectedVideo(video);
                              setIsEditModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                            title="Editar"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                        )}
                        {canDeleteVideo() && (
                          <button
                            onClick={() => {
                              setSelectedVideo(video);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                            title="Excluir"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        {video.youtubeUrl && (
                          <a
                            href={video.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-150"
                            title="Ver no YouTube"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                        <button
                          onClick={() => openCommentsModal(video)}
                          className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-150"
                          title="Visualizar Comentários"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="lg:hidden space-y-4 w-full">
        {filteredVideos.map((video) => {
          const statusOptions = getStatusOptionsForVideo(video.status);
          return (
            <div key={video.id} className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="p-4 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">{video.title}</h3>
                    <div className="flex items-center mt-2 text-gray-600 dark:text-white/70">
                      <Youtube className="w-4 h-4 text-red-600 mr-2 flex-shrink-0" />
                      <span className="text-sm">{video.channelName}</span>
                    </div>
                  </div>
                  {video.youtubeUrl && (
                    <a href={video.youtubeUrl} target="_blank" rel="noopener noreferrer" className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
                <div className="w-full">
                  <select
                    value={video.status}
                    onChange={(e) => handleStatusChange(video.id, video.status, e.target.value as VideoStatus)}
                    style={{ colorScheme: 'dark' }}
                    className={`w-full px-3 py-2 rounded-lg text-sm border focus:ring-2 focus:ring-red-500 focus:border-red-500 border-gray-200 dark:border-white/10 ${statusColors[video.status]?.bg || 'bg-gray-100 dark:bg-white/10'} ${statusColors[video.status]?.text || 'text-gray-600 dark:text-white'}`}
                    disabled={!isAdmin && statusOptions.length === 1}
                  >
                    {statusOptions.map((status) => (
                      <option className={optionClasses} key={status} value={status}>
                        {status.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/60">Roteirista</label>
                    <p className="text-sm text-gray-900 dark:text-white">{getFreelancerName(video, 'roteirista')}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/60">Narrador</label>
                    <p className="text-sm text-gray-900 dark:text-white">{getFreelancerName(video, 'narrador')}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/60">Editor</label>
                    <p className="text-sm text-gray-900 dark:text-white">{getFreelancerName(video, 'editor')}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500 dark:text-white/60">Thumb Maker</label>
                    <p className="text-sm text-gray-900 dark:text-white">{getFreelancerName(video, 'thumb_maker')}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 dark:border-white/10">
                  <label className="text-xs font-medium text-gray-500 dark:text-white/60 mb-1 block">Observações</label>
                  {renderObservation(video.observations)}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/10">
                  <div className="flex gap-2">
                    {canEditVideo(video) && (
                      <button
                        onClick={() => {
                          setSelectedVideo(video);
                          setIsEditModalOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                    )}
                    {canDeleteVideo() && (
                      <button
                        onClick={() => {
                          setSelectedVideo(video);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <button onClick={() => openCommentsModal(video)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comentários
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <CommentsModal isOpen={isCommentsModalOpen} onClose={closeCommentsModal} video={selectedVideoForComments} />
      {isSendMessageModalOpen && pendingStatusChange && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="p-6 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-t-2xl border-b border-red-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <BellRing className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Enviar Notificação</h2>
                    <p className="text-sm text-gray-600 dark:text-white/60 mt-0.5">Via WhatsApp</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSendMessageModalOpen(false);
                    updateVideoStatus(pendingStatusChange.videoId, pendingStatusChange.newStatus, 0);
                  }}
                  className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-white/70" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-8">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquareWarning className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">Confirmar Envio</h3>
                  <p className="text-gray-600 dark:text-white/60">Você está prestes a enviar uma notificação via WhatsApp para o freelancer responsável. Deseja prosseguir com o envio?</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/10">
                <button
                  onClick={() => {
                    setIsSendMessageModalOpen(false);
                    updateVideoStatus(pendingStatusChange.videoId, pendingStatusChange.newStatus, 0);
                  }}
                  className="inline-flex items-center px-4 py-2.5 text-gray-700 dark:text-white/80 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5 mr-2 text-gray-500 dark:text-white/60" />
                  Não Enviar
                </button>
                <button
                  onClick={() => {
                    setIsSendMessageModalOpen(false);
                    updateVideoStatus(pendingStatusChange.videoId, pendingStatusChange.newStatus, 1);
                  }}
                  className="inline-flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-200 shadow-sm"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Notificação
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
            <div className="p-6 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/20 rounded-t-2xl border-b border-red-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-600 rounded-lg">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{isCreateModalOpen ? 'Novo Vídeo' : 'Editar Vídeo'}</h2>
                    <p className="text-sm text-gray-600 dark:text-white/60 mt-0.5">{isCreateModalOpen ? 'Adicione um novo vídeo ao sistema' : 'Atualize as informações do vídeo'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (isCreateModalOpen) clearCreateVideoFields();
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-white/70" />
                </button>
              </div>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (isCreateModalOpen) handleCreateVideo();
                else handleEditVideo();
              }}
              className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">Título do Vídeo</label>
                    <input
                      type="text"
                      value={newVideoTitle}
                      onChange={(e) => setNewVideoTitle(e.target.value)}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all placeholder:text-gray-400 dark:text-white"
                      placeholder="Digite o título do vídeo"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">Canal</label>
                    <select
                      value={newVideoChannel}
                      onChange={(e) => setNewVideoChannel(e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className="w-full pl-4 pr-10 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all appearance-none dark:text-white"
                    >
                      <option className={optionClasses} value="">Selecione um canal</option>
                      {channels.map((channel) => (
                        <option className={optionClasses} key={channel.id} value={channel.id}>
                          {channel.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  {newVideoAssignments.map((assignment, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <select
                        value={assignment.role}
                        onChange={(e) => {
                          const updated = [...newVideoAssignments];
                          updated[index].role = e.target.value;
                          updated[index].freelancerId = '';
                          setNewVideoAssignments(updated);
                        }}
                        style={{ colorScheme: 'dark' }}
                        className="w-1/3 pl-4 pr-10 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all dark:text-white"
                      >
                        <option className={optionClasses} value="">Selecione uma função</option>
                        <option className={optionClasses} value="roteirista">Roteirista</option>
                        <option className={optionClasses} value="narrador">Narrador</option>
                        <option className={optionClasses} value="editor">Editor</option>
                        <option className={optionClasses} value="thumb_maker">Thumb Maker</option>
                      </select>
                      <select
                        value={assignment.freelancerId}
                        onChange={(e) => {
                          const updated = [...newVideoAssignments];
                          updated[index].freelancerId = e.target.value;
                          setNewVideoAssignments(updated);
                        }}
                        style={{ colorScheme: 'dark' }}
                        className="flex-1 pl-4 pr-10 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all dark:text-white"
                      >
                        <option className={optionClasses} value="">Selecione um freelancer</option>
                        {freelancers
                          .filter((f) => f.roles.includes(assignment.role))
                          .map((f) => (
                            <option className={optionClasses} key={f.id} value={f.id}>
                              {f.name}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setNewVideoAssignments(newVideoAssignments.filter((_, i) => i !== index))}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setNewVideoAssignments([...newVideoAssignments, { role: '', freelancerId: '' }])}
                    className="flex items-center px-3 py-2 text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar Atribuição
                  </button>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1.5">Comentários e Observações</label>
                  <textarea
                    value={newVideoObservations}
                    onChange={(e) => setNewVideoObservations(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none dark:text-white"
                    rows={4}
                    placeholder="Adicione comentários ou observações importantes sobre o vídeo..."
                  />
                </div>
              </div>
              <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-white/10 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    if (isCreateModalOpen) clearCreateVideoFields();
                    setIsCreateModalOpen(false);
                    setIsEditModalOpen(false);
                  }}
                  className="px-6 py-2.5 text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancelar
                </button>
                <button type="submit" className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all shadow-sm">
                  {isCreateModalOpen ? (
                    <span className="flex items-center">
                      <Plus className="w-5 h-5 mr-2" />
                      Criar Vídeo
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Edit2 className="w-5 h-5 mr-2" />
                      Salvar Alterações
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isDeleteModalOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-black rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-white/10">
            <div className="p-6 border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Excluir Vídeo</h2>
                <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-white/80">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-600 dark:text-white/80">
                  Tem certeza que deseja excluir o vídeo <span className="font-semibold">{selectedVideo.title}</span>? Essa ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-gray-700 dark:text-white/80 border border-gray-300 dark:border-white/10 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5">
                  Cancelar
                </button>
                <button onClick={handleDeleteVideo} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Videos;
