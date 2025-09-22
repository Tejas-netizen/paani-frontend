import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-argo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-ocean-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌊</span>
            </div>
            <h1 className="text-2xl font-bold text-ocean-900">FloatChat</h1>
          </div>
          <p className="text-ocean-700">Manage your account settings</p>
        </div>

        {/* Clerk UserProfile Component */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <UserProfile 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-ocean-600 hover:bg-ocean-700 text-white',
                card: 'shadow-none',
                headerTitle: 'text-ocean-900',
                headerSubtitle: 'text-gray-600',
                formFieldInput: 'border-gray-300 focus:border-ocean-500 focus:ring-ocean-500',
                footerActionLink: 'text-ocean-600 hover:text-ocean-700',
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <a 
            href="/dashboard"
            className="text-ocean-600 hover:text-ocean-700 text-sm font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
