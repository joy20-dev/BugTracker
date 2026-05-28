import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, MessageSquare } from 'lucide-react';
import { slaApi } from '../../api';

const BreachAcknowledgmentModal = ({ breach, onClose, onAcknowledge }) => {
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await slaApi.acknowledgeBreach(breach.id, notes);
      onAcknowledge();
      onClose();
    } catch (error) {
      console.error('Error acknowledging breach:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-semibold">Acknowledge SLA Breach</h2>
        </div>

        <div className="bg-red-50 rounded-lg p-4 mb-4 text-sm">
          <p className="font-medium">{breach.slaType} SLA</p>
          <p className="text-gray-600">
            Breached by <strong>{breach.breachMinutes} minutes</strong> on{' '}
            {new Date(breach.breachTimestamp).toLocaleString()}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Acknowledgment Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this breach..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Acknowledging...' : 'Acknowledge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UnacknowledgedBreaches = () => {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBreach, setSelectedBreach] = useState(null);

  useEffect(() => {
    fetchUnacknowledgedBreaches();
  }, []);

  const fetchUnacknowledgedBreaches = async () => {
    try {
      const data = await slaApi.getUnacknowledgedBreaches();
      setBreaches(data);
    } catch (error) {
      console.error('Error fetching breaches:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-gray-500">Loading breaches...</div>;
  }

  if (breaches.length === 0) {
    return (
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle className="w-5 h-5" />
        No unacknowledged breaches
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-600">
        <AlertCircle className="w-5 h-5" />
        Unacknowledged SLA Breaches ({breaches.length})
      </h3>

      <div className="space-y-3">
        {breaches.map((breach) => (
          <div key={breach.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold">Ticket: {breach.ticketId}</h4>
                <p className="text-sm text-gray-600">{breach.slaType} SLA</p>
              </div>
              <button
                onClick={() => setSelectedBreach(breach)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Acknowledge
              </button>
            </div>
            <p className="text-sm text-gray-600">
              Breached by {breach.breachMinutes} minutes on {new Date(breach.breachTimestamp).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {selectedBreach && (
        <BreachAcknowledgmentModal
          breach={selectedBreach}
          onClose={() => setSelectedBreach(null)}
          onAcknowledge={fetchUnacknowledgedBreaches}
        />
      )}
    </div>
  );
};

export default UnacknowledgedBreaches;
