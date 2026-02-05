import React from 'react';
import { 
  Edit3, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  GripVertical,
  Type,
  Link,
  Facebook,
  Phone,
  Image,
  Mail,
  Settings
} from 'lucide-react';
import { FooterColumn as FooterColumnType, FooterElement } from '../pages/AdminFooterSettings';
import DraggableFooterElement from './DraggableFooterElement';

interface FooterColumnProps {
  column: FooterColumnType;
  onUpdate: (updates: Partial<FooterColumnType>) => void;
  onDelete: () => void;
  onMove: (direction: 'left' | 'right') => void;
  onAddElement: (type: string) => void;
  onEditElement: (element: FooterElement) => void;
  onDeleteElement: (elementId: string) => void;
  elementTypes: Array<{
    type: string;
    label: string;
    icon: React.ElementType;
    description: string;
  }>;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

const FooterColumn: React.FC<FooterColumnProps> = ({
  column,
  onUpdate,
  onDelete,
  onMove,
  onAddElement,
  onEditElement,
  onDeleteElement,
  elementTypes,
  canMoveLeft,
  canMoveRight
}) => {
  const getElementIcon = (type: string) => {
    switch (type) {
      case 'text': return Type;
      case 'links': return Link;
      case 'social': return Facebook;
      case 'contact': return Phone;
      case 'logo': return Image;
      case 'newsletter': return Mail;
      case 'custom': return Settings;
      default: return Type;
    }
  };

  return (
    <div className="bg-white dark:bg-dark-card rounded-xl border border-gray-200 dark:border-gray-600 overflow-hidden">
      {/* Cabeçalho da Coluna */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
            <div className="flex-1">
              <input
                type="text"
                value={column.title || ''}
                onChange={(e) => onUpdate({ title: e.target.value })}
                className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
                placeholder="Título da coluna"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={column.width}
              onChange={(e) => onUpdate({ width: e.target.value as any })}
              className="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="sm">Pequena</option>
              <option value="md">Média</option>
              <option value="lg">Grande</option>
              <option value="full">Largura Total</option>
            </select>
            
            <button
              onClick={() => onMove('left')}
              disabled={!canMoveLeft}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onMove('right')}
              disabled={!canMoveRight}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={onDelete}
              className="p-1 text-red-600 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da Coluna */}
      <div className="p-4">
        {/* Elementos da Coluna */}
        <div className="space-y-3 mb-4">
          {column.elements
            .sort((a, b) => a.order - b.order)
            .map((element) => (
              <DraggableFooterElement
                key={element.id}
                element={element}
                onEdit={() => onEditElement(element)}
                onDelete={() => onDeleteElement(element.id)}
                icon={getElementIcon(element.type)}
              />
            ))}
        </div>

        {/* Botões para Adicionar Elementos */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Adicionar elemento:</p>
          <div className="grid grid-cols-2 gap-2">
            {elementTypes.map((elementType) => {
              const Icon = elementType.icon;
              return (
                <button
                  key={elementType.type}
                  onClick={() => onAddElement(elementType.type)}
                  className="flex items-center gap-2 p-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title={elementType.description}
                >
                  <Icon className="w-4 h-4" />
                  {elementType.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterColumn;