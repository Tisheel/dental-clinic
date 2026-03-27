import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Send, Plus, Trash2, Users, Eye, EyeOff, ChevronDown, ChevronUp, X } from 'lucide-react';
import client from '../../api/client';

const channelOptions = [
  { value: 'email', label: 'Email' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'both', label: 'Email + WhatsApp' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function CampaignForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const [form, setForm] = useState({
    name: '',
    subject: '',
    emailBody: '',
    whatsappBody: '',
    channel: 'email',
    scheduledAt: '',
    filterServiceId: '',
    filterStatus: '',
    filterDateFrom: '',
    filterDateTo: '',
  });

  const [services, setServices] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [previewList, setPreviewList] = useState([]);
  const [previewCount, setPreviewCount] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState(null);
  const [manualRecipient, setManualRecipient] = useState({ name: '', email: '', phone: '' });
  const [showRecipients, setShowRecipients] = useState(true);

  useEffect(() => {
    client.get('/admin/services').then((res) => setServices(res.data || [])).catch(() => {});

    if (isEdit) {
      client.get(`/admin/campaigns/${id}`).then((res) => {
        const c = res.data.campaign;
        setCampaign(c);
        setRecipients(c.recipients || []);
        setForm({
          name: c.name || '',
          subject: c.subject || '',
          emailBody: c.emailBody || '',
          whatsappBody: c.whatsappBody || '',
          channel: c.channel || 'email',
          scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 16) : '',
          filterServiceId: c.filterServiceId || '',
          filterStatus: c.filterStatus || '',
          filterDateFrom: c.filterDateFrom ? c.filterDateFrom.slice(0, 10) : '',
          filterDateTo: c.filterDateTo ? c.filterDateTo.slice(0, 10) : '',
        });
      }).catch(() => navigate('/admin/campaigns'));
    }
  }, [id]);

  const isDraft = !isEdit || campaign?.status === 'draft';

  const handleSave = async () => {
    if (!form.name) return alert('Campaign name is required');
    setSaving(true);
    try {
      const payload = buildPayload();
      if (isEdit) {
        await client.put(`/admin/campaigns/${id}`, payload);
      } else {
        const res = await client.post('/admin/campaigns', payload);
        navigate(`/admin/campaigns/${res.data.id}`);
        return;
      }
      navigate('/admin/campaigns');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const buildPayload = () => ({
    ...form,
    filterServiceId: form.filterServiceId ? Number(form.filterServiceId) : null,
    scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : null,
    filterDateFrom: form.filterDateFrom ? new Date(form.filterDateFrom).toISOString() : null,
    filterDateTo: form.filterDateTo ? new Date(form.filterDateTo).toISOString() : null,
  });

  const handleSchedule = async () => {
    try {
      await client.post(`/admin/campaigns/${id}/schedule`);
      navigate('/admin/campaigns');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to schedule');
    }
  };

  const togglePreview = async () => {
    if (showPreview) {
      setShowPreview(false);
      return;
    }

    setPreviewLoading(true);
    setShowPreview(true);
    try {
      let res;
      if (isEdit) {
        // Save filters first so backend has latest, then preview by ID
        if (isDraft) {
          try { await client.put(`/admin/campaigns/${id}`, buildPayload()); } catch {}
        }
        res = await client.get(`/admin/campaigns/${id}/preview-recipients`);
      } else {
        // No campaign yet — preview directly from filter params
        const params = {};
        if (form.filterServiceId) params.serviceId = form.filterServiceId;
        if (form.filterStatus) params.status = form.filterStatus;
        if (form.filterDateFrom) params.dateFrom = form.filterDateFrom;
        if (form.filterDateTo) params.dateTo = form.filterDateTo;
        res = await client.get('/admin/campaigns/preview-recipients', { params });
      }
      setPreviewList(res.data.recipients || []);
      setPreviewCount(res.data.count || 0);
    } catch {
      alert('Failed to preview recipients');
      setShowPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleAddManual = async () => {
    if (!manualRecipient.name) return alert('Name is required');
    if (!manualRecipient.email && !manualRecipient.phone) return alert('Email or phone is required');
    try {
      const res = await client.post(`/admin/campaigns/${id}/recipients`, manualRecipient);
      setRecipients([...recipients, res.data]);
      setManualRecipient({ name: '', email: '', phone: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add recipient');
    }
  };

  const handleRemoveRecipient = async (rid) => {
    try {
      await client.delete(`/admin/campaigns/${id}/recipients/${rid}`);
      setRecipients(recipients.filter((r) => r.id !== rid));
    } catch {
      alert('Failed to remove recipient');
    }
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-400";

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={() => navigate('/admin/campaigns')}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft size={16} /> Back to Campaigns
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? form.name || 'Edit Campaign' : 'New Campaign'}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? 'Update campaign details and manage recipients' : 'Set up your campaign details, message, and target audience'}
          </p>
        </div>
        {campaign && (
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wide ${
            campaign.status === 'draft' ? 'bg-gray-100 text-gray-600'
            : campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-700'
            : campaign.status === 'completed' ? 'bg-green-100 text-green-700'
            : campaign.status === 'running' ? 'bg-yellow-100 text-yellow-700'
            : 'bg-red-100 text-red-700'
          }`}>{campaign.status}</span>
        )}
      </div>

      {/* Campaign Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Campaign Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Campaign Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Monthly Check-up Reminder" disabled={!isDraft} className={inputClass} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel</label>
              <select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}
                disabled={!isDraft} className={inputClass}>
                {channelOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Scheduled Date & Time</label>
              <input type="datetime-local" value={form.scheduledAt}
                onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                disabled={!isDraft} className={inputClass} />
            </div>
          </div>
        </div>
      </div>

      {/* Message Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Message Content</h2>
        <div className="space-y-4">
          {(form.channel === 'email' || form.channel === 'both') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Subject</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Email subject line" disabled={!isDraft} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Body (HTML)</label>
                <textarea value={form.emailBody} onChange={(e) => setForm({ ...form, emailBody: e.target.value })}
                  rows={8} placeholder="<h1>Hello!</h1><p>Your HTML email content here...</p>"
                  disabled={!isDraft} className={`${inputClass} font-mono`} />
              </div>
            </>
          )}
          {(form.channel === 'whatsapp' || form.channel === 'both') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp Message</label>
              <textarea value={form.whatsappBody} onChange={(e) => setForm({ ...form, whatsappBody: e.target.value })}
                rows={5} placeholder="Plain text message for WhatsApp..."
                disabled={!isDraft} className={inputClass} />
            </div>
          )}
        </div>
      </div>

      {/* Recipient Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
        <h2 className="font-semibold text-gray-900 mb-4">Target Audience</h2>
        <p className="text-sm text-gray-500 mb-4">Filter patients from your appointment history to build the recipient list.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service</label>
            <select value={form.filterServiceId} onChange={(e) => setForm({ ...form, filterServiceId: e.target.value })}
              disabled={!isDraft} className={inputClass}>
              <option value="">All Services</option>
              {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Status</label>
            <select value={form.filterStatus} onChange={(e) => setForm({ ...form, filterStatus: e.target.value })}
              disabled={!isDraft} className={inputClass}>
              {statusOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointments From</label>
            <input type="date" value={form.filterDateFrom}
              onChange={(e) => setForm({ ...form, filterDateFrom: e.target.value })}
              disabled={!isDraft} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointments To</label>
            <input type="date" value={form.filterDateTo}
              onChange={(e) => setForm({ ...form, filterDateTo: e.target.value })}
              disabled={!isDraft} className={inputClass} />
          </div>
        </div>

        {/* Preview toggle button */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button onClick={togglePreview}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors ${
              showPreview
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}>
            {showPreview ? <EyeOff size={15} /> : <Eye size={15} />}
            {showPreview ? 'Hide Preview' : 'Preview Recipients'}
          </button>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 bg-blue-100/50">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-700" />
                <span className="text-sm font-semibold text-blue-800">
                  {previewLoading ? 'Loading...' : `${previewCount} recipients match your filters`}
                </span>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-1 rounded hover:bg-blue-200 text-blue-600">
                <X size={16} />
              </button>
            </div>

            {!previewLoading && previewList.length > 0 && (
              <div className="overflow-auto" style={{ maxHeight: '320px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-blue-100/80 backdrop-blur-sm">
                    <tr className="text-left text-xs font-medium text-blue-700 uppercase">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100">
                    {previewList.map((r, i) => (
                      <tr key={i} className="hover:bg-blue-100/30">
                        <td className="px-4 py-2 text-blue-900">{r.name}</td>
                        <td className="px-4 py-2 text-blue-800">{r.email}</td>
                        <td className="px-4 py-2 text-blue-800">{r.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!previewLoading && previewList.length === 0 && (
              <div className="px-4 py-6 text-center text-sm text-blue-600">
                No recipients match the current filters. Try broadening your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Manual Recipients (only for edit + draft) */}
      {isEdit && isDraft && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-5">
          <h2 className="font-semibold text-gray-900 mb-1">Manual Recipients</h2>
          <p className="text-sm text-gray-500 mb-4">Add individual recipients who aren't in your appointment history.</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
            <input type="text" value={manualRecipient.name}
              onChange={(e) => setManualRecipient({ ...manualRecipient, name: e.target.value })}
              placeholder="Name *" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <input type="email" value={manualRecipient.email}
              onChange={(e) => setManualRecipient({ ...manualRecipient, email: e.target.value })}
              placeholder="Email" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <input type="text" value={manualRecipient.phone}
              onChange={(e) => setManualRecipient({ ...manualRecipient, phone: e.target.value })}
              placeholder="Phone" className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            <button onClick={handleAddManual}
              className="flex items-center justify-center gap-1.5 bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
              <Plus size={15} /> Add
            </button>
          </div>

          {recipients.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-auto" style={{ maxHeight: '300px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left text-xs text-gray-500 uppercase font-medium">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 w-12"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-900">{r.name}</td>
                        <td className="px-4 py-2.5 text-gray-600">{r.email}</td>
                        <td className="px-4 py-2.5 text-gray-600">{r.phone}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.status === 'sent' ? 'bg-green-100 text-green-700'
                            : r.status === 'failed' ? 'bg-red-100 text-red-700'
                            : r.status === 'skipped' ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {r.status === 'pending' && (
                            <button onClick={() => handleRemoveRecipient(r.id)}
                              className="p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recipients table for non-draft (scheduled/completed/running) campaigns */}
      {isEdit && !isDraft && recipients.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-5">
          <button onClick={() => setShowRecipients(!showRecipients)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <h2 className="font-semibold text-gray-900">Recipients ({recipients.length})</h2>
            {showRecipients ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </button>

          {showRecipients && (
            <div className="border-t border-gray-200">
              <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 z-10">
                    <tr className="text-left text-xs text-gray-500 uppercase font-medium">
                      <th className="px-4 py-2.5">Name</th>
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Phone</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recipients.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-900">{r.name}</td>
                        <td className="px-4 py-2.5 text-gray-600">{r.email}</td>
                        <td className="px-4 py-2.5 text-gray-600">{r.phone}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            r.status === 'sent' ? 'bg-green-100 text-green-700'
                            : r.status === 'failed' ? 'bg-red-100 text-red-700'
                            : r.status === 'skipped' ? 'bg-amber-100 text-amber-700'
                            : 'bg-gray-100 text-gray-600'
                          }`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs text-red-500 max-w-xs truncate">{r.error || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions - sticky at bottom */}
      {isDraft && (
        <div className="sticky bottom-0 bg-gray-50/80 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-200 flex items-center gap-3">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Campaign'}
          </button>
          {isEdit && (
            <button onClick={handleSchedule}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
              <Send size={16} /> Schedule Campaign
            </button>
          )}
        </div>
      )}
    </div>
  );
}
