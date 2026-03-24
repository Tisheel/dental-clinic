import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Download } from 'lucide-react';
import client from '../../api/client';

export default function InvoicePage() {
  const { number } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef();

  useEffect(() => {
    client.get(`/invoices/${number}`)
      .then((res) => setInvoice(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [number]);

  const downloadPdf = () => {
    const content = invoiceRef.current;
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${invoice.invoiceNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; color: #1f2937; padding: 40px; }
          table { width: 100%; border-collapse: collapse; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        ${content.innerHTML}
        <script>
          window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!invoice) return <div className="text-center py-20 text-red-500">Invoice not found.</div>;

  const appt = invoice.appointment;

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">Invoice {invoice.invoiceNumber}</h1>
        <button onClick={downloadPdf}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          <Download size={16} /> Download PDF
        </button>
      </div>

      <div ref={invoiceRef} className="bg-white rounded-xl border border-gray-200 p-5 sm:p-8">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>Big Smile Dental Care</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Bangalore, Karnataka</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Phone: +91 6364562123</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>INVOICE</div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{invoice.invoiceNumber}</div>
            <div style={{ fontSize: '13px', color: '#6b7280' }}>Date: {dayjs(invoice.generatedAt).format('DD MMM YYYY')}</div>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Bill To</div>
          <div style={{ fontWeight: 600, fontSize: '15px' }}>{appt?.userName}</div>
          <div style={{ fontSize: '13px', color: '#4b5563' }}>{appt?.phoneNumber}</div>
          {appt?.email && <div style={{ fontSize: '13px', color: '#4b5563' }}>{appt?.email}</div>}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', margin: '24px 0' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', fontWeight: 600, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Service</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', fontWeight: 600, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '8px 0', fontSize: '13px', fontWeight: 600, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Duration</th>
              <th style={{ textAlign: 'right', padding: '8px 0', fontSize: '13px', fontWeight: 600, color: '#4b5563', borderBottom: '2px solid #e5e7eb' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px 0', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{appt?.service?.name}</td>
              <td style={{ padding: '12px 0', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{dayjs(appt?.slot).format('DD MMM YYYY hh:mm A')}</td>
              <td style={{ padding: '12px 0', fontSize: '13px', borderBottom: '1px solid #f3f4f6' }}>{appt?.duration} mins</td>
              <td style={{ padding: '12px 0', fontSize: '13px', borderBottom: '1px solid #f3f4f6', textAlign: 'right' }}>&#8377;{invoice.amount}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '240px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: '#4b5563' }}>Subtotal</span>
              <span>&#8377;{invoice.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '13px' }}>
              <span style={{ color: '#4b5563' }}>Tax (18% GST)</span>
              <span>&#8377;{invoice.tax}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '15px', fontWeight: 700, borderTop: '2px solid #1f2937', marginTop: '8px' }}>
              <span>Total</span>
              <span>&#8377;{invoice.total}</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '48px', textAlign: 'center', fontSize: '13px', color: '#9ca3af' }}>
          <p>Thank you for choosing Big Smile Dental Care!</p>
        </div>
      </div>
    </div>
  );
}
