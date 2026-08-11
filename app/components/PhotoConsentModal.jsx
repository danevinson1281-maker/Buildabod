'use client';

import { useState } from 'react';

export default function PhotoConsentModal({ isOpen, onConfirm, clientName }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOption) {
      setError('Please select an option to continue');
      return;
    }
    
    setIsLoading(true);
    // Call the parent handler which will submit the form
    onConfirm(selectedOption);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 border-2 border-yellow-700/50 rounded-2xl max-w-md w-full p-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-yellow-500 mb-2">
            📸 One Quick Question
          </p>
          <h2 className="text-2xl font-black text-white">
            Can We Share Your Progress?
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Your transformation story could inspire thousands. Here's how we'll handle your photos:
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 mb-6">
          {/* Private Option */}
          <button
            onClick={() => {
              setSelectedOption('private');
              setError('');
            }}
            className={`w-full p-4 rounded-lg border-2 transition text-left ${
              selectedOption === 'private'
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedOption === 'private'
                    ? 'border-yellow-500 bg-yellow-500'
                    : 'border-gray-600'
                }`}
              >
                {selectedOption === 'private' && (
                  <div className="w-2 h-2 bg-black rounded-full" />
                )}
              </div>
              <div>
                <p className="font-bold text-white">🔒 Private</p>
                <p className="text-xs text-gray-400 mt-1">
                  Only you can see your photos. Dane uses them for coaching only.
                </p>
              </div>
            </div>
          </button>

          {/* Public Option */}
          <button
            onClick={() => {
              setSelectedOption('public');
              setError('');
            }}
            className={`w-full p-4 rounded-lg border-2 transition text-left ${
              selectedOption === 'public'
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedOption === 'public'
                    ? 'border-yellow-500 bg-yellow-500'
                    : 'border-gray-600'
                }`}
              >
                {selectedOption === 'public' && (
                  <div className="w-2 h-2 bg-black rounded-full" />
                )}
              </div>
              <div>
                <p className="font-bold text-white">🌟 Public - Show My Results</p>
                <p className="text-xs text-gray-400 mt-1">
                  BuildABod can use your before/after in marketing (with your name or anonymously). You'll be a success story.
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Legal Text */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-6 border border-gray-700/50">
          <p className="text-xs text-gray-400 leading-relaxed">
            <strong>Your Privacy:</strong> You own all photos. You can change this setting anytime in your dashboard. We'll never use photos without permission. This is required before we create your meal plan.
          </p>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-xs mb-4 p-2 bg-red-900/20 rounded border border-red-700/30">
            {error}
          </p>
        )}

        {/* CTA Button */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 px-4 font-black rounded-lg text-black text-base transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
          style={{ backgroundColor: '#FFD700' }}
        >
          {isLoading ? '⏳ Processing...' : 'Continue to Payment'}
        </button>

        {/* Footer Text */}
        <p className="text-xs text-gray-500 text-center mt-4">
          You can update this anytime after signup
        </p>
      </div>
    </div>
  );
}
