import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { getCached } from '../../api/cache';
import SlotPicker from '../../components/SlotPicker';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    serviceId: '',
    slot: '',
    userName: '',
    phoneNumber: '',
    email: '',
    notes: '',
  });

  useEffect(() => {
    getCached('/services').then(setServices).catch(() => {});
  }, []);

  const selectedService = services.find((s) => s.id === Number(form.serviceId));

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const res = await client.post('/appointments', {
        userName: form.userName,
        phoneNumber: form.phoneNumber,
        email: form.email,
        slot: form.slot,
        serviceId: Number(form.serviceId),
        notes: form.notes,
      });
      navigate(`/booking/${res.data.id}/confirmation`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Service', 'Date & Time', 'Details', 'Confirm'];

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-12 px-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 sm:mb-8">Book an Appointment</h1>

      {/* Progress - compact on mobile */}
      <div className="flex items-center mb-6 sm:mb-8">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center flex-1">
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
              step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-teal-700 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`ml-1.5 sm:ml-2 text-xs sm:text-sm hidden min-[480px]:inline ${step === i + 1 ? 'text-teal-700 font-medium' : 'text-gray-500'}`}>
              {label}
            </span>
            {i < 3 && <div className="flex-1 h-px bg-gray-300 mx-2 sm:mx-3" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Select a Service</h2>
          <div className="space-y-3">
            {services.map((svc) => (
              <label
                key={svc.id}
                className={`block p-3 sm:p-4 rounded-lg border cursor-pointer transition ${
                  form.serviceId == svc.id
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <input
                  type="radio"
                  name="service"
                  value={svc.id}
                  checked={form.serviceId == svc.id}
                  onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                  className="sr-only"
                />
                <div className="flex justify-between items-start sm:items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{svc.name}</p>
                    <p className="text-sm text-gray-500 truncate">{svc.description} ({svc.duration} mins)</p>
                  </div>
                  <span className="font-bold text-teal-700 whitespace-nowrap">&#8377;{svc.price}</span>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!form.serviceId}
            className="mt-6 w-full bg-teal-700 text-white py-3 rounded-lg font-medium hover:bg-teal-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 2: Select Slot */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Choose Date & Time for {selectedService?.name}
          </h2>
          <SlotPicker
            serviceId={Number(form.serviceId)}
            onSelect={(slot) => setForm({ ...form, slot })}
          />
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="flex-1 border border-gray-300 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!form.slot}
              className="flex-1 bg-teal-700 text-white py-3 rounded-lg font-medium hover:bg-teal-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: User Details */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => setForm({ ...form, userName: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Any special requirements..."
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="flex-1 border border-gray-300 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!form.userName || !form.phoneNumber}
              className="flex-1 bg-teal-700 text-white py-3 rounded-lg font-medium hover:bg-teal-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Review
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Confirm Booking</h2>
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 space-y-3 text-sm sm:text-base">
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Service</span>
              <span className="font-medium text-right">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium text-right">{form.slot.replace('T', ' at ')}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{selectedService?.duration} mins</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Price</span>
              <span className="font-bold text-teal-700">&#8377;{selectedService?.price}</span>
            </div>
            <hr />
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Name</span>
              <span className="font-medium text-right">{form.userName}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Phone</span>
              <span className="font-medium">{form.phoneNumber}</span>
            </div>
            {form.email && (
              <div className="flex justify-between gap-2">
                <span className="text-gray-600">Email</span>
                <span className="font-medium text-right truncate">{form.email}</span>
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(3)} className="flex-1 border border-gray-300 py-3 rounded-lg text-gray-600 hover:bg-gray-50">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300"
            >
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
