import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { slaApi } from '../../api';

const SLABreachBadge = ({ ticketId }) => {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreaches = async () => {
      try {
        const data = await slaApi.getBreachesByTicketId(ticketId);
        setBreaches(data);
      } catch (err) {
        console.error('Error fetching breaches:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBreaches();
  }, [ticketId]);

  if (loading) return null;

  const unacknowledgedCount = breaches.filter((b) => !b.isAcknowledged).length;

  if (unacknowledgedCount === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3" />
        No SLA Breaches
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
      <AlertCircle className="w-3 h-3" />
      {unacknowledgedCount} SLA Breach{unacknowledgedCount > 1 ? 'es' : ''}
    </span>
  );
};

export default SLABreachBadge;
