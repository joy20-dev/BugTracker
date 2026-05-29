import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import slaApi from '../../services/slaApi';

const SLADetailsPanel = ({ ticketId }) => {
  const [slas, setSLAs] = useState([]);
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSLAData = async () => {
      try {
        const [slaData, breachData] = await Promise.all([
          slaApi.getTicketSLAs(ticketId),
          slaApi.getBreachesByTicketId(ticketId),
        ]);
        setSLAs(slaData);
        setBreaches(breachData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSLAData();
  }, [ticketId]);

  if (loading) return <div className="text-gray-500">Loading SLA details...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Clock className="w-5 h-5" />
        SLA Details
      </h3>

      {slas.length > 0 ? (
        <div className="space-y-4">
          {slas.map((sla) => (
            <div key={sla.id} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold">{sla.slaType}</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sla.isBreached 
                    ? 'bg-red-100 text-red-800' 
                    : sla.status === 'ACTIVE'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {sla.isBreached ? 'BREACHED' : sla.status}
                </span>
              </div>

              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-600">Start Time</p>
                  <p className="font-mono">{new Date(sla.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Time</p>
                  <p className="font-mono">{new Date(sla.endTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining</p>
                  <p className="font-mono">{sla.remainingMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-gray-600">Health</p>
                  <p className="font-mono">{sla.healthStatus}</p>
                </div>
              </div>

              {sla.isBreached && sla.breachTimestamp && (
                <div className="mt-3 pt-3 border-t text-sm">
                  <p className="text-red-600 font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Breached at {new Date(sla.breachTimestamp).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No SLA tracking data available</p>
      )}

      {breaches.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <h4 className="font-semibold mb-3 flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            SLA Breaches ({breaches.length})
          </h4>
          <div className="space-y-2">
            {breaches.map((breach) => (
              <div key={breach.id} className="bg-red-50 rounded-lg p-3 text-sm">
                <p className="font-medium">{breach.slaType} SLA Breach</p>
                <p className="text-gray-600">
                  Breached by {breach.breachMinutes} minutes on {new Date(breach.breachTimestamp).toLocaleString()}
                </p>
                {breach.isAcknowledged && (
                  <p className="text-green-600 mt-1">
                    ✓ Acknowledged by user
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SLADetailsPanel;
