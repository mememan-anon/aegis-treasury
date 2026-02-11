import React from 'react';
import { ArrowUpRight, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { TokenBalance } from '../types';

interface BalanceCardProps {
  balance: TokenBalance;
  targetAllocation?: number;
  currentAllocation?: number;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  targetAllocation,
  currentAllocation,
}) => {
  const isPositive = balance.value && balance.value > 0;

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors">
      {/* Token Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{balance.symbol}</h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            {balance.token.slice(0, 8)}...{balance.token.slice(-6)}
          </p>
        </div>
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
        }`}>
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-medium">Active</span>
        </div>
      </div>

      {/* Balance */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-white">
          {parseFloat(balance.balance).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 6,
          })}
        </p>
        {balance.value && (
          <p className={`text-sm font-medium ${isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
            ${balance.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </div>

      {/* Allocation */}
      {targetAllocation !== undefined && (
        <div className="border-t border-slate-700 pt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Target Allocation</span>
            <span className="text-white font-medium">{targetAllocation}%</span>
          </div>
          {currentAllocation !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Current Allocation</span>
              <span className="text-white font-medium">{currentAllocation}%</span>
            </div>
          )}
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300"
              style={{ width: `${targetAllocation}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-4 pt-4 border-t border-slate-700 flex space-x-2">
        <button className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors">
          <ArrowDownLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Deposit</span>
        </button>
        <button className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
          <ArrowUpRight className="w-4 h-4" />
          <span className="text-sm font-medium">Withdraw</span>
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;
