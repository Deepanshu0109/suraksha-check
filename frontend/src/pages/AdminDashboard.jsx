import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPendingPatterns();
      setPatterns(data);
    } catch (err) {
      console.error('Failed to fetch patterns:', err);
      setError('Failed to load pending patterns. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    // Optimistic UI update: Remove it from the list instantly
    setPatterns((prev) => prev.filter((p) => p._id !== id));
    try {
      await adminService.approvePattern(id);
    } catch (err) {
      console.error('Failed to approve:', err);
      // If it fails, fetch the real list again to correct the UI
      fetchPatterns();
    }
  };

  const handleReject = async (id) => {
    // Optimistic UI update: Remove it from the list instantly
    setPatterns((prev) => prev.filter((p) => p._id !== id));
    try {
      await adminService.rejectPattern(id);
    } catch (err) {
      console.error('Failed to reject:', err);
      fetchPatterns(); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-lg">Loading pending patterns...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Review AI-flagged scam patterns</p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {patterns.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
            <p className="text-gray-500 text-lg">No pending patterns to review! You're all caught up.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {patterns.map((pattern) => (
              <div key={pattern._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {pattern.category}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      Seen {pattern.occurrenceCount} {pattern.occurrenceCount === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium whitespace-pre-wrap">
                    "{pattern.patternText}"
                  </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleReject(pattern._id)}
                    className="flex-1 md:flex-none px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(pattern._id)}
                    className="flex-1 md:flex-none px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
                  >
                    Approve
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}