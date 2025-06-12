import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Save, Copy, Trash, Lightbulb } from 'lucide-react';
import SyntaxHighlighter from './SyntaxHighlighter';
import AutocompleteDropdown from './AutocompleteDropdown';
import { getAutocompleteItems, AutocompleteItem } from '../../utils/yqlSyntax';

interface QueryEditorProps {
  value: string;
  onChange: (value: string) => void;
  onExecute: () => void;
  isExecuting: boolean;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ 
  value, 
  onChange, 
  onExecute,
  isExecuting
}) => {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteItems, setAutocompleteItems] = useState<AutocompleteItem[]>([]);
  const [selectedAutocompleteIndex, setSelectedAutocompleteIndex] = useState(0);
  const [autocompletePosition, setAutocompletePosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);
  
  // Sync scroll between textarea and highlighter
  const handleScroll = useCallback(() => {
    if (editorRef.current && highlighterRef.current) {
      highlighterRef.current.scrollTop = editorRef.current.scrollTop;
      highlighterRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  }, []);
  
  // Update autocomplete suggestions
  const updateAutocomplete = useCallback((query: string, position: number) => {
    const items = getAutocompleteItems(query, position);
    setAutocompleteItems(items);
    setSelectedAutocompleteIndex(0);
    setShowAutocomplete(items.length > 0);
    
    if (items.length > 0 && editorRef.current) {
      // Calculate position for autocomplete dropdown
      const textarea = editorRef.current;
      const textBeforeCursor = query.slice(0, position);
      const lines = textBeforeCursor.split('\n');
      const currentLine = lines.length - 1;
      const currentColumn = lines[lines.length - 1].length;
      
      // Approximate character dimensions
      const charWidth = 8.4; // Approximate width of monospace character
      const lineHeight = 24; // Line height in pixels
      
      const rect = textarea.getBoundingClientRect();
      const top = rect.top + (currentLine * lineHeight) + lineHeight + 5 - textarea.scrollTop;
      const left = rect.left + (currentColumn * charWidth) - textarea.scrollLeft;
      
      setAutocompletePosition({ top, left });
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    
    onChange(newValue);
    setCursorPosition(newCursorPosition);
    updateAutocomplete(newValue, newCursorPosition);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle autocomplete navigation
    if (showAutocomplete && autocompleteItems.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedAutocompleteIndex(prev => 
          prev < autocompleteItems.length - 1 ? prev + 1 : 0
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedAutocompleteIndex(prev => 
          prev > 0 ? prev - 1 : autocompleteItems.length - 1
        );
        return;
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleAutocompleteSelect(autocompleteItems[selectedAutocompleteIndex]);
        return;
      }
      
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }
    
    // Execute query on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onExecute();
      return;
    }
    
    // Handle tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = editorRef.current?.selectionStart || 0;
      const end = editorRef.current?.selectionEnd || 0;
      
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = editorRef.current.selectionEnd = start + 2;
        }
      }, 0);
      return;
    }
    
    // Trigger autocomplete on certain keys
    if (e.key === ' ' || e.key === '.' || /[a-zA-Z]/.test(e.key)) {
      setTimeout(() => {
        if (editorRef.current) {
          const position = editorRef.current.selectionStart;
          updateAutocomplete(value, position);
        }
      }, 0);
    }
  };
  
  const handleAutocompleteSelect = (item: AutocompleteItem) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    // Find the start of the current word
    let wordStart = start;
    while (wordStart > 0 && /[a-zA-Z0-9_]/.test(value[wordStart - 1])) {
      wordStart--;
    }
    
    const insertText = item.insertText || item.label;
    const newValue = value.substring(0, wordStart) + insertText + value.substring(end);
    const newCursorPosition = wordStart + insertText.length;
    
    onChange(newValue);
    setShowAutocomplete(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = newCursorPosition;
    }, 0);
  };
  
  const clearQuery = () => {
    onChange('');
    setShowAutocomplete(false);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };
  
  const copyQuery = () => {
    navigator.clipboard.writeText(value);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    if (showAutocomplete && !editorRef.current?.contains(e.target as Node)) {
      setShowAutocomplete(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAutocomplete]);
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center">
          <div className="text-sm font-medium mr-4">YQL Query</div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Lightbulb size={12} className="mr-1" />
            <span>Ctrl+Space for suggestions</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={clearQuery}
            title="Clear query"
          >
            <Trash size={16} />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            onClick={copyQuery}
            title="Copy query"
          >
            <Copy size={16} />
          </button>
          <button 
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            title="Save query"
          >
            <Save size={16} />
          </button>
          <button 
            className={`p-1.5 rounded font-medium flex items-center ${
              isExecuting 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 cursor-not-allowed' 
                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/40'
            }`}
            onClick={onExecute}
            disabled={isExecuting}
            title="Execute query (Ctrl+Enter)"
          >
            <Play size={16} className="mr-1" />
            <span>Run</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        {/* Syntax highlighting overlay */}
        <div
          ref={highlighterRef}
          className="absolute inset-0 p-4 font-mono text-sm pointer-events-none overflow-auto whitespace-pre-wrap break-words"
          style={{ 
            color: 'transparent',
            caretColor: '#111', // Or any visible color
            lineHeight: '1.5'
          }}
        >
          <SyntaxHighlighter code={value} />
        </div>
        
        {/* Actual textarea */}
        <textarea
          ref={editorRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          className="absolute inset-0 w-full h-full p-4 resize-none font-mono text-sm bg-transparent caret-gray-900 dark:caret-gray-100 outline-none overflow-auto whitespace-pre-wrap break-words"
          style={{ 
            lineHeight: '1.5',
            caretColor: 'currentColor'
          }}
          placeholder="--players name, season in afcwest where record > .500 between 2020 and now"
          spellCheck={false}
        />
        
        {/* Autocomplete dropdown */}
        {showAutocomplete && (
          <AutocompleteDropdown
            items={autocompleteItems}
            selectedIndex={selectedAutocompleteIndex}
            onSelect={handleAutocompleteSelect}
            position={autocompletePosition}
          />
        )}
      </div>
    </div>
  );
};

export default QueryEditor;