import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useCounterProgram, CounterData } from '../hooks/useCounterProgram';

export function CounterDisplay() {
  const wallet = useWallet();
  const { 
    initialize, 
    increment, 
    decrement, 
    reset, 
    fetchCounter,
    loading,
    error 
  } = useCounterProgram();
  
  const [counter, setCounter] = useState<CounterData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const refreshCounter = async () => {
    if (!wallet.publicKey) return;
    
    setRefreshing(true);
    const data = await fetchCounter(wallet.publicKey);
    setCounter(data);
    setRefreshing(false);
  };

  useEffect(() => {
    refreshCounter();
    
    const interval = setInterval(refreshCounter, 5000);
    return () => clearInterval(interval);
  }, [wallet.publicKey]);

  const handleInitialize = async () => {
    try {
      await initialize();
      await refreshCounter();
    } catch (err) {
      console.error('Failed to initialize:', err);
    }
  };

  const handleIncrement = async () => {
    try {
      await increment();
      await refreshCounter();
    } catch (err) {
      console.error('Failed to increment:', err);
    }
  };

  const handleDecrement = async () => {
    try {
      await decrement();
      await refreshCounter();
    } catch (err) {
      console.error('Failed to decrement:', err);
    }
  };

  const handleReset = async () => {
    try {
      await reset();
      await refreshCounter();
    } catch (err) {
      console.error('Failed to reset:', err);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Connect Your Wallet
        </h3>
        <p className="text-gray-600">
          Please connect your wallet to use the counter
        </p>
      </div>
    );
  }

  if (!counter) {
    return (
      <div className="card text-center py-12">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Initialize Your Counter
        </h3>
        <button
          onClick={handleInitialize}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? 'Initializing...' : 'Initialize Counter'}
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="text-center mb-8">
        <h2 className="text-6xl font-bold text-blue-600 mb-2">
          {counter.count.toString()}
        </h2>
        <p className="text-gray-500 text-sm">Current Count</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={handleIncrement}
          disabled={loading}
          className="btn-primary"
        >
          <span className="text-2xl mr-2">+</span>
          Increment
        </button>
        
        <button
          onClick={handleDecrement}
          disabled={loading || counter.count.toNumber() === 0}
          className="btn-primary bg-red-600 hover:bg-red-700"
        >
          <span className="text-2xl mr-2">-</span>
          Decrement
        </button>
      </div>

      <button
        onClick={handleReset}
        disabled={loading}
        className="btn-secondary w-full"
      >
        Reset to 0
      </button>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Authority:</span>
          <span className="font-mono text-xs text-gray-800">
            {counter.authority.toString().slice(0, 8)}...
            {counter.authority.toString().slice(-8)}
          </span>
        </div>
        
        <button
          onClick={refreshCounter}
          disabled={refreshing}
          className="text-blue-600 hover:text-blue-700 text-sm mt-2"
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
}

