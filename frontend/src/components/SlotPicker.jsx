import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import client from '../api/client';

export default function SlotPicker({ serviceId, onSelect }) {
  const [date, setDate] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [slots, setSlots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!serviceId || !date) return;
    setLoading(true);
    setSelected(null);
    client.get(`/slots?date=${date}&service_id=${serviceId}`)
      .then((res) => setSlots(res.data))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [date, serviceId]);

  const handleSelect = (slot) => {
    if (!slot.available) return;
    setSelected(slot.time);
    onSelect(`${date}T${slot.time}`);
  };

  const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Date
      </label>
      <input
        type="date"
        value={date}
        min={minDate}
        onChange={(e) => setDate(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
      />

      <label className="block text-sm font-medium text-gray-700 mb-2">
        Available Slots
      </label>
      {loading ? (
        <p className="text-gray-500 text-sm">Loading slots...</p>
      ) : slots.length === 0 ? (
        <p className="text-gray-500 text-sm">No slots available for this date.</p>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => handleSelect(slot)}
              disabled={!slot.available}
              className={`py-2.5 px-2 sm:px-3 rounded-lg text-sm font-medium border transition ${
                selected === slot.time
                  ? 'bg-teal-700 text-white border-teal-700'
                  : slot.available
                  ? 'bg-white text-gray-700 border-gray-300 hover:border-teal-400'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              {slot.time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
