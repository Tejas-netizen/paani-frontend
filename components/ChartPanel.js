'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Thermometer, Droplets, Activity, TrendingUp } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ChartPanel({ floats, selectedFloat, queryResults }) {
  const [chartData, setChartData] = useState(null);
  const [chartType, setChartType] = useState('temperature');
  const [loading, setLoading] = useState(false);
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

  // Auto-switch to query_results when new query results arrive
  useEffect(() => {
    if (queryResults && queryResults.results && queryResults.results.length > 0) {
      setChartType('query_results');
      generateChartData(queryResults, 'query_results');
    }
  }, [queryResults]);

  useEffect(() => {
    if (selectedFloat) {
      fetchFloatProfiles(selectedFloat.float_id);
    } else if (chartType === 'distribution') {
      // Keep distribution chart responsive to floats changes
      generateChartData(floats, 'distribution');
    }
  }, [selectedFloat, floats]);

  const fetchFloatProfiles = async (floatId) => {
    try {
      setLoading(true);
      if (!API_BASE) throw new Error('API base URL not configured');
      const response = await fetch(`${API_BASE}/api/profiles/${floatId}`);
      const data = await response.json();
      
      if (data.success) {
        generateChartData(data.data, chartType);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (profiles, type) => {
    if (!profiles || profiles.length === 0) {
      setChartData(null);
      return;
    }

    let chartConfig = {};

    switch (type) {
      case 'temperature':
        chartConfig = {
          data: [{
            x: profiles.map(p => p.depth).filter(d => d !== null),
            y: profiles.map(p => p.temperature).filter(t => t !== null),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Temperature',
            line: { color: '#0ea5e9' },
            marker: { size: 6 }
          }],
          layout: {
            title: 'Temperature vs Depth Profile',
            xaxis: { title: 'Depth (m)', autorange: 'reversed' },
            yaxis: { title: 'Temperature (°C)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#374151' }
          }
        };
        break;

      case 'salinity':
        chartConfig = {
          data: [{
            x: profiles.map(p => p.depth).filter(d => d !== null),
            y: profiles.map(p => p.salinity).filter(s => s !== null),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Salinity',
            line: { color: '#22c55e' },
            marker: { size: 6 }
          }],
          layout: {
            title: 'Salinity vs Depth Profile',
            xaxis: { title: 'Depth (m)', autorange: 'reversed' },
            yaxis: { title: 'Salinity (PSU)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#374151' }
          }
        };
        break;

      case 'oxygen':
        chartConfig = {
          data: [{
            x: profiles.map(p => p.depth).filter(d => d !== null),
            y: profiles.map(p => p.oxygen).filter(o => o !== null),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Oxygen',
            line: { color: '#f59e0b' },
            marker: { size: 6 }
          }],
          layout: {
            title: 'Oxygen vs Depth Profile',
            xaxis: { title: 'Depth (m)', autorange: 'reversed' },
            yaxis: { title: 'Oxygen (mg/L)' },
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#374151' }
          }
        };
        break;

      case 'distribution':
        if (floats && floats.length > 0) {
          const regions = floats.map(f => f.ocean_region).filter(r => r);
          if (regions.length > 0) {
            chartConfig = {
              data: [{
                x: regions,
                type: 'histogram',
                name: 'Floats by Region',
                marker: { color: '#8b5cf6' }
              }],
              layout: {
                title: 'Float Distribution by Ocean Region',
                xaxis: { title: 'Ocean Region' },
                yaxis: { title: 'Number of Floats' },
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#374151' }
              }
            };
          } else {
            chartConfig = {
              data: [],
              layout: {
                title: 'No Ocean Region Data Available',
                plot_bgcolor: 'rgba(0,0,0,0)',
                paper_bgcolor: 'rgba(0,0,0,0)',
                font: { color: '#374151' }
              }
            };
          }
        } else {
          chartConfig = {
            data: [],
            layout: {
              title: 'No Float Data Available',
              plot_bgcolor: 'rgba(0,0,0,0)',
              paper_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#374151' }
            }
          };
        }
        break;

      case 'query_results':
        if (queryResults && queryResults.results && queryResults.results.length > 0) {
          // Create a simple table visualization for query results
          const results = queryResults.results.slice(0, 10); // Limit to 10 results
          const columns = Object.keys(results[0] || {});
          
          chartConfig = {
            data: [{
              type: 'table',
              header: {
                values: columns,
                fill: { color: '#0ea5e9' },
                font: { color: 'white', size: 12 }
              },
              cells: {
                values: columns.map(col => results.map(row => row[col])),
                fill: { color: [['#f8fafc'], ['#eef2f7']] },
                font: { size: 10 }
              }
            }],
            layout: {
              title: `Query Results (${queryResults.count} total)`,
              plot_bgcolor: 'rgba(0,0,0,0)',
              paper_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#374151' }
            }
          };
        } else {
          chartConfig = {
            data: [],
            layout: {
              title: 'No Query Results Available',
              plot_bgcolor: 'rgba(0,0,0,0)',
              paper_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#374151' }
            }
          };
        }
        break;

      default:
        setChartData(null);
        return;
    }

    setChartData(chartConfig);
  };

  const chartTypes = [
    { id: 'temperature', label: 'Temperature', icon: Thermometer, color: 'text-blue-600' },
    { id: 'salinity', label: 'Salinity', icon: Droplets, color: 'text-green-600' },
    { id: 'oxygen', label: 'Oxygen', icon: Activity, color: 'text-yellow-600' },
    { id: 'distribution', label: 'Distribution', icon: TrendingUp, color: 'text-purple-600' },
    { id: 'query_results', label: 'Query Results', icon: BarChart3, color: 'text-ocean-600' },
  ];

  const handleChartTypeChange = (type) => {
    setChartType(type);
    
    // Clear current chart data first
    setChartData(null);
    
    if (type === 'query_results') {
      // Show query results if available
      if (queryResults && queryResults.results && queryResults.results.length > 0) {
        generateChartData(queryResults, type);
      } else {
        setChartData({
          data: [],
          layout: {
            title: 'No Query Results Available',
            plot_bgcolor: 'rgba(0,0,0,0)',
            paper_bgcolor: 'rgba(0,0,0,0)',
            font: { color: '#374151' }
          }
        });
      }
    } else if (type === 'distribution') {
      // Show float distribution
      generateChartData(floats, type);
    } else if (selectedFloat) {
      // Show profile data for selected float
      fetchFloatProfiles(selectedFloat.float_id);
    } else {
      // No float selected, show empty state
      setChartData({
        data: [],
        layout: {
          title: `No ${type} data available`,
          plot_bgcolor: 'rgba(0,0,0,0)',
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#374151' }
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-ocean-600" />
            <span>Data Visualization</span>
          </h3>
          {selectedFloat && (
            <div className="text-sm text-gray-500">
              Float {selectedFloat.float_id}
            </div>
          )}
        </div>

        {/* Chart Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
          {chartTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleChartTypeChange(type.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  chartType === type.id
                    ? 'bg-ocean-100 text-ocean-700 border border-ocean-200'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className={`h-4 w-4 ${type.color}`} />
                <span>{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* Chart Container */}
        <div className="bg-gray-50 rounded-lg p-4 min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
            </div>
          ) : chartData ? (
            <Plot
              data={chartData.data}
              layout={chartData.layout}
              style={{ width: '100%', height: '400px' }}
              config={{ responsive: true, displayModeBar: false }}
            />
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No data available for visualization</p>
                {!selectedFloat && (
                  <p className="text-sm mt-2">Select a float to view its profile data</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Query Results Summary */}
      {queryResults && (
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Query Results Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-ocean-50 rounded-lg p-3">
              <p className="text-sm text-ocean-600 font-medium">Total Results</p>
              <p className="text-2xl font-bold text-ocean-900">{queryResults.count}</p>
            </div>
            <div className="bg-argo-50 rounded-lg p-3">
              <p className="text-sm text-argo-600 font-medium">Query Type</p>
              <p className="text-sm font-bold text-argo-900">Natural Language</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm text-gray-600 font-medium">Status</p>
              <p className="text-sm font-bold text-gray-900">Success</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
