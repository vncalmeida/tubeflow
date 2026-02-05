import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, Send, Clock } from 'lucide-react';
import { toast } from 'react-toastify';
import { API_URL } from '../config';

interface Video {
  id: string;
  title: string;
  channelId: string;
  channelName: string;
  freelancerId: string;
  freelancerName: string;
  scriptWriterId?: string;
  narratorId?: string;
  editorId?: string;
  thumbMakerId?: string;
  scriptWriterName?: string;
  narratorName?: string;
  editorName?: string;
  thumbMakerName?: string;
  status: string;
  observations?: string;
  youtubeUrl?: string;
  createdAt: string;
}

interface Comment {
  id: string;
  text: string;
  userName: string;
  userRole: string;
  createdAt: string;
  userId: string;
}

interface CommentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: Video | null;
}

const CommentsModal: React.FC<CommentsModalProps> = ({ isOpen, onClose, video }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('isFreelancer') === 'true'
    ? localStorage.getItem('userId')
    : localStorage.getItem('userIdA');

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'} atrás`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hora' : 'horas'} atrás`;
    }
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    }
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchComments = async (videoId: string) => {
    try {
      const companyId = localStorage.getItem('companyId');
      const response = await fetch(`${API_URL}/api/videos/${videoId}/comments?companyId=${companyId}`);
      const data = await response.json();
      if (data.comments) {
        const formatted = data.comments.map((comment: any) => ({
          id: comment.id || Math.random().toString(36).substr(2, 9),
          text: comment.text || '',
          userName: comment.userName || 'Anônimo',
          userRole: comment.userRole || 'Desconhecido',
          createdAt: comment.createdAt || new Date().toISOString(),
          userId: comment.userId || ''
        })) as Comment[];
        formatted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setComments(formatted);
        setTimeout(scrollToBottom, 100);
      } else {
        setComments([]);
      }
    } catch {
      toast.error('Erro ao buscar comentários.', { position: 'top-right' });
    }
  };

  useEffect(() => {
    if (!isOpen || !video) return;
    fetchComments(video.id);
    const intervalId = setInterval(() => {
      if (video) fetchComments(video.id);
    }, 5000);
    return () => clearInterval(intervalId);
  }, [isOpen, video]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !video) return;
    setIsSubmitting(true);
    const companyId = localStorage.getItem('companyId');
    const isFreelancer = localStorage.getItem('isFreelancer') === 'true';
    const userId = isFreelancer ? localStorage.getItem('userId') : localStorage.getItem('userIdA');
    const userType = isFreelancer ? 'freelancer' : 'user';
    try {
      const response = await fetch(`${API_URL}/api/videos/${video.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newComment, userId, userType, companyId })
      });
      if (response.ok) {
        const userName = localStorage.getItem('userName') || 'Você';
        const userRole = isFreelancer ? 'Freelancer' : 'Administrador';
        const newCommentObj: Comment = {
          id: Math.random().toString(36).substr(2, 9),
          text: newComment,
          userName,
          userRole,
          createdAt: new Date().toISOString(),
          userId: userId || ''
        };
        setComments(prev => [...prev, newCommentObj]);
        setNewComment('');
        scrollToBottom();
        fetchComments(video.id);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao adicionar comentário.', { position: 'top-right' });
      }
    } catch {
      toast.error('Erro ao adicionar comentário.', { position: 'top-right' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (!isOpen || !video) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-black rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 dark:border-white/10">
        <div className="p-6 bg-gradient-to-r from-red-50 to-red-100/60 dark:from-red-900/20 dark:to-red-800/20 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Comentários</h2>
                <p className="text-sm text-gray-600 dark:text-white/60 mt-0.5 max-w-md truncate">{video.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors" aria-label="Fechar">
              <X className="w-5 h-5 text-gray-500 dark:text-white/70" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-[600px]">
          <div
            ref={commentsContainerRef}
            className="flex-1 p-6 overflow-y-auto bg-white dark:bg-black"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e7eb transparent' }}
          >
            {comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment, index) => {
                  const isCurrentUser = comment.userId === currentUserId;
                  return (
                    <div key={comment.id || index} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[85%] p-4 break-words rounded-2xl shadow-sm border ${
                          isCurrentUser
                            ? 'bg-red-600 text-white border-red-700 rounded-tr-none'
                            : 'bg-white dark:bg-black text-gray-900 dark:text-white border-gray-200 dark:border-white/10 rounded-tl-none'
                        }`}
                      >
                        {!isCurrentUser && (
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white font-medium text-sm">
                              {comment.userName?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h3 className="font-medium text-sm text-gray-900 dark:text-white">{comment.userName}</h3>
                              <span className="text-xs text-gray-500 dark:text-white/60">{comment.userRole}</span>
                            </div>
                          </div>
                        )}
                        <p className={`text-sm whitespace-pre-wrap leading-relaxed ${isCurrentUser ? 'text-white' : 'text-gray-700 dark:text-white/80'}`}>
                          {comment.text}
                        </p>
                        <div
                          className={`flex items-center justify-end mt-2 text-xs ${
                            isCurrentUser ? 'text-red-100' : 'text-gray-400 dark:text-white/50'
                          }`}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{formatTime(comment.createdAt)}</span>
                          <span className="ml-1">({formatRelativeTime(comment.createdAt)})</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-900 dark:text-white font-medium">Nenhum comentário encontrado</p>
                <p className="text-sm text-gray-500 dark:text-white/60 mt-1">Seja o primeiro a comentar!</p>
              </div>
            )}
          </div>

          <div className="p-6 bg-white dark:bg-black border-t border-gray-100 dark:border-white/10 rounded-b-2xl">
            <div className="flex items-end space-x-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escreva um comentário..."
                className="flex-1 px-4 py-3 bg-gray-50 dark:bg-black border border-gray-200 dark:border-white/10 rounded-xl resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-white/50 text-gray-900 dark:text-white min-h-[80px] max-h-[120px]"
              />
              <button
                onClick={handleAddComment}
                disabled={isSubmitting || !newComment.trim()}
                className={`p-3 rounded-xl text-white font-medium transition-all ${
                  isSubmitting || !newComment.trim() ? 'bg-gray-300 dark:bg-white/10 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 shadow-sm'
                }`}
                aria-label="Enviar comentário"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-white/60 mt-3 text-right">Pressione Enter para enviar ou Shift+Enter para quebrar linha</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
