import React from 'react';
import { Youtube, Pencil, Trash2, ExternalLink } from 'lucide-react';

interface ChannelCardProps {
  id: string;
  name: string;
  description: string;
  totalVideos: number;
  monthlyVideos: number;
  youtubeUrl: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  id,
  name,
  description,
  totalVideos,
  monthlyVideos,
  youtubeUrl,
  onEdit,
  onDelete
}) => {
  return (
    <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-100 dark:border-white/10 p-6 transition-all hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-white/10">
            <Youtube className="w-6 h-6 text-red-600 dark:text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-sm text-gray-600 dark:text-white/70 mt-1">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(id)}
            className="p-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-gray-50 dark:text-white/80 dark:hover:text-white dark:hover:bg-white/5 transition-colors"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(id)}
            className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-white/5 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <p className="text-sm text-gray-600 dark:text-white/70">Total de Vídeos</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{totalVideos}</p>
        </div>
        <div className="rounded-xl p-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10">
          <p className="text-sm text-gray-600 dark:text-white/70">Vídeos este Mês</p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{monthlyVideos}</p>
        </div>
      </div>
      <a
        href={youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        Abrir no YouTube
      </a>
    </div>
  );
};

export default ChannelCard;
