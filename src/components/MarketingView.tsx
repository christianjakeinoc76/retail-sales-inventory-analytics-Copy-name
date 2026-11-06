import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  MousePointer,
  Eye,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import type { MarketingCampaign } from '../types';

interface MarketingViewProps {
  campaigns: MarketingCampaign[];
  onAddCampaign: (campaign: Omit<MarketingCampaign, 'campaign_id' | 'roi_percentage'>) => Promise<void>;
  onUpdateCampaign: (id: number, updates: Partial<MarketingCampaign>) => Promise<void>;
  onDeleteCampaign: (id: number) => Promise<void>;
}

export const MarketingView: React.FC<MarketingViewProps> = ({
  campaigns,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<MarketingCampaign | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    campaign_name: '',
    channel: 'Social Media' as MarketingCampaign['channel'],
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    budget: 3000,
    spend: 2500,
    impressions: 50000,
    clicks: 3000,
    conversions: 200,
    revenue_generated: 12000,
    status: 'Active' as MarketingCampaign['status'],
  });

  // Financial aggregates
  const summary = useMemo(() => {
    const totalBudget = campaigns.reduce((acc, c) => acc + c.budget, 0);
    const totalSpend = campaigns.reduce((acc, c) => acc + c.spend, 0);
    const totalRevenue = campaigns.reduce((acc, c) => acc + c.revenue_generated, 0);
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0);
    const averageROI =
      totalSpend > 0 ? Number((((totalRevenue - totalSpend) / totalSpend) * 100).toFixed(1)) : 0;

    return { totalBudget, totalSpend, totalRevenue, totalConversions, averageROI };
  }, [campaigns]);

  // Channel breakdown for Recharts
  const channelData = useMemo(() => {
    const map: Record<string, { channel: string; spend: number; revenue: number }> = {};
    for (const c of campaigns) {
      if (!map[c.channel]) {
        map[c.channel] = { channel: c.channel, spend: 0, revenue: 0 };
      }
      map[c.channel].spend += c.spend;
      map[c.channel].revenue += c.revenue_generated;
    }
    return Object.values(map).map((ch) => ({
      ...ch,
      spend: Math.round(ch.spend),
      revenue: Math.round(ch.revenue),
    }));
  }, [campaigns]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      const matchSearch =
        c.campaign_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.channel.toLowerCase().includes(searchQuery.toLowerCase());
      const matchChannel = channelFilter === 'ALL' || c.channel === channelFilter;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchChannel && matchStatus;
    });
  }, [campaigns, searchQuery, channelFilter, statusFilter]);

  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCampaigns.slice(start, start + itemsPerPage);
  }, [filteredCampaigns, currentPage]);

  const openAddModal = () => {
    setFormData({
      campaign_name: '',
      channel: 'Social Media',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      budget: 3000,
      spend: 2400,
      impressions: 48000,
      clicks: 2900,
      conversions: 190,
      revenue_generated: 11500,
      status: 'Active',
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (c: MarketingCampaign) => {
    setEditingCampaign(c);
    setFormData({
      campaign_name: c.campaign_name,
      channel: c.channel,
      start_date: c.start_date,
      end_date: c.end_date,
      budget: c.budget,
      spend: c.spend,
      impressions: c.impressions,
      clicks: c.clicks,
      conversions: c.conversions,
      revenue_generated: c.revenue_generated,
      status: c.status,
    });
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddCampaign(formData);
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;
    await onUpdateCampaign(editingCampaign.campaign_id, formData);
    setEditingCampaign(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingId == null) return;
    await onDeleteCampaign(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Marketing Campaigns & Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Evaluate advertising channels, customer acquisition expenses, and campaign ROI
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Launch Campaign</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Ad Spend</span>
          <div className="mt-2 text-2xl font-black text-gray-900">
            ${summary.totalSpend.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Budget Cap: <span className="font-semibold text-gray-700">${summary.totalBudget.toLocaleString()}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Attributed Revenue</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            ${summary.totalRevenue.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Across {campaigns.length} campaigns
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Overall Campaign ROI</span>
          <div className="mt-2 text-2xl font-black text-red-600">
            {summary.averageROI}%
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>High return on ad spend</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Direct Conversions</span>
          <div className="mt-2 text-2xl font-black text-gray-900">
            {summary.totalConversions.toLocaleString()}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Paying retail shoppers acquired
          </div>
        </div>
      </div>

      {/* Spend vs Revenue by Channel Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-2">
          <div>
            <h2 className="text-base font-bold text-gray-900">Marketing Spend vs Revenue by Channel</h2>
            <p className="text-xs text-gray-500">Comparison of ad dollar invested versus revenue generated</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-gray-900 inline-block"></span> Spend ($)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-red-600 inline-block"></span> Revenue ($)
            </span>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="channel" stroke="#64748B" fontSize={11} interval={0} angle={-15} textAnchor="end" />
              <YAxis stroke="#64748B" fontSize={11} tickFormatter={(val) => `$${val}`} />
              <Tooltip
                formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                contentStyle={{ backgroundColor: '#111827', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="spend" fill="#111827" radius={[4, 4, 0, 0]} name="Ad Spend" />
              <Bar dataKey="revenue" fill="#DC2626" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Campaigns Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Table Filters Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search campaign name or channel..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-semibold px-2.5 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="ALL">All Channels</option>
              <option value="Email Marketing">Email Marketing</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Social Media">Social Media</option>
              <option value="Influencer Campaign">Influencer Campaign</option>
              <option value="In-Store Promo">In-Store Promo</option>
              <option value="Loyalty Program">Loyalty Program</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs font-semibold px-2.5 py-2 border border-gray-200 rounded-lg bg-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="Planned">Planned</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="py-3 px-4">Campaign Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Spend / Budget</th>
                <th className="py-3 px-4">Impressions / Clicks</th>
                <th className="py-3 px-4">Conversions</th>
                <th className="py-3 px-4">Revenue / ROI</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {paginatedCampaigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-400 text-xs">
                    No campaigns found matching search filters.
                  </td>
                </tr>
              ) : (
                paginatedCampaigns.map((camp) => (
                  <tr key={camp.campaign_id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{camp.campaign_name}</div>
                      <div className="text-[10px] text-gray-400 font-mono">ID #{camp.campaign_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800">
                        {camp.channel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-500">
                      <div>{camp.start_date}</div>
                      <div className="text-[10px] text-gray-400">to {camp.end_date}</div>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono">
                      <div className="font-bold text-gray-900">${camp.spend.toLocaleString()}</div>
                      <div className="text-[10px] text-gray-400">Cap: ${camp.budget.toLocaleString()}</div>
                    </td>
                    <td className="py-3 px-4 text-xs">
                      <div className="font-mono text-gray-800">{camp.impressions.toLocaleString()} views</div>
                      <div className="text-[10px] text-gray-400 font-mono">{camp.clicks.toLocaleString()} clicks</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs font-bold text-gray-900">
                      {camp.conversions.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-emerald-600">
                        ${camp.revenue_generated.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-bold text-red-600">
                        {camp.roi_percentage > 0 ? `+${camp.roi_percentage}% ROI` : '0%'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          camp.status === 'Active'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : camp.status === 'Completed'
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(camp)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Edit Campaign"
                          aria-label={`Edit ${camp.campaign_name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(camp.campaign_id)}
                          className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-lg cursor-pointer"
                          title="Delete Campaign"
                          aria-label={`Delete ${camp.campaign_name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing{' '}
            <span className="font-bold text-gray-900">
              {filteredCampaigns.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-bold text-gray-900">
              {Math.min(currentPage * itemsPerPage, filteredCampaigns.length)}
            </span>{' '}
            of <span className="font-bold text-gray-900">{filteredCampaigns.length}</span> campaigns
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-bold text-gray-900">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Campaign Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">Create Marketing Campaign</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  placeholder="e.g. Spring Clearance Social Ad"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value as MarketingCampaign['channel'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                  >
                    <option value="Social Media">Social Media</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="Influencer Campaign">Influencer Campaign</option>
                    <option value="In-Store Promo">In-Store Promo</option>
                    <option value="Loyalty Program">Loyalty Program</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as MarketingCampaign['status'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ad Spend ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.spend}
                    onChange={(e) => setFormData({ ...formData, spend: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Conversions</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.conversions}
                    onChange={(e) => setFormData({ ...formData, conversions: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Revenue ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.revenue_generated}
                    onChange={(e) =>
                      setFormData({ ...formData, revenue_generated: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">
                Edit Campaign #{editingCampaign.campaign_id}
              </h2>
              <button
                onClick={() => setEditingCampaign(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) =>
                      setFormData({ ...formData, channel: e.target.value as MarketingCampaign['channel'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                  >
                    <option value="Social Media">Social Media</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Email Marketing">Email Marketing</option>
                    <option value="Influencer Campaign">Influencer Campaign</option>
                    <option value="In-Store Promo">In-Store Promo</option>
                    <option value="Loyalty Program">Loyalty Program</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as MarketingCampaign['status'] })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Planned">Planned</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Ad Spend ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.spend}
                    onChange={(e) => setFormData({ ...formData, spend: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Revenue ($)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.revenue_generated}
                    onChange={(e) =>
                      setFormData({ ...formData, revenue_generated: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl p-6 text-center border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Delete Campaign #{deletingId}?</h3>
            <p className="text-xs text-gray-500 mt-1">
              This campaign and its associated metrics will be permanently removed.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
