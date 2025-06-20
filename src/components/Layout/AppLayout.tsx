import React, { useState } from 'react';
import Sidebar from './Sidebar';
import QueryEditor from '../QueryEditor/QueryEditor';
import ResultsPanel from '../Results/ResultsPanel';
import HomePage from '../Home/HomePage';
import { QueryResult } from '../../types';
import { Database, Home } from 'lucide-react';
import ThemeToggle from '../UI/ThemeToggle';

const AppLayout: React.FC = () => {
  const [currentView, setCurrentView] = useState<'home' | 'editor'>('home');
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [queryResults, setQueryResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  
  const handleQueryChange = (query: string) => {
    setCurrentQuery(query);
  };

  const executeQuery = async () => {
    if (!currentQuery.trim()) return;
    
    setIsExecuting(true);
    
    try {

      const response = await fetch('https://localhost:50572/yql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: currentQuery })
      });

      const result: any[] = await response.json();

      // Find the object with the most keys
      const widest = result.reduce((max, curr) => {
        return Object.keys(curr).length > Object.keys(max).length ? curr : max;
      }, result[0]);

      
      const mockResult: QueryResult = {
        columns: Object.keys(widest),
        rows: result,
        executionTime: 0.12,
        rowCount: 5
      };
      
      setQueryResults(mockResult);
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      setIsExecuting(false);
    }
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const startY = e.clientY;
    const startSplit = splitPosition;
    
    const handleMouseMove = (e: MouseEvent) => {
      const containerHeight = window.innerHeight - 64; // Accounting for header
      const newPosition = startSplit + ((e.clientY - startY) / containerHeight * 100);
      setSplitPosition(Math.min(Math.max(20, newPosition), 80));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const navigateToEditor = () => {
    setCurrentView('editor');
  };

  const navigateToHome = () => {
    setCurrentView('home');
  };

  if (currentView === 'home') {
    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 shadow-sm">
          <div className="flex items-center">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h1 className="text-xl font-bold">yac-db</h1>
          </div>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <HomePage onNavigateToEditor={navigateToEditor} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 shadow-sm">
        <div className="flex items-center">
          <button
            onClick={navigateToHome}
            className="flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200 mr-2"
            title="Go to home"
          >
            <Home className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
          </button>
          <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" />
          <h1 className="text-xl font-bold">yac-db</h1>
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Editor</span>
        </div>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 flex flex-col overflow-hidden">
          <div 
            className="flex-none" 
            style={{ height: `${splitPosition}%` }}
          >
            <QueryEditor 
              value={currentQuery} 
              onChange={handleQueryChange} 
              onExecute={executeQuery}
              isExecuting={isExecuting}
            />
          </div>
          
          <div 
            className="h-2 bg-gray-200 dark:bg-gray-700 cursor-row-resize flex items-center justify-center"
            onMouseDown={handleMouseDown}
          >
            <div className="w-8 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <ResultsPanel results={queryResults} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;