import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { Filter, ChevronLeft, ChevronRight, Eye, Check, CheckCheck, X, CalendarDays, Plus } from 'lucide-react';
import client from '../../api/client';
import { StatusBadge } from './Dashboard';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: '', date_from: '', date_to: '' });
  const [showForm, setShowForm] = useState(false);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ userName: '', phoneNumber: '', email: '', serviceId: '', slot: '', notes: '' });
  const [formError, setFormError] = useState('');

  const fetchAppointments = () => {
    const params = { page, limit: 20, ...filters };
    Object.keys(params).forEach((k) => { if (!params[k]) delete params[k]; });
    client.get('/admin/appointments', { params })
      .then((res) => {
        setAppointments(res.data.appointments || []);
        setTotal(res.data.total || 0);
      })
      .catch(() => {});
  };

  useEffect(() => { fetchAppointments(); }, [page, filters]);

  useEffect(() => {
    if (showForm && services.length === 0) {
      client.get('/admin/services').then((res) => setServices(res.data)).catch(() => {});
    }
  }, [showForm]);

  const updateStatus = async (id, status) => {
    try {
      await client.put(`/admin/appointments/${id}`, { status });
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  const resetForm = () => {
    setForm({ userName: '', phoneNumber: '', email: '', serviceId: '', slot: '', notes: '' });
    setFormError('');
    setShowForm(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await client.post('/admin/appointments', {
        userName: form.userName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        serviceId: Number(form.serviceId),
        slot: form.slot,
        notes: form.notes,
      });
      resetForm();
      fetchAppointments();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create appointment');
    }
  };

  const totalPages = Math.ceil(total / 20);
  const hasFilters = filters.status || filters.date_from || filters.date_to;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">{total} total appointment{total !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> New Appointment
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-900">New Appointment</h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
              <X size={18} />
            </button>
          </div>
          {formError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{formError}</div>
          )}
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient Name *</label>
                <input type="text" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Patient full name" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                <input type="tel" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 XXXXX XXXXX" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="patient@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service *</label>
                <select value={form.serviceId} onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required>
                  <option value="">Select service</option>
                  {services.filter(s => s.active).map((svc) => (
                    <option key={svc.id} value={svc.id}>{svc.name} ({svc.duration} min - Rs.{svc.price})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time *</label>
                <input type="datetime-local" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any notes..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Create Appointment
              </button>
              <button type="button" onClick={resetForm}
                className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-6">
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Filter size={14} />
            <span className="font-medium">Filters</span>
          </div>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <select
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1 sm:flex-none min-w-0"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => { setFilters({ ...filters, date_from: e.target.value }); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-0"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => { setFilters({ ...filters, date_to: e.target.value }); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-0"
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => { setFilters({ status: '', date_from: '', date_to: '' }); setPage(1); }}
              className="text-sm text-red-500 hover:text-red-700 font-medium"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {appointments.map((appt) => (
              <tr key={appt.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                      {appt.userName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{appt.userName}</p>
                      <p className="text-xs text-gray-500">{appt.phoneNumber}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{appt.service?.name}</td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-900">{dayjs(appt.slot).format('DD MMM YYYY')}</p>
                  <p className="text-xs text-gray-500">{dayjs(appt.slot).format('hh:mm A')}</p>
                </td>
                <td className="px-5 py-4"><StatusBadge status={appt.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex gap-1 justify-end">
                    {appt.status === 'pending' && (
                      <button onClick={() => updateStatus(appt.id, 'confirmed')} title="Confirm"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors">
                        <Check size={16} />
                      </button>
                    )}
                    {(appt.status === 'pending' || appt.status === 'confirmed') && (
                      <>
                        <button onClick={() => updateStatus(appt.id, 'completed')} title="Complete"
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors">
                          <CheckCheck size={16} />
                        </button>
                        <button onClick={() => updateStatus(appt.id, 'cancelled')} title="Cancel"
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    )}
                    <Link to={`/admin/appointments/${appt.id}`} title="View details"
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                      <Eye size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="px-6 py-16 text-center">
            <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No appointments found.</p>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
            <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No appointments found.</p>
          </div>
        ) : appointments.map((appt) => (
          <div key={appt.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                  {appt.userName?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{appt.userName}</p>
                  <p className="text-xs text-gray-500">{appt.phoneNumber}</p>
                </div>
              </div>
              <StatusBadge status={appt.status} />
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium text-gray-700">{appt.service?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-medium text-gray-700">{dayjs(appt.slot).format('DD MMM, hh:mm A')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              {appt.status === 'pending' && (
                <button onClick={() => updateStatus(appt.id, 'confirmed')}
                  className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg font-medium">Confirm</button>
              )}
              {(appt.status === 'pending' || appt.status === 'confirmed') && (
                <>
                  <button onClick={() => updateStatus(appt.id, 'completed')}
                    className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg font-medium">Complete</button>
                  <button onClick={() => updateStatus(appt.id, 'cancelled')}
                    className="text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg font-medium">Cancel</button>
                </>
              )}
              <Link to={`/admin/appointments/${appt.id}`}
                className="ml-auto text-xs text-blue-600 font-medium px-3 py-1.5">View</Link>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
