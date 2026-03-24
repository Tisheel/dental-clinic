import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import { FileText, ExternalLink } from 'lucide-react';
import client from '../../api/client';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    client.get('/admin/invoices').then((res) => setInvoices(res.data)).catch(() => {});
  }, []);

  const empty = (
    <div className="px-6 py-16 text-center">
      <FileText size={32} className="mx-auto text-gray-300 mb-3" />
      <p className="text-gray-500 text-sm">No invoices generated yet.</p>
      <p className="text-gray-400 text-xs mt-1">Invoices can be generated from completed appointments.</p>
    </div>
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} generated</p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Invoice</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Service</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tax</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {invoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <span className="text-sm font-mono font-medium text-gray-900">{inv.invoiceNumber}</span>
                </td>
                <td className="px-5 py-4 text-sm text-gray-700">{inv.appointment?.userName}</td>
                <td className="px-5 py-4 text-sm text-gray-700">{inv.appointment?.service?.name}</td>
                <td className="px-5 py-4 text-sm text-gray-700 text-right">&#8377;{inv.amount}</td>
                <td className="px-5 py-4 text-sm text-gray-500 text-right">&#8377;{inv.tax}</td>
                <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-right">&#8377;{inv.total}</td>
                <td className="px-5 py-4 text-sm text-gray-500">{dayjs(inv.generatedAt).format('DD MMM YYYY')}</td>
                <td className="px-5 py-4 text-right">
                  <Link to={`/admin/invoices/${inv.id}`}
                    className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium">
                    View <ExternalLink size={12} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {invoices.length === 0 && empty}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {invoices.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200">{empty}</div>
        ) : invoices.map((inv) => (
          <div key={inv.id} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-mono font-medium text-gray-900">{inv.invoiceNumber}</span>
              <span className="text-xs text-gray-500">{dayjs(inv.generatedAt).format('DD MMM YYYY')}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-3">
              <div>
                <p className="text-xs text-gray-500">Patient</p>
                <p className="font-medium text-gray-700">{inv.appointment?.userName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Service</p>
                <p className="font-medium text-gray-700">{inv.appointment?.service?.name}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-500">&#8377;{inv.amount}</span>
                <span className="text-gray-400">+ &#8377;{inv.tax} tax</span>
                <span className="font-bold text-gray-900">= &#8377;{inv.total}</span>
              </div>
              <Link to={`/admin/invoices/${inv.id}`}
                className="text-sm text-blue-600 font-medium flex items-center gap-1">
                View <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
