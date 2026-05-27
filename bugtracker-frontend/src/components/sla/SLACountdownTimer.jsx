import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle, CheckCircle, PauseCircle, AlertTriangle } from 'lucide-react';
import useSLAStore from '../../store/slaStore';
import slaApi from '../../services/slaApi';

const SLACountdownTimer = ({ ticketId, slaType }) => {
  const [slaStatus, setSLAStatus] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSLAStatus = async () => {
      try {
        const data = await slaApi.getSLAStatus(ticketId, slaType);
        setSLAStatus(data);
        const mins = Number.isFinite(Number(data?.remainingMinutes)) ? Number(data.remainingMinutes) : 0;
        setRemainingTime(mins);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSLAStatus();
    const interval = setInterval(fetchSLAStatus, 30000);
    return () => clearInterval(interval);
  }, [ticketId, slaType]);

  useEffect(() => {
    if (Number.isFinite(Number(slaStatus?.remainingMinutes))) {
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (!Number.isFinite(prev)) return 0;
          return prev > 0 ? prev - 1 : 0;
        });
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [slaStatus]);

  if (loading) return <div className="text-gray-500">Loading SLA...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!slaStatus) return <div className="text-gray-500">No SLA data</div>;

  const getHealthColor = () => {
    if (slaStatus.isBreached) return 'bg-red-100 text-red-800 border-red-300';
    if (slaStatus.healthStatus === 'CRITICAL') return 'bg-red-100 text-red-800 border-red-300';
    if (slaStatus.healthStatus === 'WARNING') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  const getHealthIcon = () => {
    if (slaStatus.isBreached) return <AlertCircle className="w-5 h-5" />;
    if (slaStatus.healthStatus === 'CRITICAL') return <AlertTriangle className="w-5 h-5" />;
    if (slaStatus.healthStatus === 'WARNING') return <Clock className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const formatRemainingTime = (minutes) => {
    if (minutes <= 0) return 'EXPIRED';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <div className={`border rounded-lg p-4 ${getHealthColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getHealthIcon()}
          <h4 className="font-semibold">{slaType} SLA</h4>
        </div>
        <span className="text-sm font-mono">{formatRemainingTime(remainingTime)}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${slaStatus.percentageComplete}%` }}
        ></div>
      </div>

      <div className="flex justify-between text-xs">
        <span className="font-mono">{slaStatus.percentageComplete?.toFixed(1)}% complete</span>
        <span className="text-gray-600">Status: {slaStatus.status}</span>
      </div>
    </div>
  );
};

export default SLACountdownTimer;
