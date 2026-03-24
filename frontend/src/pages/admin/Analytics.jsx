import { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee, Users, CalendarDays, Percent, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import client from '../../api/client';

const COLORS = ['#0d9488', '#0891b2', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#10b981'];

function Card({ title, value, sub, icon: Icon, color = 'teal' }) {
  const colors = {
    teal: 'bg-teal-50 text-teal-700',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center shrink-0`}>
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{value}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 sm:p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [revenueByService, setRevenueByService] = useState([]);
  const [apptsByService, setApptsByService] = useState([]);
  const [apptsByStatus, setApptsByStatus] = useState([]);
  const [peakHours, setPeakHours] = useState([]);
  const [dailyAppts, setDailyAppts] = useState([]);
  const [monthlyRev, setMonthlyRev] = useState([]);
  const [topPatients, setTopPatients] = useState([]);
  const [busiestDays, setBusiestDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/admin/analytics/overview'),
      client.get('/admin/analytics/revenue-by-service'),
      client.get('/admin/analytics/appointments-by-service'),
      client.get('/admin/analytics/appointments-by-status'),
      client.get('/admin/analytics/peak-hours'),
      client.get('/admin/analytics/daily-appointments?days=30'),
      client.get('/admin/analytics/monthly-revenue'),
      client.get('/admin/analytics/top-patients'),
      client.get('/admin/analytics/busiest-days'),
    ]).then(([ov, rbs, abs, abst, ph, da, mr, tp, bd]) => {
      setOverview(ov.data);
      setRevenueByService(rbs.data || []);
      setApptsByService(abs.data || []);
      setApptsByStatus(abst.data || []);
      setPeakHours(ph.data || []);
      setDailyAppts(da.data || []);
      setMonthlyRev(mr.data || []);
      setTopPatients(tp.data || []);
      setBusiestDays(bd.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20 text-gray-400">Loading analytics...</div>;

  const rev = overview?.revenue || {};
  const appts = overview?.appointments || {};
  const patients = overview?.patients || {};

  const formattedPeakHours = peakHours.map(h => ({
    ...h,
    label: `${h.hour > 12 ? h.hour - 12 : h.hour || 12}${h.hour >= 12 ? 'PM' : 'AM'}`,
  }));

  const formattedDaily = dailyAppts.map(d => ({
    ...d,
    date: d.date?.slice(5),
  }));

  const formattedMonthly = monthlyRev.map(m => ({
    ...m,
    month: m.month?.slice(2),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Clinic performance overview</p>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card title="Today's Revenue" value={`Rs.${rev.today?.toFixed(0) || 0}`} icon={IndianRupee} color="teal" />
        <Card title="This Week" value={`Rs.${rev.week?.toFixed(0) || 0}`} icon={IndianRupee} color="blue" />
        <Card title="This Month" value={`Rs.${rev.month?.toFixed(0) || 0}`} icon={IndianRupee} color="purple" />
        <Card title="This Year" value={`Rs.${rev.year?.toFixed(0) || 0}`} icon={IndianRupee} color="emerald" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card title="Total Patients" value={patients.total || 0} sub={`${patients.newThisMonth || 0} new this month`} icon={Users} color="blue" />
        <Card title="Total Appointments" value={appts.total || 0} sub={`${appts.completed || 0} completed`} icon={CalendarDays} color="teal" />
        <Card title="Cancellation Rate" value={`${(overview?.cancellationRate || 0).toFixed(1)}%`} sub={`${appts.cancelled || 0} cancelled`} icon={Percent} color="red" />
        <Card title="Avg Revenue / Appt" value={`Rs.${(overview?.avgRevenuePerAppointment || 0).toFixed(0)}`} icon={BarChart3} color="amber" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Daily Appointments (Last 30 Days)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={formattedDaily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#0d9488" strokeWidth={2} dot={{ r: 2 }} name="Appointments" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Revenue">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={formattedMonthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `Rs.${v.toFixed(0)}`} />
              <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard title="Appointments by Status">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={apptsByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status} (${count})`}>
                {apptsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Most Booked Services">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={apptsByService} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis type="category" dataKey="serviceName" tick={{ fontSize: 11 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Service">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={revenueByService} dataKey="total" nameKey="serviceName" cx="50%" cy="50%" outerRadius={80} label={({ serviceName }) => serviceName}>
                {revenueByService.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => `Rs.${v.toFixed(0)}`} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Peak Hours">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={formattedPeakHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Busiest Days of the Week">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={busiestDays}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top Patients */}
      <ChartCard title="Top Patients by Visits">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Patient</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Total Visits</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topPatients.map((p, i) => (
                <tr key={i}>
                  <td className="py-2.5 font-medium text-gray-900">{p.userName}</td>
                  <td className="py-2.5 text-gray-500">{p.phoneNumber}</td>
                  <td className="py-2.5 text-right">{p.visits}</td>
                  <td className="py-2.5 text-right text-emerald-600 font-medium">{p.completed}</td>
                </tr>
              ))}
              {topPatients.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-gray-400">No data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}
