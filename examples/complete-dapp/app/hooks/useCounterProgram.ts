import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Program, AnchorProvider, web3, BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useMemo, useState, useCallback } from 'react';

const PROGRAM_ID = new PublicKey('CounterProgram11111111111111111111111111111');

export interface CounterData {
  authority: PublicKey;
  count: BN;
  bump: number;
}

export function useCounterProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = useMemo(() => {
    if (!wallet.publicKey) return null;
    return new AnchorProvider(
      connection,
      wallet as any,
      AnchorProvider.defaultOptions()
    );
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    return new Program(IDL, PROGRAM_ID, provider);
  }, [provider]);

  const getCounterAddress = useCallback(
    (authority: PublicKey) => {
      return PublicKey.findProgramAddressSync(
        [Buffer.from('counter'), authority.toBuffer()],
        PROGRAM_ID
      );
    },
    []
  );

  const initialize = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const [counterAddress] = getCounterAddress(wallet.publicKey);

      const tx = await program.methods
        .initialize()
        .accounts({
          counter: counterAddress,
          authority: wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();

      console.log('Counter initialized:', tx);
      return tx;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getCounterAddress]);

  const increment = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const [counterAddress] = getCounterAddress(wallet.publicKey);

      const tx = await program.methods
        .increment()
        .accounts({
          counter: counterAddress,
          authority: wallet.publicKey,
        })
        .rpc();

      console.log('Counter incremented:', tx);
      return tx;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getCounterAddress]);

  const decrement = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const [counterAddress] = getCounterAddress(wallet.publicKey);

      const tx = await program.methods
        .decrement()
        .accounts({
          counter: counterAddress,
          authority: wallet.publicKey,
        })
        .rpc();

      console.log('Counter decremented:', tx);
      return tx;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getCounterAddress]);

  const reset = useCallback(async () => {
    if (!program || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    setLoading(true);
    setError(null);

    try {
      const [counterAddress] = getCounterAddress(wallet.publicKey);

      const tx = await program.methods
        .reset()
        .accounts({
          counter: counterAddress,
          authority: wallet.publicKey,
        })
        .rpc();

      console.log('Counter reset:', tx);
      return tx;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [program, wallet.publicKey, getCounterAddress]);

  const fetchCounter = useCallback(
    async (authority: PublicKey): Promise<CounterData | null> => {
      if (!program) return null;

      try {
        const [counterAddress] = getCounterAddress(authority);
        const counter = await program.account.counter.fetch(counterAddress);
        return counter as CounterData;
      } catch (err) {
        console.error('Error fetching counter:', err);
        return null;
      }
    },
    [program, getCounterAddress]
  );

  return {
    initialize,
    increment,
    decrement,
    reset,
    fetchCounter,
    getCounterAddress,
    loading,
    error,
  };
}

const IDL = {
  version: '0.1.0',
  name: 'counter_program',
  instructions: [
    {
      name: 'initialize',
      accounts: [
        { name: 'counter', isMut: true, isSigner: false },
        { name: 'authority', isMut: true, isSigner: true },
        { name: 'systemProgram', isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: 'increment',
      accounts: [
        { name: 'counter', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: 'decrement',
      accounts: [
        { name: 'counter', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
    {
      name: 'reset',
      accounts: [
        { name: 'counter', isMut: true, isSigner: false },
        { name: 'authority', isMut: false, isSigner: true },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'Counter',
      type: {
        kind: 'struct',
        fields: [
          { name: 'authority', type: 'publicKey' },
          { name: 'count', type: 'u64' },
          { name: 'bump', type: 'u8' },
        ],
      },
    },
  ],
  errors: [
    { code: 6000, name: 'Unauthorized', msg: 'Unauthorized: Only the authority can perform this action' },
    { code: 6001, name: 'Overflow', msg: 'Overflow: Counter has reached maximum value' },
    { code: 6002, name: 'Underflow', msg: 'Underflow: Counter cannot go below zero' },
  ],
};

