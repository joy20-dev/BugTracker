import React, { useState, useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import slaApi from '../../services/slaApi';

const SLAMetricsDashboard = ({ projectId }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchMetrics = async () => {
    try {
      // Use aggregate metrics if no projectId, otherwise use project-specific metrics
      const data = projectId 
        ? await slaApi.getProjectMetrics(projectId)
        : await slaApi.getAggregateMetrics();
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching SLA metrics:', err);
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-gray-500">Loading metrics...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!metrics) return null;

  const breachChartData = [
    {
      name: 'Active',
      value: metrics.activeSLAs,
    },
    {
      name: 'Completed',
      value: metrics.completedSLAs,
    },
    {
      name: 'Breached',
      value: metrics.breachedSLAs,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-2xl font-semibold mb-6">SLA Metrics Dashboard</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Total SLAs</p>
          <p className="text-3xl font-bold">{metrics.totalSLAs}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold">{metrics.completedSLAs}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-3xl font-bold">{metrics.activeSLAs}</p>
        </div>
        <div className={`rounded-lg p-4 ${metrics.breachedSLAs > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
          <p className="text-gray-600 text-sm">Breached</p>
          <p className={`text-3xl font-bold ${metrics.breachedSLAs > 0 ? 'text-red-600' : ''}`}>
            {metrics.breachedSLAs}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">SLA Distribution</h3>
          <div className="space-y-4">
            {breachChartData.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                  <span>{item.name}</span>
                  <span>{item.value ?? 0}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200">
                  <div
                    className="h-3 rounded-full bg-sky-600"
                    style={{ width: `${Math.min(100, Math.round(((item.value ?? 0) / Math.max(1, metrics.totalSLAs ?? 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-4">Breach Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Breach Rate</span>
                <span className="text-sm font-bold">{(metrics.breachPercentage ?? 0).toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full"
                  style={{ width: `${Math.min(metrics.breachPercentage ?? 0, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Average Response Time</p>
              <p className="text-2xl font-bold">{metrics.averageResponseTime ?? 0} min</p>
            </div>

            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">Average Resolution Time</p>
              <p className="text-2xl font-bold">{metrics.averageResolutionTime ?? 0} min</p>
            </div>
          </div>
        </div>
      </div>

      {metrics.breachPercentage > 10 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-red-800">High Breach Rate Alert</h4>
            <p className="text-sm text-red-700 mt-1">
              Your project has a {metrics.breachPercentage.toFixed(1)}% SLA breach rate. 
              Consider reviewing SLA policies or resource allocation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SLAMetricsDashboard;
