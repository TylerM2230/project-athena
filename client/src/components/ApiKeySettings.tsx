import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ApiKeySettings({ isOpen, onClose }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedApiKey = localStorage.getItem('gemini_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
      setIsSaved(true);
      
      // Show success feedback
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleRemove = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsSaved(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-term-bg/90 flex items-center justify-center z-50 p-4">
      <div className="modal-terminal w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-term-border">
          <div className="flex items-center">
            <Key className="h-5 w-5 text-term-accent mr-3" />
            <h2 className="text-lg font-mono text-term-text">API Key Settings</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-term-text-dim hover:text-term-text font-mono"
          >
            close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-term-text-dim font-mono mb-3">
              Enter your Gemini API key to enable AI-powered task breakdown and Socratic guidance.
            </p>
            <p className="text-xs text-term-text-dim font-mono mb-4">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-mono text-term-text mb-2">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key..."
                  className="w-full input-cyber pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-term-text-dim hover:text-term-text"
                >
                  {showApiKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {isSaved && (
              <div className="flex items-center text-green-400 text-sm font-mono">
                <Check className="h-4 w-4 mr-2" />
                API key saved successfully
              </div>
            )}

            <div className="text-xs text-term-text-dim font-mono space-y-1">
              <p>• Get your free API key at <span className="text-term-accent">ai.google.dev</span></p>
              <p>• Without an API key, the AI Guide will work in fallback mode</p>
              <p>• Your key is stored securely in your browser's local storage</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-term-border p-4 flex justify-between">
          <div>
            {isSaved && (
              <button
                onClick={handleRemove}
                className="btn-secondary flex items-center text-red-400 border-red-400/30 hover:border-red-400/50"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Key
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="btn-primary flex items-center"
            >
              <Check className="h-4 w-4 mr-2" />
              Save Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}