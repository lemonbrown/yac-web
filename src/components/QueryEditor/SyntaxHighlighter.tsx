import React from 'react';
import { tokenizeYQL, SyntaxToken } from '../../utils/yqlSyntax';

interface SyntaxHighlighterProps {
  code: string;
  className?: string;
}

const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, className = '' }) => {
  const tokens = tokenizeYQL(code);
  
  const getTokenClassName = (token: SyntaxToken): string => {
    const baseClasses = 'syntax-token';
    
    switch (token.type) {
      case 'keyword':
        return `${baseClasses} text-blue-600 dark:text-blue-400 font-semibold`;
      case 'table':
        return `${baseClasses} text-green-600 dark:text-green-400 font-medium`;
      case 'column':
        return `${baseClasses} text-purple-600 dark:text-purple-400`;
      case 'string':
        return `${baseClasses} text-orange-600 dark:text-orange-400`;
      case 'number':
        return `${baseClasses} text-red-600 dark:text-red-400`;
      case 'operator':
        return `${baseClasses} text-gray-600 dark:text-gray-400 font-medium`;
      case 'function':
        return `${baseClasses} text-indigo-600 dark:text-indigo-400 font-medium`;
      case 'comment':
        return `${baseClasses} text-gray-500 dark:text-gray-500 italic`;
      default:
        return `${baseClasses} text-gray-900 dark:text-gray-100`;
    }
  };
  
  if (tokens.length === 0) {
    return <div className={className}>{code}</div>;
  }
  
  const elements: React.ReactNode[] = [];
  let lastEnd = 0;
  
  tokens.forEach((token, index) => {
    // Add any text between tokens
    if (token.start > lastEnd) {
      const betweenText = code.slice(lastEnd, token.start);
      elements.push(
        <span key={`between-${index}`} className="text-gray-900 dark:text-gray-100">
          {betweenText}
        </span>
      );
    }
    
    // Add the token
    elements.push(
      <span key={`token-${index}`} className={getTokenClassName(token)}>
        {token.value}
      </span>
    );
    
    lastEnd = token.end;
  });
  
  // Add any remaining text
  if (lastEnd < code.length) {
    elements.push(
      <span key="remaining" className="text-gray-900 dark:text-gray-100">
        {code.slice(lastEnd)}
      </span>
    );
  }
  
  return (
    <div className={className}>
      {elements}
    </div>
  );
};

export default SyntaxHighlighter;