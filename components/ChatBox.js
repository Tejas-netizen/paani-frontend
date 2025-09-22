'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MessageSquare, Copy, Check, RefreshCw, Lightbulb, HelpCircle } from 'lucide-react';

export default function ChatBox({ onQueryResult }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '🌊 Welcome to FloatChat AI! I\'m your oceanographic data assistant.\n\nI can help you analyze ARGO float data with natural language queries. Here are some things you can ask me:\n\n🔍 **Data Queries:**\n• "Show me all active ARGO floats"\n• "Get temperature profiles for float 6901234"\n• "Find floats near latitude 15.5, longitude 70.2"\n\n📊 **Analysis:**\n• "Compare salinity levels in different regions"\n• "Show me floats deployed in the last 6 months"\n• "What\'s the average temperature at 100m depth?"\n\nTry clicking on the demo queries below or type your own question!',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const retryQuery = async (originalQuery) => {
    setInputValue(originalQuery);
    // Auto-submit the retry
    setTimeout(() => {
      const form = document.querySelector('form');
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 100);
  };

  const explainData = (data) => {
    try {
      const results = data?.results || [];
      if (!results.length) {
        setMessages(prev => [...prev, { id: Date.now() + 2, type: 'bot', content: 'No results available to explain.', timestamp: new Date() }]);
        return;
      }

      const maxSample = Math.min(100, results.length);
      const sample = results.slice(0, maxSample);

      const allKeys = Array.from(new Set(sample.flatMap(r => Object.keys(r))));
      const numericKeys = allKeys.filter(k => sample.some(r => typeof r[k] === 'number' || (!isNaN(parseFloat(r[k])) && r[k] !== null)));
      const categoricalKeys = allKeys.filter(k => !numericKeys.includes(k));

      const lines = [];
      lines.push(`Results: ${results.length} rows. Columns: ${allKeys.join(', ')}.`);

      // Simple stats for up to 3 numeric columns
      numericKeys.slice(0, 3).forEach((k) => {
        const nums = sample
          .map(r => typeof r[k] === 'number' ? r[k] : parseFloat(r[k]))
          .filter(v => !Number.isNaN(v));
        if (!nums.length) return;
        const min = Math.min(...nums);
        const max = Math.max(...nums);
        const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
        lines.push(`${k}: avg ${avg.toFixed(3)}, min ${min.toFixed(3)}, max ${max.toFixed(3)} (based on ${nums.length} values).`);
      });

      // Simple top categories for up to 2 categorical columns
      categoricalKeys.slice(0, 2).forEach((k) => {
        const freq = new Map();
        sample.forEach(r => {
          const val = r[k];
          if (val === undefined || val === null || val === '') return;
          freq.set(val, (freq.get(val) || 0) + 1);
        });
        const top = Array.from(freq.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3);
        if (top.length) {
          const desc = top.map(([v, c]) => `${v} (${c})`).join(', ');
          lines.push(`${k}: top values → ${desc}.`);
        }
      });

      // Include a small preview row
      const first = sample[0];
      if (first) {
        const preview = allKeys.slice(0, 6).map(k => `${k}=${first[k] ?? 'N/A'}`).join(' | ');
        lines.push(`Example row: ${preview}`);
      }

      const content = `Data insight (plain text)\n\n${lines.join('\n')}`;
      setMessages(prev => [...prev, { id: Date.now() + 3, type: 'bot', content, timestamp: new Date() }]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 4, type: 'bot', content: 'Failed to summarize results.', timestamp: new Date() }]);
    }
  };

  const suggestAlternatives = async (originalQuery) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: originalQuery })
      });
      const data = await response.json();
      const suggestions = (data.success && data.data?.suggestions?.length)
        ? data.data.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
        : 'No suggestions available.';
      const botMessage = {
        id: Date.now() + 4,
        type: 'bot',
        content: `💡 Suggestions:\n\n${suggestions}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      setMessages(prev => [...prev, { id: Date.now() + 5, type: 'bot', content: '❌ Failed to fetch suggestions.', timestamp: new Date() }]);
    }
  };

  const exportToCSV = (data, query) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => `"${row[header] || ''}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `floatchat-${query.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const generateBotResponse = (data, query) => {
    const { results, count, sqlQuery } = data;
    
    let response = `✅ **Query Results:** Found ${count} records\n\n`;
    
    // Format the actual results first (most important)
    if (results && results.length > 0) {
      response += `📊 **Data Results:**\n\n`;
      
      // Show first few results in a readable format
      const displayResults = results.slice(0, 3); // Show first 3 results
      
      displayResults.forEach((result, index) => {
        response += `**${index + 1}.** `;
        
        // Format based on the type of data
        if (result.float_id) {
          response += `Float ID: ${result.float_id}`;
          if (result.latitude && result.longitude) {
            response += ` | Location: ${result.latitude}°N, ${result.longitude}°E`;
          }
          if (result.status) {
            response += ` | Status: ${result.status}`;
          }
          if (result.ocean_region) {
            response += ` | Region: ${result.ocean_region}`;
          }
          if (result.total_profiles) {
            response += ` | Profiles: ${result.total_profiles}`;
          }
        } else if (result.depth !== undefined) {
          response += `Depth: ${result.depth}m`;
          if (result.temperature !== undefined) {
            response += ` | Temperature: ${result.temperature}°C`;
          }
          if (result.salinity !== undefined) {
            response += ` | Salinity: ${result.salinity} PSU`;
          }
        } else {
          // Generic formatting for other data types
          const entries = Object.entries(result);
          response += entries.map(([key, value]) => `${key}: ${value}`).join(' | ');
        }
        
        response += '\n';
      });
      
      if (results.length > 3) {
        response += `\n... and ${results.length - 3} more results (see detailed view below)\n`;
      }
    }
    
    response += `\n💡 **Visualization:** The data has been loaded into the map and charts for interactive exploration!`;
    
    if (data.summary) {
      response = `📝 **Summary:** ${data.summary}\n\n` + response;
    }
    
    return response;
  };

  const formatMessageContent = (content) => {
    if (!content) return '';
    
    // Simple formatting - just return the content as is
    return content;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: inputValue }),
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.success 
          ? generateBotResponse(data.data, inputValue)
          : `❌ I encountered an error processing your query.\n\n**Error:** ${data.message || 'Failed to process your query.'}\n\n💡 **Suggestions:**\n• Try rephrasing your question\n• Check if the query is related to ARGO float data\n• Use the demo queries below as examples`,
        timestamp: new Date(),
        data: data.success ? data.data : null,
        error: !data.success,
        originalQuery: inputValue,
      };

      setMessages(prev => [...prev, botMessage]);

      // Pass results to parent component
      if (data.success && onQueryResult) {
        onQueryResult(data.data);
      }
    } catch (error) {
      console.error('Error sending query:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your query. Please try again.',
        timestamp: new Date(),
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const demoQueries = [
    "Show me all active ARGO floats",
    "Get temperature profiles for float 6901234",
    "Find floats near latitude 15.5, longitude 70.2",
    "Show salinity data at 100m depth for all floats",
    "How many floats are in the Arabian Sea?",
    "Compare oxygen levels in different regions",
  ];

  // Master prompt demo queries
  const masterDemoQueries = [
    "Show salinity profiles near equator",
    "Floats near 15°N, 70°E",
    "Temperature at 100m depth in Arabian Sea"
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg h-[800px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5 text-ocean-600" />
          <h3 className="text-lg font-semibold text-gray-900">AI Chat Assistant</h3>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[500px]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.type === 'user'
                  ? 'bg-ocean-600 text-white'
                  : message.error
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'bot' && (
                  <Bot className="h-4 w-4 mt-0.5 flex-shrink-0 text-ocean-700" />
                )}
                {message.type === 'user' && (
                  <User className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="text-sm whitespace-pre-wrap text-gray-900">
                    {message.content}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    <button
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      {copiedMessageId === message.id ? (
                        <>
                          <Check className="h-3 w-3 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                    
                    {message.data && message.data.results && message.data.results.length > 0 && (
                      <button
                        onClick={() => exportToCSV(message.data.results, message.data.naturalQuery)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors"
                      >
                        <span>📊</span>
                        <span>Export CSV</span>
                      </button>
                    )}

                    {message.data && (
                      <button
                        onClick={() => explainData(message.data)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded transition-colors"
                      >
                        <Lightbulb className="h-3 w-3" />
                        <span>Explain</span>
                      </button>
                    )}
                    {message.originalQuery && (
                      <button
                        onClick={() => suggestAlternatives(message.originalQuery)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-purple-100 hover:bg-purple-200 text-purple-800 rounded transition-colors"
                      >
                        <HelpCircle className="h-3 w-3" />
                        <span>Suggest</span>
                      </button>
                    )}
                    
                    {message.error && message.originalQuery && (
                      <button
                        onClick={() => retryQuery(message.originalQuery)}
                        className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>

                  {message.data && message.data.results && message.data.results.length > 0 && (
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
                      <p className="font-medium text-gray-800 mb-3 text-sm">📊 Query Results ({message.data.count} records):</p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {message.data.results.slice(0, 10).map((result, index) => (
                          <div key={index} className="bg-white p-3 rounded border text-xs">
                            <div className="font-medium text-gray-700 mb-1">Record {index + 1}:</div>
                            <div className="space-y-1">
                              {Object.entries(result).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800">{value || 'N/A'}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {message.data.results.length > 10 && (
                          <div className="text-center text-xs text-gray-500 py-2">
                            ... and {message.data.results.length - 10} more records
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center space-x-2 text-gray-900">
              <Bot className="h-4 w-4 text-ocean-600" />
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-ocean-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <span className="text-sm text-gray-600">Analyzing your query...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Master Demo Queries */}
      <div className="p-4 border-t border-gray-200 bg-blue-50">
        <p className="text-xs text-blue-800 mb-3 font-medium">🏆 Master Demo Queries (SIH 2025):</p>
        <div className="grid grid-cols-1 gap-2">
          {masterDemoQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => setInputValue(query)}
              className="text-left text-xs px-3 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-100 hover:text-blue-800 transition-colors border border-blue-200 hover:border-blue-300 font-medium"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Demo Queries */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 mb-3 font-medium">💡 Try these demo queries:</p>
        <div className="grid grid-cols-1 gap-2">
          {demoQueries.map((query, index) => (
            <button
              key={index}
              onClick={() => setInputValue(query)}
              className="text-left text-xs px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-ocean-50 hover:text-ocean-700 transition-colors border border-gray-200 hover:border-ocean-200"
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about ARGO data... (e.g., 'Show me all active floats')"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-4 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span className="text-sm font-medium">Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Try asking about floats, temperature, salinity, or ocean regions
        </p>
      </form>
    </div>
  );
}
