import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, PieChart, Loader2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import Layout from '../components/Layout';
import WalletStatus from '../components/WalletStatus';
import BalanceCard from '../components/BalanceCard';
import { TokenBalance, Allocation, SystemStatus } from '../types';

const Dashboard: React.FC = () => {
  const { addToast } = useToast();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [status, setStatus] = useState<SystemStatus>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch balances
        const balancesResponse = await axios.get('/api/balances');
        setBalances(balancesResponse.data.balances || []);

        // Fetch allocations
        const allocsResponse = await axios.get('/api/allocations');
        setAllocations(allocsResponse.data.allocations || []);

        // Fetch system status
        const statusResponse = await axios.get('/api/status');
        setStatus(statusResponse.data);
        addToast('Dashboard data loaded successfully', 'success');
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Using mock data.');
        addToast('Failed to load dashboard data. Using mock data.', 'warning');
        // Use mock data if API fails
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [addToast]);

  const loadMockData = () => {
    const mockBalances: TokenBalance[] = [
      {
        token: '0x0000000000000000000000000000000000000000',
        symbol: 'BNB',
        balance: '1250.5',
        decimals: 18,
        price: 310.5,
        value: 388380.25,
      },
      {
        token: '0x55d398326f99059fF775485246999027B3197955',
        symbol: 'USDT',
        balance: '500000',
        decimals: 18,
        price: 1.0,
        value: 500000,
      },
    ];

    const mockAllocations: Allocation[] = [
      {
        token: 'BNB',
        targetPercentage: 40,
        currentPercentage: 38,
        isRebalanced: true,
      },
      {
        token: 'USDT',
        targetPercentage: 60,
        currentPercentage: 62,
        isRebalanced: true,
      },
    ];

    setBalances(mockBalances);
    setAllocations(mockAllocations);
    setStatus({
      relayer: '0x742d35Cc6634C0532925a3b844Bc9e7595f8bDe',
      provider: 'Demo Mode - Mock Data',
      timestamp: Date.now(),
    });
  };

  const totalValue = balances.reduce((sum, b) => sum + (b.value || 0), 0);

  // Mock chart data (price history)
  const chartData = [
    { time: '1h', value: totalValue * 0.99 },
    { time: '2h', value: totalValue * 0.995 },
    { time: '3h', value: totalValue * 1.01 },
    { time: '4h', value: totalValue * 0.998 },
    { time: '5h', value: totalValue * 1.005 },
    { time: '6h', value: totalValue },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">Treasury Dashboard</h1>
          <p className="text-slate-400 mt-1">Monitor and manage treasury assets</p>
        </div>

        {error && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-amber-400 text-sm">
            {error}
          </div>
        )}

        {/* System Status */}
        <WalletStatus status={status} />

        {/* Total Value */}
        <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400 mb-1">Total Treasury Value</p>
              <p className="text-4xl font-bold text-white">
                ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-emerald-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">+2.5%</span>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Portfolio Performance</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Balances Grid */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Token Balances</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {balances.map((balance, index) => {
              const alloc = allocations.find(a => a.token === balance.symbol);
              return (
                <BalanceCard
                  key={`${balance.token}-${index}`}
                  balance={balance}
                  targetAllocation={alloc?.targetPercentage}
                  currentAllocation={alloc?.currentPercentage}
                />
              );
            })}
          </div>
        </div>

        {/* Target Allocations Summary */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Target Allocations</h2>
          <div className="space-y-4">
            {allocations.map((alloc, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-300">{alloc.token}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-slate-400">Target: {alloc.targetPercentage}%</span>
                    <span className="text-sm text-slate-400">Current: {alloc.currentPercentage}%</span>
                    {alloc.isRebalanced && (
                      <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">
                        Rebalanced
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                    style={{ width: `${alloc.currentPercentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
