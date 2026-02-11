import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Loader2, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import ProposalCard from '../components/ProposalCard';
import { Proposal } from '../types';

const Proposals: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'executed' | 'failed'>('all');

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const response = await axios.get('/api/proposals');
        setProposals(response.data.proposals || []);
      } catch (err) {
        console.error('Error fetching proposals:', err);
        setError('Failed to load proposals. Using mock data.');
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, []);

  const loadMockData = () => {
    const mockProposals: Proposal[] = [
      {
        id: '1',
        timestamp: Math.floor(Date.now() / 1000) - 3600,
        type: 'deposit',
        token: 'USDT',
        amount: '100000',
        strategy: '0x1234567890123456789012345678901234567890',
        reason: 'Deposit to Venus strategy for yield farming',
        status: 'executed',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
        executionTime: Math.floor(Date.now() / 1000) - 1800,
      },
      {
        id: '2',
        timestamp: Math.floor(Date.now() / 1000) - 1800,
        type: 'harvest',
        token: 'BNB',
        amount: '15.5',
        strategy: '0x9876543210987654321098765432109876543210',
        reason: 'Harvest rewards from PancakeSwap staking',
        status: 'pending',
      },
      {
        id: '3',
        timestamp: Math.floor(Date.now() / 1000) - 900,
        type: 'withdraw',
        token: 'USDT',
        amount: '50000',
        strategy: '0x1234567890123456789012345678901234567890',
        reason: 'Rebalance portfolio - reduce USDT allocation',
        status: 'approved',
        executionTime: Math.floor(Date.now() / 1000) + 3600,
      },
      {
        id: '4',
        timestamp: Math.floor(Date.now() / 1000) - 7200,
        type: 'deposit',
        token: 'BNB',
        amount: '100',
        strategy: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        reason: 'Deposit to Alpaca strategy',
        status: 'failed',
      },
    ];

    setProposals(mockProposals);
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.post(`/api/proposals/${id}/approve`);
      // Update local state
      setProposals(proposals.map(p =>
        p.id === id ? { ...p, status: 'approved' as const } : p
      ));
      alert(`Proposal ${id} approved successfully!`);
    } catch (err) {
      console.error('Error approving proposal:', err);
      alert('Failed to approve proposal. Please try again.');
    }
  };

  const handleExecute = async (id: string) => {
    try {
      await axios.post(`/api/proposals/${id}/execute`);
      // Update local state
      setProposals(proposals.map(p =>
        p.id === id ? { ...p, status: 'executed' as const } : p
      ));
      alert(`Proposal ${id} executed successfully!`);
    } catch (err) {
      console.error('Error executing proposal:', err);
      alert('Failed to execute proposal. Please try again.');
    }
  };

  const filteredProposals = filter === 'all'
    ? proposals
    : proposals.filter(p => p.status === filter);

  const statusCounts = {
    all: proposals.length,
    pending: proposals.filter(p => p.status === 'pending').length,
    approved: proposals.filter(p => p.status === 'approved').length,
    executed: proposals.filter(p => p.status === 'executed').length,
    failed: proposals.filter(p => p.status === 'failed').length,
  };

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
          <h1 className="text-3xl font-bold text-white">Proposals</h1>
          <p className="text-slate-400 mt-1">Review and manage treasury proposals</p>
        </div>

        {error && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-4 text-amber-400 text-sm">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-2">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setFilter('all')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>All ({statusCounts.all})</span>
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <span>Pending ({statusCounts.pending})</span>
            </button>
            <button
              onClick={() => setFilter('approved')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                filter === 'approved' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <span>Approved ({statusCounts.approved})</span>
            </button>
            <button
              onClick={() => setFilter('executed')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                filter === 'executed' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
              >
              <span>Executed ({statusCounts.executed})</span>
            </button>
            <button
              onClick={() => setFilter('failed')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                filter === 'failed' ? 'bg-red-500/20 text-red-400' : 'text-slate-300 hover:bg-slate-700/50'
              }`}
              >
              <span>Failed ({statusCounts.failed})</span>
            </button>
          </div>
        </div>

        {/* Proposals Grid */}
        {filteredProposals.length === 0 ? (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
            <Filter className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No proposals found for this filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredProposals.map(proposal => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onApprove={handleApprove}
                onExecute={handleExecute}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Proposals;
