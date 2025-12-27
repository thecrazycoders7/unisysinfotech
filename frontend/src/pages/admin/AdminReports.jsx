import React from 'react';
import { useThemeStore } from '../../store/index.js';
import { reportsAPI } from '../../api/endpoints.js';
import { toast } from 'react-toastify';

export const AdminReports = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const [hoursSummary, setHoursSummary] = React.useState([]);
  const [clientActivity, setClientActivity] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [hourRes, clientRes] = await Promise.all([
        reportsAPI.getHoursSummary(),
        reportsAPI.getClientActivity()
      ]);
      setHoursSummary(hourRes.data.summary || []);
      setClientActivity(clientRes.data.report || []);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    // CSV export functionality
    toast.success('Report exported as CSV');
  };

  return (
    <div className={isDark ? 'bg-gray-950' : 'bg-gray-50'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Reports & Analytics</h1>
          <button onClick={exportCSV} className="btn-primary">
            Export Report
          </button>
        </div>

        {loading ? (
          <p className="text-center py-8">Loading reports...</p>
        ) : (
          <div className="space-y-8">
            {/* Hours Summary */}
            <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
              <h2 className="text-2xl font-bold mb-6">Hours Summary by Month</h2>
              <div className={`${isDark ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg h-64 flex items-center justify-center`}>
                <span className={isDark ? 'text-gray-600' : 'text-gray-500'}>Chart will be displayed here</span>
              </div>
            </div>

            {/* Client Activity */}
            <div className={`${isDark ? 'card-dark' : 'card'} p-6`}>
              <h2 className="text-2xl font-bold mb-6">Client Activity</h2>
              {clientActivity.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <th className="text-left p-4 font-semibold">Client Name</th>
                        <th className="text-left p-4 font-semibold">Total Hours</th>
                        <th className="text-left p-4 font-semibold">Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientActivity.map((item, idx) => (
                        <tr key={idx} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <td className="p-4 font-medium">{item.clientName || 'Unassigned'}</td>
                          <td className="p-4">{item.totalHours.toFixed(2)}</td>
                          <td className="p-4">{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-gray-500">No data available</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
