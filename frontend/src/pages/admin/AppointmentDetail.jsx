import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { ArrowLeft, Check, CheckCheck, X, FileText, Save, Phone, Mail, Clock, Stethoscope, IndianRupee } from 'lucide-react';
import client from '../../api/client';
import { StatusBadge } from './Dashboard';

export default function AppointmentDetail() {
  const { id } = useParams();
  const [appt, setAppt] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const fetchAppt = () => {
    client.get(`/admin/appointments/${id}`)
      .then((res) => { setAppt(res.data); setNotes(res.data.notes || ''); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppt(); }, [id]);

  const updateStatus = async (status) => {
    try {
      await client.put(`/admin/appointments/${id}`, { status });
      fetchAppt();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const saveNotes = async () => {
    try {
      await client.put(`/admin/appointments/${id}`, { notes });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save notes');
    }
  };

  const generateInvoice = async () => {
    setInvoiceLoading(true);
    try {
      const res = await client.post(`/admin/appointments/${id}/invoice`);
      window.open(`/admin/invoices/${res.data.id}`, '_blank');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to generate invoice');
    } finally {
      setInvoiceLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading...</div>;
  if (!appt) return <div className="text-red-500 py-20 text-center">Appointment not found.</div>;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link to="/admin/appointments" className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors shrink-0">
          <ArrowLeft size={16} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Appointment #{appt.id}</h1>
            <StatusBadge status={appt.status} />
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Created {dayjs(appt.createdAt).format('DD MMM YYYY [at] hh:mm A')}</p>
        </div>
      </div>

      {/* Actions - shown at top on mobile for quick access */}
      <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Actions</h2>
        <div className="flex flex-wrap gap-2">
          {appt.status === 'pending' && (
            <button onClick={() => updateStatus('confirmed')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
              <Check size={14} /> Confirm
            </button>
          )}
          {(appt.status === 'pending' || appt.status === 'confirmed') && (
            <>
              <button onClick={() => updateStatus('completed')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100">
                <CheckCheck size={14} /> Complete
              </button>
              <button onClick={() => updateStatus('cancelled')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100">
                <X size={14} /> Cancel
              </button>
            </>
          )}
          {appt.status === 'completed' && (
            <button onClick={generateInvoice} disabled={invoiceLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50">
              <FileText size={14} /> {invoiceLoading ? 'Generating...' : 'Generate Invoice'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Patient Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Patient Information</h2>
            <div className="flex items-center gap-3 sm:gap-4 mb-5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center text-base sm:text-lg font-bold text-blue-700 shrink-0">
                {appt.userName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-semibold text-gray-900">{appt.userName}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone size={12} /> {appt.phoneNumber}
                  </span>
                  {appt.email && (
                    <span className="flex items-center gap-1 text-sm text-gray-500 truncate">
                      <Mail size={12} /> {appt.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Stethoscope size={14} className="text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Service</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{appt.service?.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-gray-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="text-sm font-medium text-gray-900">{dayjs(appt.slot).format('DD MMM, hh:mm A')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-medium text-gray-900">{appt.duration} min</p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                  <IndianRupee size={14} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Price</p>
                  <p className="text-sm font-bold text-gray-900">&#8377;{appt.service?.price}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
              className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Add notes about this appointment..."
            />
            <div className="flex items-center gap-3 mt-3">
              <button onClick={saveNotes}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                <Save size={14} /> Save Notes
              </button>
              {notesSaved && <span className="text-sm text-emerald-600 font-medium">Saved!</span>}
            </div>
          </div>
        </div>

        {/* Sidebar Actions - desktop only */}
        <div className="hidden lg:block space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Actions</h2>
            <div className="space-y-2">
              {appt.status === 'pending' && (
                <button onClick={() => updateStatus('confirmed')}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                  <Check size={16} /> Confirm Appointment
                </button>
              )}
              {(appt.status === 'pending' || appt.status === 'confirmed') && (
                <>
                  <button onClick={() => updateStatus('completed')}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                    <CheckCheck size={16} /> Mark Completed
                  </button>
                  <button onClick={() => updateStatus('cancelled')}
                    className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition-colors">
                    <X size={16} /> Cancel Appointment
                  </button>
                </>
              )}
              {appt.status === 'completed' && (
                <button onClick={generateInvoice} disabled={invoiceLoading}
                  className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 disabled:opacity-50 transition-colors">
                  <FileText size={16} /> {invoiceLoading ? 'Generating...' : 'Generate Invoice'}
                </button>
              )}
              {(appt.status === 'completed' || appt.status === 'cancelled') && (
                <p className="text-xs text-gray-400 text-center pt-2">
                  No further status changes available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
