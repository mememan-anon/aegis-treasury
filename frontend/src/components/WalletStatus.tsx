import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { SystemStatus } from '../types';

interface WalletStatusProps {
  status?: SystemStatus;
}

const WalletStatus: React.FC<WalletStatusProps> = ({ status }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');

  useEffect(() => {
    if (status?.relayer) {
      setIsConnected(true);
      // Shorten address
      const addr = status.relayer;
      setWalletAddress(`${addr.slice(0, 6)}...${addr.slice(-4)}`);
    }
  }, [status]);

  if (!status) {
    return (
      <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          <span className="text-sm text-slate-400">Loading status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Wallet className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="text-sm font-medium text-white">Relayer Status</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {status.provider || 'Demo Mode'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-400">Connected</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">Disconnected</span>
            </>
          )}
        </div>
      </div>
      {walletAddress && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Relayer Address: <span className="font-mono text-slate-300">{walletAddress}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default WalletStatus;
