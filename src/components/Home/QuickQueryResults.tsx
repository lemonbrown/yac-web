import React from 'react';
import { QueryResult } from '../../types';
import { Clock, Database } from 'lucide-react';

interface QuickQueryResultsProps {
  results: QueryResult;
}

const QuickQueryResults: React.FC<QuickQueryResultsProps> = ({ results }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <Clock size={14} className="mr-2" />
          <span>{results.executionTime.toFixed(2)}s</span>
          <span className="mx-2">•</span>
          <span>{results.rowCount} rows</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <Database size={14} className="mr-1" />
          <span>Results</span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-100 dark:bg-gray-850">
            <tr>
              {results.columns.map((column) => (
                <th 
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {results.rows.map((row, rowIdx) => (
              <tr 
                key={rowIdx} 
                className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150"
              >
                {results.columns.map((column) => (
                  <td 
                    key={`${rowIdx}-${column}`}
                    className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300"
                  >
                    {row[column] !== null && row[column] !== undefined 
                      ? String(row[column]) 
                      : <span className="text-gray-400 dark:text-gray-600">NULL</span>
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuickQueryResults;