import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Waves, MapPin, BarChart3, MessageCircle } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-ocean-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Waves className="h-8 w-8 text-ocean-600 wave-animation" />
              <h1 className="text-2xl font-bold text-ocean-900">FloatChat</h1>
            </div>
            <div className="flex items-center space-x-4">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <a 
                  href="/sign-in"
                  className="bg-ocean-600 text-white px-4 py-2 rounded-lg hover:bg-ocean-700 transition-colors"
                >
                  Sign In
                </a>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <SignedOut>
          <div className="text-center">
            <div className="mb-8">
              <Waves className="h-24 w-24 text-ocean-600 mx-auto mb-6 float-animation" />
              <h1 className="text-5xl font-bold text-ocean-900 mb-4">
                FloatChat
              </h1>
              <p className="text-xl text-ocean-700 mb-8 max-w-3xl mx-auto">
                AI-Powered Conversational System for Oceanographic Data Analysis
              </p>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Smart India Hackathon 2025 - Problem Statement SIH25040 (MoES, INCOIS)
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <MapPin className="h-12 w-12 text-argo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ocean-900 mb-2">
                  ARGO Float Tracking
                </h3>
                <p className="text-gray-600">
                  Track and visualize ARGO profiling floats across the world's oceans
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <BarChart3 className="h-12 w-12 text-argo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ocean-900 mb-2">
                  Data Visualization
                </h3>
                <p className="text-gray-600">
                  Interactive charts and maps for temperature, salinity, and BGC parameters
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <MessageCircle className="h-12 w-12 text-argo-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-ocean-900 mb-2">
                  AI Chat Interface
                </h3>
                <p className="text-gray-600">
                  Natural language queries powered by Gemini AI and LangChain
                </p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-ocean-900 mb-4">
                Demo Queries
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="bg-ocean-50 rounded-lg p-4">
                  <p className="text-sm text-ocean-700">
                    "Show me salinity profiles near the equator in March 2023"
                  </p>
                </div>
                <div className="bg-ocean-50 rounded-lg p-4">
                  <p className="text-sm text-ocean-700">
                    "Compare BGC parameters in the Arabian Sea for last 6 months"
                  </p>
                </div>
                <div className="bg-ocean-50 rounded-lg p-4">
                  <p className="text-sm text-ocean-700">
                    "What are the nearest ARGO floats to this location?"
                  </p>
                </div>
                <div className="bg-ocean-50 rounded-lg p-4">
                  <p className="text-sm text-ocean-700">
                    "Temperature at 100m depth in Arabian Sea"
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ocean-900 mb-4">
              Welcome to FloatChat Dashboard
            </h1>
            <p className="text-lg text-ocean-700">
              Start exploring oceanographic data with natural language queries
            </p>
          </div>

          {/* Dashboard Access */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-8 shadow-lg">
            <div className="text-center">
              <MessageCircle className="h-16 w-16 text-ocean-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-ocean-900 mb-4">
                Dashboard Ready!
              </h2>
              <p className="text-ocean-700 mb-6">
                Your interactive dashboard with AI chat, maps, and charts is ready to use.
              </p>
              <a
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-ocean-600 text-white font-medium rounded-lg hover:bg-ocean-700 transition-colors"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Go to Dashboard
              </a>
            </div>
          </div>
        </SignedIn>
      </main>

      {/* Footer */}
      <footer className="bg-ocean-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-ocean-200">
            FloatChat - Smart India Hackathon 2025 | Problem Statement SIH25040 (MoES, INCOIS)
          </p>
        </div>
      </footer>
    </div>
  );
}
