import { useState, useEffect } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight, X, Clock, IndianRupee } from 'lucide-react';
import client from '../../api/client';

export default function Services() {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', duration: 30, price: 0 });

  const fetchServices = () => {
    client.get('/admin/services').then((res) => setServices(res.data)).catch(() => {});
  };

  useEffect(() => { fetchServices(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', duration: 30, price: 0 });
    setEditing(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await client.put(`/admin/services/${editing}`, form);
      } else {
        await client.post('/admin/services', form);
      }
      fetchServices();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save service');
    }
  };

  const handleEdit = (svc) => {
    setForm({ name: svc.name, description: svc.description, duration: svc.duration, price: svc.price });
    setEditing(svc.id);
    setShowForm(true);
  };

  const toggleActive = async (svc) => {
    try {
      if (svc.active) {
        await client.delete(`/admin/services/${svc.id}`);
      } else {
        await client.put(`/admin/services/${svc.id}/activate`);
      }
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-500 mt-1">{services.length} service{services.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus size={16} /> Add Service
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Service' : 'New Service'}</h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Teeth Cleaning" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the service" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration (minutes)</label>
                <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required min="15" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Price</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required min="0" step="0.01" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <button type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                {editing ? 'Save Changes' : 'Create Service'}
              </button>
              <button type="button" onClick={resetForm}
                className="border border-gray-200 px-5 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((svc) => (
          <div key={svc.id}
            className={`bg-white rounded-xl border p-5 transition-colors ${
              svc.active ? 'border-gray-200' : 'border-gray-100 bg-gray-50/50'
            }`}>
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-semibold ${svc.active ? 'text-gray-900' : 'text-gray-400'}`}>{svc.name}</h3>
                  {!svc.active && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">Inactive</span>
                  )}
                </div>
                <p className={`text-sm mt-1 ${svc.active ? 'text-gray-500' : 'text-gray-400'}`}>
                  {svc.description || 'No description'}
                </p>
              </div>
              <div className="flex gap-1 ml-3">
                <button onClick={() => handleEdit(svc)} title="Edit"
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                  <Pencil size={14} />
                </button>
                <button onClick={() => toggleActive(svc)} title={svc.active ? 'Deactivate' : 'Activate'}
                  className={`p-1.5 rounded-lg transition-colors ${
                    svc.active
                      ? 'text-emerald-500 hover:bg-emerald-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}>
                  {svc.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
              <span className={`flex items-center gap-1.5 text-sm ${svc.active ? 'text-gray-600' : 'text-gray-400'}`}>
                <Clock size={13} /> {svc.duration} min
              </span>
              <span className={`flex items-center gap-1 text-sm font-semibold ${svc.active ? 'text-gray-900' : 'text-gray-400'}`}>
                <IndianRupee size={13} /> {svc.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
