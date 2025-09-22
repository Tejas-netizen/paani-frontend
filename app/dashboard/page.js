'use client';

import { useState, useEffect } from 'react';
import { UserButton, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { Waves, MapPin, BarChart3, MessageCircle, Search, RefreshCw } from 'lucide-react';
import ChatBox from '../../components/ChatBox';
import MapView from '../../components/MapView';
import ChartPanel from '../../components/ChartPanel';
import FloatList from '../../components/FloatList';
import NetcdfUploader from '../../components/NetcdfUploader';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [floats, setFloats] = useState([]);
  const [selectedFloat, setSelectedFloat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [queryResults, setQueryResults] = useState(null);

  // Fetch floats data on component mount
  useEffect(() => {
    fetchFloats();
  }, []);

  const fetchFloats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/floats`);
      const data = await response.json();
      
      if (data.success) {
        setFloats(data.data);
      }
    } catch (error) {
      console.error('Error fetching floats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQueryResult = (result) => {
    setQueryResults(result);
    // If the result contains float data, update the map
    if (result.data && Array.isArray(result.data)) {
      setFloats(result.data);
    }
  };

  const tabs = [
    { id: 'chat', label: 'AI Chat', icon: MessageCircle },
    { id: 'map', label: 'Map View', icon: MapPin },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'floats', label: 'Float List', icon: Waves },
  ];

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-argo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-ocean-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-ocean-600 wave-animation" />
              <h1 className="text-2xl font-bold text-ocean-900">FloatChat Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchFloats}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50 rounded-lg transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <UserButton 
                afterSignOutUrl="/"
                userProfileUrl="/user-profile"
                appearance={{
                  elements: {
                    userButtonPopoverCard: 'shadow-lg border border-gray-200',
                    userButtonPopoverActionButton: 'hover:bg-ocean-50',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-ocean-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-ocean-500 text-ocean-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'chat' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ChatBox onQueryResult={handleQueryResult} />
            </div>
            <div className="space-y-6">
              <MapView floats={floats} selectedFloat={selectedFloat} onFloatSelect={setSelectedFloat} />
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="space-y-6">
            <MapView 
              floats={floats} 
              selectedFloat={selectedFloat} 
              onFloatSelect={setSelectedFloat}
              fullHeight={true}
            />
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            <ChartPanel 
              floats={floats} 
              selectedFloat={selectedFloat}
              queryResults={queryResults}
            />
          </div>
        )}

        {activeTab === 'floats' && (
          <div className="space-y-6">
            <NetcdfUploader onIngest={fetchFloats} />
            <FloatList 
              floats={floats} 
              loading={loading}
              onFloatSelect={setSelectedFloat}
              selectedFloat={selectedFloat}
            />
          </div>
        )}
      </main>
        </div>
      </SignedIn>
      
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
