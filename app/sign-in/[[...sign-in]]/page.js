import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 to-argo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-ocean-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">🌊</span>
            </div>
            <h1 className="text-2xl font-bold text-ocean-900">FloatChat</h1>
          </div>
          <p className="text-ocean-700">Sign in to access your oceanographic data dashboard</p>
        </div>

        {/* Clerk Sign-In Component */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-ocean-600 hover:bg-ocean-700 text-white',
                card: 'shadow-none',
                headerTitle: 'text-ocean-900',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'border-gray-300 hover:bg-gray-50',
                formFieldInput: 'border-gray-300 focus:border-ocean-500 focus:ring-ocean-500',
                footerActionLink: 'text-ocean-600 hover:text-ocean-700',
              },
            }}
            redirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Smart India Hackathon 2025 - Problem Statement SIH25040 (MoES, INCOIS)
          </p>
        </div>
      </div>
    </div>
  );
}
