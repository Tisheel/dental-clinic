import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import dayjs from 'dayjs';
import client from '../../api/client';

export default function BookingConfirmation() {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get(`/appointments/${id}/confirmation`)
      .then((res) => setAppointment(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-gray-500">Loading...</div>;
  if (!appointment) return <div className="text-center py-20 text-red-500">Appointment not found.</div>;

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl text-teal-700">&#10003;</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Booking Confirmed!</h1>
        <p className="text-gray-600 mt-2">Your appointment has been booked successfully.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID</span>
          <span className="font-mono font-medium">#{appointment.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service</span>
          <span className="font-medium">{appointment.service?.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Date & Time</span>
          <span className="font-medium">{dayjs(appointment.slot).format('DD MMM YYYY [at] hh:mm A')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Duration</span>
          <span className="font-medium">{appointment.duration} mins</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Status</span>
          <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-sm font-medium capitalize">
            {appointment.status}
          </span>
        </div>
        <hr />
        <div className="flex justify-between">
          <span className="text-gray-600">Name</span>
          <span className="font-medium">{appointment.userName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Phone</span>
          <span className="font-medium">{appointment.phoneNumber}</span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        You will receive a confirmation via WhatsApp and email shortly.
      </p>

      <Link
        to="/"
        className="block text-center mt-6 text-teal-700 hover:text-teal-900 font-medium"
      >
        Back to Home
      </Link>
    </div>
  );
}
