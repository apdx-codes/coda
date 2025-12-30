'use client';

import { useState } from 'react';
import { GeneratorForm } from '@/components/GeneratorForm';
import { CodePreview } from '@/components/CodePreview';
import { ProviderStatus } from '@/components/ProviderStatus';

interface GeneratedFile {
  path: string;
  content: string;
  language: string;
}

interface GenerationResult {
  files: GeneratedFile[];
  instructions: string;
  nextSteps: string[];
}

export default function Home() {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (formData: any) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://localhost:3000/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Generation failed');
      }

      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4">
            <span className="gradient-text">Coda</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            AI-Powered Web3 No-Code Builder for Solana
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Generate production-ready Solana programs with AI
          </p>
        </div>

        {/* Provider Status */}
        <ProviderStatus />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Left Column - Form */}
          <div className="space-y-6">
            <GeneratorForm onGenerate={handleGenerate} loading={loading} />
            
            {error && (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            {loading && (
              <div className="card">
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="spinner mb-4"></div>
                  <p className="text-gray-600 font-medium">Generating your code...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 10-30 seconds</p>
                </div>
              </div>
            )}
            
            {!loading && !result && (
              <div className="card bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Build</h3>
                  <p className="text-gray-600">
                    Fill out the form and click Generate to create your Solana program
                  </p>
                </div>
              </div>
            )}
            
            {result && <CodePreview result={result} />}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Coda Protocol v0.1.0 - MIT License</p>
        </div>
      </div>
    </main>
  );
}

