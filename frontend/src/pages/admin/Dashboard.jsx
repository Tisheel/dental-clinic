import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { CalendarDays, Clock, TrendingUp, ArrowRight } from 'lucide-react';
import client from '../../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [todayAppts, setTodayAppts] = useState([]);

  useEffect(() => {
    client.get('/admin/dashboard').then((res) => setStats(res.data)).catch(() => {});
    client.get('/admin/appointments', { params: { date: dayjs().format('YYYY-MM-DD'), limit: 10 } })
      .then((res) => setTodayAppts(res.data.appointments || []))
      .catch(() => {});
  }, []);

  const cards = [
    { label: "Today's Appointments", value: stats?.todayTotal ?? '-', icon: CalendarDays, color: 'blue' },
    { label: 'Pending Today', value: stats?.todayPending ?? '-', icon: Clock, color: 'amber' },
    { label: 'This Week', value: stats?.weekTotal ?? '-', icon: TrendingUp, color: 'emerald' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  };

  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">{dayjs().format('dddd, DD MMMM YYYY')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          const c = colorMap[card.color];
          return (
            <div key={card.label} className={`bg-white rounded-xl border ${c.border} p-4 sm:p-6`}>
              <div className="flex items-center gap-3 sm:block">
                <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center shrink-0 sm:mb-4`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5 sm:mt-1">{card.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-gray-900">Today's Appointments</h2>
            <p className="text-xs text-gray-500 mt-0.5">{todayAppts.length} appointment{todayAppts.length !== 1 ? 's' : ''} scheduled</p>
          </div>
          <Link to="/admin/appointments" className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
            <span className="hidden sm:inline">View all</span> <ArrowRight size={14} />
          </Link>
        </div>
        {todayAppts.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <CalendarDays size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No appointments for today.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {todayAppts.map((appt) => (
              <Link key={appt.id} to={`/admin/appointments/${appt.id}`}
                className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600 shrink-0">
                    {appt.userName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{appt.userName}</p>
                    <p className="text-xs text-gray-500 truncate">{appt.service?.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-2">
                  <span className="text-xs sm:text-sm text-gray-600 font-mono">{dayjs(appt.slot).format('hh:mm A')}</span>
                  <StatusBadge status={appt.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    confirmed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
    completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
  };
  return (
    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset capitalize ${styles[status] || 'bg-gray-50 text-gray-700 ring-gray-600/20'}`}>
      {status}
    </span>
  );
}
