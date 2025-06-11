import React from 'react';
import { AutocompleteItem } from '../../utils/yqlSyntax';
import { Database, Hash, Zap, Code } from 'lucide-react';

interface AutocompleteDropdownProps {
  items: AutocompleteItem[];
  selectedIndex: number;
  onSelect: (item: AutocompleteItem) => void;
  position: { top: number; left: number };
}

const AutocompleteDropdown: React.FC<AutocompleteDropdownProps> = ({
  items,
  selectedIndex,
  onSelect,
  position
}) => {
  if (items.length === 0) return null;
  
  const getIcon = (type: AutocompleteItem['type']) => {
    switch (type) {
      case 'keyword':
        return <Code size={14} className="text-blue-500" />;
      case 'table':
        return <Database size={14} className="text-green-500" />;
      case 'column':
        return <Hash size={14} className="text-purple-500" />;
      case 'function':
        return <Zap size={14} className="text-indigo-500" />;
      default:
        return <Code size={14} className="text-gray-500" />;
    }
  };
  
  const getTypeColor = (type: AutocompleteItem['type']) => {
    switch (type) {
      case 'keyword':
        return 'text-blue-600 dark:text-blue-400';
      case 'table':
        return 'text-green-600 dark:text-green-400';
      case 'column':
        return 'text-purple-600 dark:text-purple-400';
      case 'function':
        return 'text-indigo-600 dark:text-indigo-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto min-w-64"
      style={{ top: position.top, left: position.left }}
    >
      <div className="p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          Suggestions ({items.length})
        </span>
      </div>
      
      {items.map((item, index) => (
        <div
          key={`${item.type}-${item.label}`}
          className={`flex items-center px-3 py-2 cursor-pointer transition-colors duration-150 ${
            index === selectedIndex
              ? 'bg-blue-50 dark:bg-blue-900/30 border-l-2 border-blue-500'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => onSelect(item)}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(item.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center">
              <span className="font-mono text-sm font-medium text-gray-900 dark:text-gray-100">
                {item.label}
              </span>
              <span className={`ml-2 text-xs font-medium uppercase ${getTypeColor(item.type)}`}>
                {item.type}
              </span>
            </div>
            
            {item.description && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                {item.description}
              </div>
            )}
          </div>
          
          {index === selectedIndex && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            </div>
          )}
        </div>
      ))}
      
      <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Use ↑↓ to navigate, Enter to select, Esc to close
        </span>
      </div>
    </div>
  );
};

export default AutocompleteDropdown;