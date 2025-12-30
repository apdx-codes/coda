import { useState } from 'react';

interface GeneratorFormProps {
  onGenerate: (data: any) => void;
  loading: boolean;
}

export function GeneratorForm({ onGenerate, loading }: GeneratorFormProps) {
  const [projectType, setProjectType] = useState('anchor');
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [provider, setProvider] = useState('default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onGenerate({
      projectType,
      description,
      features: features.split('\n').filter(f => f.trim()),
      provider,
    });
  };

  return (
    <div className="card">
      <div className="flex items-center mb-6">
        <svg className="h-6 w-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900">Generate Code</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Project Type
          </label>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            className="input bg-white"
          >
            <option value="anchor">⚓ Anchor Program</option>
            <option value="typescript-sdk">📦 TypeScript SDK</option>
            <option value="native-rust">🦀 Native Rust Program</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to build... Be specific about features, security requirements, and functionality."
            rows={4}
            required
            className="input resize-none"
          />
          <p className="mt-1 text-xs text-gray-500">
            Example: "A token staking program with rewards distribution"
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Features <span className="text-gray-400 font-normal">(optional, one per line)</span>
          </label>
          <textarea
            value={features}
            onChange={(e) => setFeatures(e.target.value)}
            placeholder="Token minting&#10;Access control&#10;State management&#10;Reward distribution"
            rows={4}
            className="input resize-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            AI Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="input bg-white"
          >
            <option value="default">🤖 Auto-select Best Provider</option>
            <option value="openai">🟢 OpenAI (GPT-4)</option>
            <option value="anthropic">🟣 Anthropic (Claude)</option>
            <option value="google">🔵 Google (Gemini)</option>
            <option value="xai">⚡ xAI (Grok)</option>
            <option value="local">💻 Local AI</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !description}
          className="btn-primary w-full text-lg py-4 shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Code
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

