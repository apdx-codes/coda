'use client';

import { useEffect, useState } from 'react';

interface Provider {
  name: string;
  available: boolean;
  model?: string;
}

export function ProviderStatus() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/providers')
      .then(res => res.json())
      .then(data => {
        setProviders(data.providers || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch providers:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-600">Loading provider status...</p>
      </div>
    );
  }

  return (
    <div className="card bg-white">
      <div className="flex items-center mb-4">
        <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">AI Provider Status</h3>
      </div>
      
      {loading ? (
        <div className="flex items-center text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
          <span className="text-sm">Loading providers...</span>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">No AI providers configured</p>
              <p className="text-xs text-yellow-700 mt-1">Please add at least one API key in your .env file</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {providers.map(provider => (
            <div
              key={provider.name}
              className={`badge ${
                provider.available ? 'badge-success' : 'badge-error'
              } flex items-center`}
            >
              <span className={`h-2 w-2 rounded-full mr-2 ${
                provider.available ? 'bg-green-600' : 'bg-red-600'
              }`}></span>
              <span className="font-semibold capitalize">{provider.name}</span>
              {provider.model && (
                <span className="ml-1 opacity-75 text-xs">({provider.model})</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

