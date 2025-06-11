export interface SyntaxToken {
  type: 'keyword' | 'table' | 'column' | 'string' | 'number' | 'operator' | 'function' | 'comment' | 'default';
  value: string;
  start: number;
  end: number;
}

export interface AutocompleteItem {
  label: string;
  type: 'keyword' | 'table' | 'column' | 'function';
  description?: string;
  insertText?: string;
}

// YQL Keywords
export const YQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'JOIN', 'INNER', 'LEFT', 'RIGHT', 'OUTER',
  'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'DISTINCT',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'AND', 'OR', 'NOT', 'IN',
  'LIKE', 'BETWEEN', 'IS', 'NULL', 'AS', 'ON', 'UNION', 'ALL',
  'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'TABLE'
];

// NFL Database Schema for autocomplete
export const NFL_TABLES = [
  'players', 'teams', 'games', 'player_stats', 'stadiums'
];

export const NFL_COLUMNS = {
  players: ['player_id', 'name', 'team_id', 'position', 'jersey_number', 'height', 'weight', 'birth_date', 'college'],
  teams: ['team_id', 'name', 'city', 'abbreviation', 'conference', 'division', 'stadium_id'],
  games: ['game_id', 'season', 'week', 'home_team_id', 'away_team_id', 'home_score', 'away_score', 'game_date', 'stadium_id'],
  player_stats: ['stat_id', 'player_id', 'game_id', 'passing_yards', 'passing_tds', 'rushing_yards', 'rushing_tds', 'receiving_yards', 'receiving_tds', 'tackles', 'sacks', 'interceptions'],
  stadiums: ['stadium_id', 'name', 'city', 'state', 'capacity', 'surface_type', 'roof_type']
};

export const SQL_FUNCTIONS = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'UPPER', 'LOWER', 'LENGTH',
  'SUBSTRING', 'CONCAT', 'ROUND', 'FLOOR', 'CEIL', 'ABS', 'NOW', 'DATE'
];

export function tokenizeYQL(query: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let i = 0;
  
  while (i < query.length) {
    const char = query[i];
    
    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }
    
    // Comments
    if (char === '-' && query[i + 1] === '-') {
      const start = i;
      while (i < query.length && query[i] !== '\n') {
        i++;
      }
      tokens.push({
        type: 'comment',
        value: query.slice(start, i),
        start,
        end: i
      });
      continue;
    }
    
    // String literals
    if (char === '"' || char === "'") {
      const quote = char;
      const start = i;
      i++; // Skip opening quote
      while (i < query.length && query[i] !== quote) {
        if (query[i] === '\\') i++; // Skip escaped characters
        i++;
      }
      if (i < query.length) i++; // Skip closing quote
      tokens.push({
        type: 'string',
        value: query.slice(start, i),
        start,
        end: i
      });
      continue;
    }
    
    // Numbers
    if (/\d/.test(char)) {
      const start = i;
      while (i < query.length && /[\d.]/.test(query[i])) {
        i++;
      }
      tokens.push({
        type: 'number',
        value: query.slice(start, i),
        start,
        end: i
      });
      continue;
    }
    
    // Operators
    if (/[=<>!+\-*/%(),;]/.test(char)) {
      const start = i;
      if ((char === '<' || char === '>' || char === '!' || char === '=') && query[i + 1] === '=') {
        i += 2;
      } else {
        i++;
      }
      tokens.push({
        type: 'operator',
        value: query.slice(start, i),
        start,
        end: i
      });
      continue;
    }
    
    // Identifiers (keywords, tables, columns)
    if (/[a-zA-Z_]/.test(char)) {
      const start = i;
      while (i < query.length && /[a-zA-Z0-9_]/.test(query[i])) {
        i++;
      }
      const value = query.slice(start, i);
      const upperValue = value.toUpperCase();
      
      let type: SyntaxToken['type'] = 'default';
      if (YQL_KEYWORDS.includes(upperValue)) {
        type = 'keyword';
      } else if (NFL_TABLES.includes(value.toLowerCase())) {
        type = 'table';
      } else if (SQL_FUNCTIONS.includes(upperValue)) {
        type = 'function';
      } else {
        // Check if it might be a column name
        const isColumn = Object.values(NFL_COLUMNS).some(columns => 
          columns.includes(value.toLowerCase())
        );
        if (isColumn) {
          type = 'column';
        }
      }
      
      tokens.push({
        type,
        value,
        start,
        end: i
      });
      continue;
    }
    
    // Default case
    i++;
  }
  
  return tokens;
}

export function getAutocompleteItems(query: string, cursorPosition: number): AutocompleteItem[] {
  const beforeCursor = query.slice(0, cursorPosition).toLowerCase();
  const words = beforeCursor.split(/\s+/);
  const lastWord = words[words.length - 1] || '';
  const secondLastWord = words[words.length - 2] || '';
  
  const items: AutocompleteItem[] = [];
  
  // Context-aware suggestions
  if (beforeCursor.includes('from') && !beforeCursor.includes('where')) {
    // Suggest tables after FROM
    NFL_TABLES.forEach(table => {
      if (table.startsWith(lastWord)) {
        items.push({
          label: table,
          type: 'table',
          description: `Table: ${table}`,
          insertText: table
        });
      }
    });
  } else if (beforeCursor.includes('select') && !beforeCursor.includes('from')) {
    // Suggest columns and functions after SELECT
    Object.entries(NFL_COLUMNS).forEach(([table, columns]) => {
      columns.forEach(column => {
        if (column.startsWith(lastWord)) {
          items.push({
            label: column,
            type: 'column',
            description: `Column from ${table}`,
            insertText: column
          });
        }
      });
    });
    
    SQL_FUNCTIONS.forEach(func => {
      if (func.toLowerCase().startsWith(lastWord)) {
        items.push({
          label: func,
          type: 'function',
          description: `Function: ${func}`,
          insertText: `${func}()`
        });
      }
    });
  } else if (secondLastWord === 'where' || secondLastWord === 'and' || secondLastWord === 'or') {
    // Suggest columns for WHERE conditions
    Object.entries(NFL_COLUMNS).forEach(([table, columns]) => {
      columns.forEach(column => {
        if (column.startsWith(lastWord)) {
          items.push({
            label: column,
            type: 'column',
            description: `Column from ${table}`,
            insertText: column
          });
        }
      });
    });
  }
  
  // Always suggest keywords
  YQL_KEYWORDS.forEach(keyword => {
    if (keyword.toLowerCase().startsWith(lastWord)) {
      items.push({
        label: keyword,
        type: 'keyword',
        description: `Keyword: ${keyword}`,
        insertText: keyword
      });
    }
  });
  
  // Remove duplicates and sort
  const uniqueItems = items.filter((item, index, self) => 
    index === self.findIndex(i => i.label === item.label)
  );
  
  return uniqueItems.sort((a, b) => {
    // Prioritize by relevance and type
    const typeOrder = { keyword: 0, table: 1, column: 2, function: 3 };
    const aOrder = typeOrder[a.type] || 4;
    const bOrder = typeOrder[b.type] || 4;
    
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.label.localeCompare(b.label);
  }).slice(0, 10); // Limit to 10 suggestions
}