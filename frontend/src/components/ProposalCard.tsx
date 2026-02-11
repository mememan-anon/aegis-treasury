import React, { useState } from 'react';
import { Play, XCircle, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Proposal } from '../types';

interface ProposalCardProps {
  proposal: Proposal;
  onApprove?: (id: string) => void;
  onExecute?: (id: string) => void;
}

const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, onApprove, onExecute }) => {
  const [loading, setLoading] = useState(false);

  const getStatusColor = () => {
    switch (proposal.status) {
      case 'pending':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'approved':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'executed':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusIcon = () => {
    switch (proposal.status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'executed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await onApprove?.(proposal.id);
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      await onExecute?.(proposal.id);
    } finally {
      setLoading(false);
    }
  };

  const canApprove = proposal.status === 'pending';
  const canExecute = proposal.status === 'approved';

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-lg font-bold text-white">#{proposal.id}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()} flex items-center space-x-1`}>
              {getStatusIcon()}
              <span className="capitalize">{proposal.status}</span>
            </span>
          </div>
          <p className="text-sm text-slate-300">
            <span className="text-slate-400">Type:</span> {proposal.type}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Date</p>
          <p className="text-sm text-slate-300">
            {new Date(proposal.timestamp * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Amount</p>
          <p className="text-lg font-bold text-white">{proposal.amount} {proposal.token}</p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-1">Strategy</p>
          <p className="text-sm text-slate-300 font-mono">
            {proposal.strategy.slice(0, 10)}...{proposal.strategy.slice(-8)}
          </p>
        </div>
      </div>

      {/* Reason */}
      {proposal.reason && (
        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Reason</p>
          <p className="text-sm text-slate-300">{proposal.reason}</p>
        </div>
      )}

      {/* Transaction Hash */}
      {proposal.txHash && (
        <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
          <p className="text-xs text-slate-400 mb-1">Transaction</p>
          <p className="text-sm text-emerald-400 font-mono">
            {proposal.txHash.slice(0, 10)}...{proposal.txHash.slice(-8)}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {canApprove && onApprove && (
          <button
            onClick={handleApprove}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Approve</span>
          </button>
        )}
        {canExecute && onExecute && (
          <button
            onClick={handleExecute}
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4" />
            <span className="text-sm font-medium">Execute</span>
          </button>
        )}
      </div>

      {/* Execution Time */}
      {proposal.executionTime && (
        <div className="mt-3 text-xs text-slate-400">
          Scheduled for: {new Date(proposal.executionTime * 1000).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default ProposalCard;
