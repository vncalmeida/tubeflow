import React from 'react';
import { Edit3, Trash2, GripVertical } from 'lucide-react';
import { FooterElement } from '../pages/AdminFooterSettings';

interface DraggableFooterElementProps {
  element: FooterElement;
  onEdit: () => void;
  onDelete: () => void;
  icon: React.ElementType;
}

const DraggableFooterElement: React.FC<DraggableFooterElementProps> = ({
  element,
  onEdit,
  onDelete,
  icon: Icon
}) => {
  const getElementPreview = () => {
    switch (element.type) {
      case 'text':
        return element.content.substring(0, 50) + (element.content.length > 50 ? '...' : '');
      case 'links':
        return `${element.content.length} link(s)`;
      case 'contact':
        const contact = element.content;
        return [contact.email, contact.phone, contact.address].filter(Boolean).join(', ');
      case 'social':
        return 'Redes sociais';
      case 'logo':
        return 'Logo da empresa';
      case 'newsletter':
        return 'Formulário de newsletter';
      case 'custom':
        return 'Conteúdo HTML personalizado';
      default:
        return 'Elemento';
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center gap-3">
        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
        
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {element.title && (
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {element.title}
              </h4>
            )}
            <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
              {element.type}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {getElementPreview()}
          </p>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
            title="Editar elemento"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-700 transition-colors"
            title="Remover elemento"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DraggableFooterElement;