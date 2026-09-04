import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { guardianService } from '../services/guardianService';
import { Bell, LogOut, UserCheck, ShieldAlert, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export default function GuardianDashboard() {
  const { user, logout } = useAuth();
  const [invites, setInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [invitesData, requestsData] = await Promise.all([
        guardianService.getMyInvitations(),
        guardianService.getPendingRequests()
      ]);
      setInvites(invitesData.invitations || []);
      setRequests(requestsData.requests || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    }
  };

  const handleAcceptInvite = async (linkId) => {
    setError(''); setLoading(true);
    try {
      await guardianService.acceptInvite(linkId);
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept invitation.');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (requestId, reaction) => {
    if (!window.confirm(`Mark this message as ${reaction.toUpperCase()}?`)) return;
    setLoading(true);
    try {
      await guardianService.submitResponse(requestId, reaction);
      loadData(); // Refresh the list to remove the voted item
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit vote.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-ground">
      <nav className="bg-brand-dark px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl-accessible font-bold text-text-inverse">Guardian Dashboard</h1>
        <div className="flex items-center space-x-4">
          <span className="text-brand-subtle font-bold text-sm bg-black/20 px-3 py-1 rounded-full">
            {user?.name || user?.phone}
          </span>
          <button onClick={logout} className="p-2 hover:bg-black/10 rounded-full transition-colors cursor-pointer">
            <LogOut className="w-5 h-5 text-text-inverse" />
          </button>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto mt-8 p-4 space-y-8">
        
        {/* Verification Requests (Ask Family) */}
        <section>
          <div className="flex items-center space-x-2 mb-4 border-b border-surface-border pb-2">
            <ShieldAlert className="w-6 h-6 text-brand-primary" />
            <h2 className="text-xl-accessible font-bold text-text-primary">Family Review Requests</h2>
          </div>

          {requests.length === 0 ? (
            <div className="bg-surface-panel p-8 text-center border border-surface-border rounded shadow-sm">
              <Bell className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-50" />
              <p className="text-base-accessible text-text-muted">All clear. No pending messages to review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req._id} className="bg-surface-panel p-5 rounded shadow-sm border border-brand-primary/30">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-brand-dark text-lg-accessible">{req.requestedBy?.name} asked for your help</span>
                    <span className="text-xs text-text-muted font-bold">
                      {new Date(req.createdAt).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  <div className="bg-surface-ground p-4 border-l-4 border-surface-border rounded text-text-primary italic mb-4">
                    "{req.checkId?.rawText}"
                  </div>

                  <p className="text-sm font-bold text-text-muted mb-2 uppercase tracking-wide">What is your verdict?</p>
                  <div className="flex gap-3">
                    <button onClick={() => handleVote(req._id, 'safe')} disabled={loading} className="flex-1 py-2 bg-verdict-safeBg text-verdict-safe border border-verdict-safe rounded font-bold flex justify-center items-center space-x-2 hover:bg-verdict-safe hover:text-white transition-colors cursor-pointer">
                      <CheckCircle2 className="w-5 h-5" /> <span>Safe</span>
                    </button>
                    <button onClick={() => handleVote(req._id, 'suspicious')} disabled={loading} className="flex-1 py-2 bg-verdict-suspiciousBg text-verdict-suspicious border border-verdict-suspicious rounded font-bold flex justify-center items-center space-x-2 hover:bg-verdict-suspicious hover:text-white transition-colors cursor-pointer">
                      <AlertTriangle className="w-5 h-5" /> <span>Suspicious</span>
                    </button>
                    <button onClick={() => handleVote(req._id, 'scam')} disabled={loading} className="flex-1 py-2 bg-verdict-scamBg text-verdict-scam border border-verdict-scam rounded font-bold flex justify-center items-center space-x-2 hover:bg-verdict-scam hover:text-white transition-colors cursor-pointer">
                      <XCircle className="w-5 h-5" /> <span>Scam</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Invitations Section */}
        <section>
          <h2 className="text-xl-accessible font-bold text-text-primary mb-4 border-b border-surface-border pb-2">
            Pending Connections
          </h2>
          {error && <div className="mb-4 text-verdict-scam font-bold">{error}</div>}
          {invites.length === 0 ? (
            <p className="text-text-muted italic bg-surface-panel p-4 rounded border border-surface-border">No pending invitations.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {invites.map((invite) => (
                <div key={invite._id} className="bg-surface-panel p-5 rounded shadow-sm border border-surface-border flex justify-between items-center">
                  <div>
                    <p className="font-bold text-text-primary text-lg-accessible">{invite.primaryUser?.name}</p>
                    <p className="text-text-muted font-mono mt-1">+{invite.primaryUser?.phone}</p>
                  </div>
                  <button onClick={() => handleAcceptInvite(invite._id)} disabled={loading} className="bg-brand-primary hover:bg-brand-dark text-text-inverse px-5 py-2 rounded font-bold flex items-center space-x-2 transition-colors cursor-pointer">
                    <UserCheck className="w-5 h-5" /> <span>Accept</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}