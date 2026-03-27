import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Send, Trash2, Eye, Clock, CheckCircle, AlertCircle, Loader, Megaphone } from 'lucide-react';
import client from '../../api/client';

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: Clock },
  scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-700', icon: Clock },
  running: { label: 'Running', color: 'bg-yellow-100 text-yellow-700', icon: Loader },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

const channelLabels = { email: 'Email', whatsapp: 'WhatsApp', both: 'Email + WhatsApp' };

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchCampaigns = () => {
    client.get('/admin/campaigns')
      .then((res) => setCampaigns(res.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete campaign "${name}"?`)) return;
    try {
      await client.delete(`/admin/campaigns/${id}`);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const handleSchedule = async (id) => {
    try {
      await client.post(`/admin/campaigns/${id}/schedule`);
      fetchCampaigns();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to schedule');
    }
  };

  const filtered = filter === 'all' ? campaigns : campaigns.filter((c) => c.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-1">Send email and WhatsApp campaigns to your patients</p>
        </div>
        <Link
          to="/admin/campaigns/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> New Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <Megaphone size={28} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No campaigns yet</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-sm mx-auto">
            Create your first campaign to start reaching out to your patients via email or WhatsApp.
          </p>
          <Link to="/admin/campaigns/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus size={16} /> Create Campaign
          </Link>
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="mb-4">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Status ({campaigns.length})</option>
              <option value="draft">Draft ({campaigns.filter((c) => c.status === 'draft').length})</option>
              <option value="scheduled">Scheduled ({campaigns.filter((c) => c.status === 'scheduled').length})</option>
              <option value="running">Running ({campaigns.filter((c) => c.status === 'running').length})</option>
              <option value="completed">Completed ({campaigns.filter((c) => c.status === 'completed').length})</option>
              <option value="failed">Failed ({campaigns.filter((c) => c.status === 'failed').length})</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
              <p className="text-sm text-gray-500">No {filter} campaigns found.</p>
              <button onClick={() => setFilter('all')} className="text-sm text-blue-600 font-medium mt-2 hover:underline">
                Show all campaigns
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Campaign</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Channel</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Scheduled</th>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase px-5 py-3">Recipients</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const status = statusConfig[c.status] || statusConfig.draft;
                    const StatusIcon = status.icon;
                    return (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="px-5 py-4">
                          <Link to={`/admin/campaigns/${c.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                            {c.name}
                          </Link>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{channelLabels[c.channel] || c.channel}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                            <StatusIcon size={12} /> {status.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">
                          {c.scheduledAt ? new Date(c.scheduledAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-5 py-4 text-sm">
                          {(c.totalRecipients || 0) > 0 ? (
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-green-700">{c.sentRecipients || 0}<span className="text-gray-400 font-normal">/{c.totalRecipients}</span></span>
                              {c.skippedRecipients > 0 && (
                                <span className="text-xs text-amber-500">{c.skippedRecipients} skipped</span>
                              )}
                              {c.failedRecipients > 0 && (
                                <span className="text-xs text-red-500">{c.failedRecipients} failed</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/admin/campaigns/${c.id}`}
                              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                              <Eye size={16} />
                            </Link>
                            {c.status === 'draft' && (
                              <button onClick={() => handleSchedule(c.id)}
                                className="p-2 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700"
                                title="Schedule">
                                <Send size={16} />
                              </button>
                            )}
                            {c.status !== 'running' && (
                              <button onClick={() => handleDelete(c.id, c.name)}
                                className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600">
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
