import React, { useState } from 'react';
import { Play, ArrowRight, Database, Zap, BarChart3, Search, Users, Trophy, Calendar, Target } from 'lucide-react';
import QuickQueryResults from './QuickQueryResults';
import { QueryResult } from '../../types';

interface HomePageProps {
  onNavigateToEditor: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigateToEditor }) => {
  const [quickQuery, setQuickQuery] = useState('');
  const [quickResults, setQuickResults] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const sampleQueries = [
    'SELECT name, team, position FROM players WHERE position = "QB" LIMIT 5',
    'SELECT team, COUNT(*) as players FROM players GROUP BY team ORDER BY players DESC LIMIT 10',
    'SELECT name, passing_yards FROM player_stats WHERE passing_yards > 300 ORDER BY passing_yards DESC',
    'SELECT home_team, away_team, home_score, away_score FROM games WHERE week = 1'
  ];

  const executeQuickQuery = async () => {
    if (!quickQuery.trim()) return;
    
    setIsExecuting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock response for demo
      const mockResult: QueryResult = {
        columns: ['name', 'team', 'position', 'jersey_number'],
        rows: [
          { name: 'Patrick Mahomes', team: 'Kansas City Chiefs', position: 'QB', jersey_number: 15 },
          { name: 'Josh Allen', team: 'Buffalo Bills', position: 'QB', jersey_number: 17 },
          { name: 'Aaron Rodgers', team: 'New York Jets', position: 'QB', jersey_number: 8 },
          { name: 'Lamar Jackson', team: 'Baltimore Ravens', position: 'QB', jersey_number: 8 },
          { name: 'Dak Prescott', team: 'Dallas Cowboys', position: 'QB', jersey_number: 4 }
        ],
        executionTime: 0.08,
        rowCount: 5
      };
      
      setQuickResults(mockResult);
    } catch (error) {
      console.error('Error executing query:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSampleQuery = (query: string) => {
    setQuickQuery(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeQuickQuery();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 dark:from-blue-400/5 dark:to-indigo-400/5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-2xl shadow-lg">
                <Database className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                yac-db
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Query professional football data with <strong>YQL</strong> (yac query language) — 
              a SQL-like syntax designed specifically for football analytics
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-12">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-2" />
                <span>Player Statistics</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-4 h-4 mr-2" />
                <span>Team Performance</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Game Results</span>
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-2" />
                <span>Advanced Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Query Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">Try YQL Now</h2>
            <p className="text-blue-100">Write a query and see instant results</p>
          </div>
          
          <div className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Enter your YQL query:
              </label>
              <div className="relative">
                <textarea
                  value={quickQuery}
                  onChange={(e) => setQuickQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="SELECT name, team, position FROM players WHERE position = 'QB' LIMIT 10"
                />
                <div className="absolute bottom-3 right-3 flex items-center space-x-2">
                  <span className="text-xs text-gray-400 dark:text-gray-500">Ctrl+Enter to run</span>
                  <button
                    onClick={executeQuickQuery}
                    disabled={isExecuting || !quickQuery.trim()}
                    className={`px-4 py-2 rounded-lg font-medium flex items-center transition-all duration-200 ${
                      isExecuting || !quickQuery.trim()
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isExecuting ? 'Running...' : 'Run Query'}
                  </button>
                </div>
              </div>
            </div>

            {/* Sample Queries */}
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Try these examples:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sampleQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSampleQuery(query)}
                    className="text-left p-3 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-200 group"
                  >
                    <code className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {query}
                    </code>
                  </button>
                ))}
              </div>
            </div>

            {/* Results */}
            {quickResults && (
              <div className="mb-8">
                <QuickQueryResults results={quickResults} />
              </div>
            )}

            {/* Call to Action */}
            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onNavigateToEditor}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                <span>Open Full Editor</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Lightning Fast</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Optimized queries return results in milliseconds, even with complex joins and aggregations.
            </p>
          </div>

          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Visual Analytics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Transform your query results into beautiful charts and graphs with one click.
            </p>
          </div>

          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Smart Schema</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explore the complete NFL database schema with intelligent suggestions and auto-completion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;