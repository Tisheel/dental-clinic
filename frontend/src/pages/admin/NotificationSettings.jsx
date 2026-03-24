import { useState, useEffect } from 'react';
import { MessageCircle, Mail, Save, CheckCircle } from 'lucide-react';
import client from '../../api/client';

const sections = [
  {
    title: 'WhatsApp',
    subtitle: 'Meta Cloud API Configuration',
    icon: MessageCircle,
    color: 'emerald',
    items: [
      { key: 'whatsapp_phone_number_id', label: 'Phone Number ID', type: 'text', placeholder: 'Enter your WhatsApp Phone Number ID' },
      { key: 'whatsapp_access_token', label: 'Access Token', type: 'password', placeholder: 'Enter your access token' },
    ],
  },
  {
    title: 'Email',
    subtitle: 'SMTP Configuration',
    icon: Mail,
    color: 'blue',
    items: [
      { key: 'smtp_host', label: 'SMTP Host', type: 'text', placeholder: 'e.g. smtp.gmail.com' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'text', placeholder: '587' },
      { key: 'smtp_username', label: 'Username', type: 'text', placeholder: 'your-email@gmail.com' },
      { key: 'smtp_password', label: 'Password', type: 'password', placeholder: 'App password' },
      { key: 'smtp_from', label: 'From Address', type: 'email', placeholder: 'clinic@example.com' },
    ],
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
};

export default function NotificationSettings() {
  const [config, setConfig] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    client.get('/admin/notification-config')
      .then((res) => setConfig(res.data))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await client.put('/admin/notification-config', config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure WhatsApp and email notification providers</p>
      </div>

      {sections.map((section) => {
        const Icon = section.icon;
        const c = colorMap[section.color];
        return (
          <div key={section.title} className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-9 h-9 rounded-lg ${c.bg} flex items-center justify-center`}>
                <Icon size={18} className={c.icon} />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">{section.title}</h2>
                <p className="text-xs text-gray-500">{section.subtitle}</p>
              </div>
            </div>
            <div className="space-y-4">
              {section.items.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={config[field.key] || ''}
                    onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save size={16} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
            <CheckCircle size={16} /> Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}
