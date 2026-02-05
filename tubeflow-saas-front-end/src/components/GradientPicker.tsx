import React, { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import ColorPicker from './ColorPicker';

interface GradientPickerProps {
  label: string;
  isGradient: boolean;
  solidColor: string;
  gradientFrom: string;
  gradientTo: string;
  gradientDirection: string;
  onToggleGradient: (isGradient: boolean) => void;
  onSolidColorChange: (color: string) => void;
  onGradientFromChange: (color: string) => void;
  onGradientToChange: (color: string) => void;
  onDirectionChange: (direction: string) => void;
}

const gradientDirections = [
  { value: 'to-r', label: 'Horizontal →' },
  { value: 'to-l', label: 'Horizontal ←' },
  { value: 'to-b', label: 'Vertical ↓' },
  { value: 'to-t', label: 'Vertical ↑' },
  { value: 'to-br', label: 'Diagonal ↘' },
  { value: 'to-bl', label: 'Diagonal ↙' },
  { value: 'to-tr', label: 'Diagonal ↗' },
  { value: 'to-tl', label: 'Diagonal ↖' }
];

const GradientPicker: React.FC<GradientPickerProps> = ({
  label,
  isGradient,
  solidColor,
  gradientFrom,
  gradientTo,
  gradientDirection,
  onToggleGradient,
  onSolidColorChange,
  onGradientFromChange,
  onGradientToChange,
  onDirectionChange
}) => {
  const getPreviewStyle = () => {
    if (isGradient) {
      const direction = gradientDirection.replace('to-', '');
      let cssDirection = '';
      
      switch (direction) {
        case 'r': cssDirection = 'to right'; break;
        case 'l': cssDirection = 'to left'; break;
        case 'b': cssDirection = 'to bottom'; break;
        case 't': cssDirection = 'to top'; break;
        case 'br': cssDirection = 'to bottom right'; break;
        case 'bl': cssDirection = 'to bottom left'; break;
        case 'tr': cssDirection = 'to top right'; break;
        case 'tl': cssDirection = 'to top left'; break;
        default: cssDirection = 'to right';
      }
      
      return {
        background: `linear-gradient(${cssDirection}, ${gradientFrom}, ${gradientTo})`
      };
    }
    return { backgroundColor: solidColor };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Cor Sólida</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isGradient}
              onChange={(e) => onToggleGradient(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
          <span className="text-xs text-gray-500">Gradiente</span>
        </div>
      </div>

      {/* Preview */}
      <div 
        className="w-full h-16 rounded-lg border border-gray-200 dark:border-gray-600"
        style={getPreviewStyle()}
      />

      {isGradient ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <ColorPicker
              label="Cor Inicial"
              value={gradientFrom}
              onChange={onGradientFromChange}
            />
            <ColorPicker
              label="Cor Final"
              value={gradientTo}
              onChange={onGradientToChange}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Direção do Gradiente
            </label>
            <select
              value={gradientDirection}
              onChange={(e) => onDirectionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {gradientDirections.map((dir) => (
                <option key={dir.value} value={dir.value}>
                  {dir.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : (
        <ColorPicker
          label="Cor"
          value={solidColor}
          onChange={onSolidColorChange}
        />
      )}
    </div>
  );
};

export default GradientPicker;