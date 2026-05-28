import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import slaApi from '../../services/slaApi';

const SLAPolicyManager = ({ projectId }) => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    priority_level: '',
    sla_type: '',
    sla_minutes: '',
    include_weekends: true,
    include_business_hours_only: false,
    business_hours_start: '09:00',
    business_hours_end: '18:00',
    is_active: true,
  });

  useEffect(() => {
    fetchPolicies();
  }, [projectId]);

  const fetchPolicies = async () => {
    try {
      const data = await slaApi.getPoliciesByProjectId(projectId);
      setPolicies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (policy) => {
    setEditingId(policy.id);
    setFormData(policy);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        sla_minutes: parseInt(formData.sla_minutes, 10) || 0,
        include_weekends: formData.include_weekends,
        include_business_hours_only: formData.include_business_hours_only,
        business_hours_start: formData.business_hours_start,
        business_hours_end: formData.business_hours_end,
        is_active: formData.is_active,
      };

      if (editingId) {
        await slaApi.updatePolicy(editingId, payload);
      } else {
        await slaApi.createPolicy({
          project_id: projectId,
          priority_level: formData.priority_level,
          sla_type: formData.sla_type,
          ...payload,
        });
      }

      setEditingId(null);
      setShowForm(false);
      setFormData({
        priority_level: '',
        sla_type: '',
        sla_minutes: '',
        include_weekends: true,
        include_business_hours_only: false,
        business_hours_start: '09:00',
        business_hours_end: '18:00',
        is_active: true,
      });
      fetchPolicies();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this policy?')) {
      try {
        await slaApi.deletePolicy(id);
        fetchPolicies();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (loading) return <div className="text-gray-500">Loading policies...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">SLA Policies</h2>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              priority_level: '',
              sla_type: '',
              sla_minutes: '',
              include_weekends: true,
              include_business_hours_only: false,
              business_hours_start: '09:00',
              business_hours_end: '18:00',
              is_active: true,
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Policy
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priority Level</label>
              <select
                disabled={editingId !== null}
                value={formData.priority_level || ''}
                onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select Priority</option>
                <option value="P1">P1 - Critical</option>
                <option value="P2">P2 - High</option>
                <option value="P3">P3 - Medium</option>
                <option value="P4">P4 - Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SLA Type</label>
              <select
                disabled={editingId !== null}
                value={formData.sla_type || ''}
                onChange={(e) => setFormData({ ...formData, sla_type: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 disabled:bg-gray-100"
              >
                <option value="">Select Type</option>
                <option value="RESPONSE">Response</option>
                <option value="RESOLUTION">Resolution</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SLA Minutes</label>
              <input
                type="number"
                value={formData.sla_minutes || ''}
                onChange={(e) => setFormData({ ...formData, sla_minutes: parseInt(e.target.value, 10) || '' })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.include_weekends}
                  onChange={(e) => setFormData({ ...formData, include_weekends: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Include weekends</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.include_business_hours_only}
                  onChange={(e) => setFormData({ ...formData, include_business_hours_only: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm font-medium">Business hours only</label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business hours start</label>
              <input
                type="time"
                value={formData.business_hours_start}
                onChange={(e) => setFormData({ ...formData, business_hours_start: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Business hours end</label>
              <input
                type="time"
                value={formData.business_hours_end}
                onChange={(e) => setFormData({ ...formData, business_hours_end: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active !== false}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Active</label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-2 text-left">Priority</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">SLA (Minutes)</th>
              <th className="px-4 py-2 text-left">Weekends</th>
              <th className="px-4 py-2 text-left">Hours</th>
              <th className="px-4 py-2 text-left">Active</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((policy) => (
              <tr key={policy.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{policy.priority_level}</td>
                <td className="px-4 py-2">{policy.sla_type}</td>
                <td className="px-4 py-2">{policy.sla_minutes}</td>
                <td className="px-4 py-2">{policy.include_weekends ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">
                  {policy.include_business_hours_only ? `${policy.business_hours_start} → ${policy.business_hours_end}` : 'Anytime'}
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    policy.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {policy.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => handleEdit(policy)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SLAPolicyManager;
