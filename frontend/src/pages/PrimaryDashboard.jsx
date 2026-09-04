import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { guardianService } from '../services/guardianService';
import { checkService } from '../services/checkService';
import { ShieldCheck, MessageCircle, Users, UserPlus, Clock, CheckCircle2, Trash2, AlertTriangle, XCircle, Volume2, Share2, Square, UserCircle, ChevronDown } from 'lucide-react';

export default function PrimaryDashboard() {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('checks');
  
  // States
  const [guardians, setGuardians] = useState([]);
  const [checks, setChecks] = useState([]);
  const [invitePhone, setInvitePhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // UX States
  const [expandedId, setExpandedId] = useState(null); 
  const [playingId, setPlayingId] = useState(null);
  const [audioElement, setAudioElement] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (activeTab === 'family') loadGuardians();
    else if (activeTab === 'checks') loadChecks();
  }, [activeTab]);

  const loadGuardians = async () => {
    try {
      const data = await guardianService.getMyGuardians();
      setGuardians(data.links || []);
    } catch (err) {
      console.error('Failed to load guardians', err);
    }
  };

  const loadChecks = async () => {
    try {
      const data = await checkService.getMyChecks();
      setChecks(data.checks || []);
    } catch (err) {
      console.error('Failed to load checks', err);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // --- AUDIO HANDLER ---
  const handlePlayAudio = (e, check) => {
    e.stopPropagation();
    
    if (playingId === check._id) {
      if (audioElement) { audioElement.pause(); setAudioElement(null); }
      window.speechSynthesis.cancel(); 
      setPlayingId(null);
      return; 
    }

    if (audioElement) { audioElement.pause(); setAudioElement(null); }
    window.speechSynthesis.cancel(); 
    setPlayingId(check._id);

    const playNativeTTS = () => {
      const utterance = new SpeechSynthesisUtterance(check.explanation);
      utterance.lang = check.language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.onend = () => { if (playingId === check._id) setPlayingId(null); };
      window.speechSynthesis.speak(utterance);
    };

    if (check.audioUrl) {
      const formattedUrl = check.audioUrl.startsWith('http') ? check.audioUrl : `http://localhost:5000${check.audioUrl}`;
      const audio = new Audio(formattedUrl);
      
      audio.onended = () => { if (playingId === check._id) setPlayingId(null); };
      audio.onerror = () => playNativeTTS();

      audio.play()
        .then(() => setAudioElement(audio))
        .catch(() => playNativeTTS());
    } else {
      playNativeTTS();
    }
  };

  const handleAskFamily = async (e, checkId) => {
    e.stopPropagation();
    setActionLoading(checkId);
    try {
      await guardianService.requestVerification(checkId);
      await loadChecks(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send to family.");
    } finally {
      setActionLoading(null);
    }
  };

  // --- FAMILY TAB LOGIC ---
  const handleInvite = async (e) => { 
    e.preventDefault(); setError(''); setSuccess('');
    const cleanPhone = invitePhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) return setError('Enter a valid 10-digit phone number.');
    setLoading(true);
    try { await guardianService.inviteGuardian(cleanPhone); setSuccess('Invitation sent!'); setInvitePhone(''); loadGuardians(); } 
    catch (err) { setError(err.response?.data?.error || 'Failed to send invite.'); } 
    finally { setLoading(false); }
  };

  const handleRemoveLink = async (linkId) => {
    if (!window.confirm("Are you sure you want to remove this Guardian?")) return;
    try { await guardianService.removeLink(linkId); loadGuardians(); } 
    catch (err) { alert("Failed to remove Guardian."); }
  };

  const getVerdictStyle = (verdict) => {
    switch(verdict) {
      case 'safe': return { bg: 'bg-verdict-safe/10', border: 'border-verdict-safe', text: 'text-verdict-safe', icon: <CheckCircle2 className="w-6 h-6 shrink-0" />, label: 'Safe Message' };
      case 'suspicious': return { bg: 'bg-verdict-suspicious/10', border: 'border-verdict-suspicious', text: 'text-verdict-suspicious', icon: <AlertTriangle className="w-6 h-6 shrink-0" />, label: 'Be Careful' };
      case 'scam': return { bg: 'bg-verdict-scam/10', border: 'border-verdict-scam', text: 'text-verdict-scam', icon: <XCircle className="w-6 h-6 shrink-0" />, label: 'Scam Detected' };
      default: return { bg: 'bg-surface-header', border: 'border-surface-border', text: 'text-text-muted', icon: <Clock className="w-6 h-6 shrink-0" />, label: 'Analyzing...' };
    }
  };

  return (
    <div className="min-h-screen bg-surface-ground flex flex-col max-w-md mx-auto shadow-xl border-x border-surface-border font-sans">
      <header className="bg-brand-dark text-text-inverse p-5 flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-8 h-8 text-brand-light" />
          <h1 className="text-2xl font-bold tracking-wide">SurakshaCheck</h1>
        </div>
        <button onClick={logout} className="text-sm font-bold opacity-80 hover:opacity-100 cursor-pointer">Logout</button>
      </header>

      {/* Tabs */}
      <div className="bg-brand-dark text-text-inverse/80 flex text-lg-accessible font-bold shadow-md">
        <button onClick={() => setActiveTab('checks')} className={`flex-1 pb-4 pt-3 border-b-4 transition-colors ${activeTab === 'checks' ? 'border-brand-light text-text-inverse' : 'border-transparent hover:text-text-inverse'}`}>
          <div className="flex justify-center items-center space-x-2"><MessageCircle className="w-5 h-5" /><span>My Checks</span></div>
        </button>
        <button onClick={() => setActiveTab('family')} className={`flex-1 pb-4 pt-3 border-b-4 transition-colors ${activeTab === 'family' ? 'border-brand-light text-text-inverse' : 'border-transparent hover:text-text-inverse'}`}>
          <div className="flex justify-center items-center space-x-2"><Users className="w-5 h-5" /><span>Family</span></div>
        </button>
      </div>

      <main className="flex-1 p-4 overflow-y-auto">
        {activeTab === 'checks' ? (
          <div className="space-y-3 pb-6">
            {checks.length === 0 ? (
              <div className="text-text-muted text-center bg-surface-panel p-8 rounded-xl shadow-sm border border-surface-border mt-4">
                <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-40 text-brand-primary" />
                <p className="text-lg-accessible">Forward a suspicious message to our WhatsApp bot, and it will appear here!</p>
              </div>
            ) : (
              checks.map((check) => {
                const style = getVerdictStyle(check.verdict);
                const isPlaying = playingId === check._id;
                const isExpanded = expandedId === check._id;
                const date = new Date(check.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                
                return (
                  <div key={check._id} className="bg-surface-panel rounded-lg shadow-sm border border-surface-border overflow-hidden transition-all duration-200">
                    
                    {/* COLLAPSED HEADER */}
                    <div 
                      onClick={() => toggleExpand(check._id)}
                      className={`px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-surface-header transition-colors ${isExpanded ? style.bg : ''}`}
                    >
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className={style.text}>{style.icon}</div>
                        <div className="overflow-hidden">
                          <h3 className={`font-bold text-base-accessible truncate ${style.text}`}>{style.label}</h3>
                          <p className="text-sm text-text-muted truncate">"{check.rawText}"</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 pl-2">
                        <span className="text-xs font-bold text-text-muted whitespace-nowrap">{date}</span>
                        <ChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>

                    {/* EXPANDED DETAILS */}
                    {isExpanded && (
                      <div className="border-t border-surface-border bg-surface-panel">
                        <div className="p-4 space-y-4">
                          <p className="text-lg-accessible font-medium text-text-primary leading-snug">
                            {check.explanation}
                          </p>

                          {/* Family Status Block (Only shows if they already asked) */}
                          {check.familyRequest && (
                            <div className="bg-surface-ground border border-surface-border rounded-lg p-4">
                              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center space-x-2">
                                <Users className="w-4 h-4 text-brand-primary" /> <span>Family Review</span>
                              </h3>
                              
                              {check.familyRequest.responses.length === 0 ? (
                                <p className="text-sm font-bold text-text-muted flex items-center space-x-2">
                                  <Clock className="w-4 h-4" /> <span>Waiting for family to reply...</span>
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {check.familyRequest.responses.map((resp, idx) => (
                                    <div key={idx} className="flex items-center space-x-2 bg-surface-panel p-2 rounded border border-surface-border shadow-sm">
                                      <UserCircle className="w-5 h-5 text-brand-primary" />
                                      <span className="font-bold text-text-primary">{resp.guardianId.name}:</span>
                                      <span className={`font-bold uppercase text-sm ${resp.reaction === 'safe' ? 'text-verdict-safe' : resp.reaction === 'scam' ? 'text-verdict-scam' : 'text-verdict-suspicious'}`}>
                                        {resp.reaction}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* ACTION BUTTONS (Stacked for wide, easy tapping) */}
                        <div className="bg-surface-header px-4 py-4 border-t border-surface-border flex flex-col gap-3">
                          
                          <button 
                            onClick={(e) => handlePlayAudio(e, check)}
                            className={`w-full py-3 rounded-lg font-bold text-lg-accessible flex justify-center items-center space-x-2 transition-all shadow-sm border ${
                              isPlaying ? 'bg-brand-primary border-brand-primary text-text-inverse scale-[0.98]' : 'bg-surface-panel border-surface-border text-text-primary hover:bg-surface-ground'
                            }`}
                          >
                            {isPlaying ? <Square className="w-5 h-5 fill-current" /> : <Volume2 className="w-5 h-5" />}
                            <span>{isPlaying ? 'Stop Audio' : 'Listen to AI'}</span>
                          </button>

                          {/* SMART CONTEXT: Ask Family Block */}
                          {check.verdict !== 'scam' && (
                            <div className="pt-2 flex flex-col space-y-2">
                              {/* Contextual Messaging */}
                              {!check.familyRequest && check.verdict === 'suspicious' && (
                                <p className="text-sm font-bold text-verdict-suspicious flex items-center justify-center space-x-1">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span>We highly recommend asking your family.</span>
                                </p>
                              )}
                              {!check.familyRequest && check.verdict === 'safe' && (
                                <p className="text-sm font-bold text-text-muted flex items-center justify-center space-x-1">
                                  <ShieldCheck className="w-4 h-4" />
                                  <span>Still not sure? Double-check with family.</span>
                                </p>
                              )}

                              {/* The Ask Button */}
                              <button 
                                onClick={(e) => handleAskFamily(e, check._id)}
                                disabled={actionLoading === check._id || !!check.familyRequest || guardians.length === 0}
                                className={`w-full py-3 rounded-lg font-bold text-lg-accessible flex justify-center items-center space-x-2 transition-colors shadow-sm border ${
                                  check.familyRequest 
                                    ? 'bg-surface-ground text-text-muted border-surface-border' 
                                    : guardians.length === 0 
                                    ? 'bg-surface-ground text-text-muted border-surface-border opacity-60' 
                                    : 'bg-surface-panel text-brand-primary border-brand-primary hover:bg-brand-subtle'
                                }`}
                              >
                                <Share2 className="w-5 h-5" />
                                <span>
                                  {guardians.length === 0 
                                    ? 'Link a Guardian First' 
                                    : check.familyRequest 
                                    ? 'Family Already Asked' 
                                    : actionLoading === check._id 
                                    ? 'Sending...' 
                                    : 'Ask Family'}
                                </span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-surface-panel p-5 rounded-xl shadow-sm border border-surface-border">
              <h2 className="text-lg-accessible font-bold text-text-primary mb-3">Add Family Guardian</h2>
              <form onSubmit={handleInvite} className="space-y-4">
                {error && <div className="text-verdict-scam text-sm font-bold">{error}</div>}
                {success && <div className="text-verdict-safe text-sm font-bold">{success}</div>}
                <div className="flex border-2 border-surface-border focus-within:border-brand-primary rounded overflow-hidden">
                  <span className="inline-flex items-center px-3 bg-surface-header text-text-primary font-bold border-r border-surface-border">+91</span>
                  <input type="tel" maxLength={10} value={invitePhone} onChange={(e) => setInvitePhone(e.target.value)} placeholder="Guardian's Number" className="w-full px-3 py-2 text-base-accessible outline-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-brand-primary hover:bg-brand-dark text-text-inverse py-3 font-bold rounded flex justify-center items-center space-x-2 disabled:opacity-50 cursor-pointer">
                  <UserPlus className="w-5 h-5" />
                  <span>Send Invite</span>
                </button>
              </form>
            </div>
            <div>
              <h3 className="font-bold text-text-muted mb-3 uppercase tracking-wider text-sm px-1">My Guardians</h3>
              {guardians.length === 0 ? (
                <p className="text-center text-text-muted py-4 bg-surface-panel rounded border border-surface-border">No guardians linked yet.</p>
              ) : (
                <div className="space-y-3">
                  {guardians.map((link) => (
                    <div key={link._id} className="bg-surface-panel p-4 rounded-xl shadow-sm border border-surface-border flex justify-between items-center">
                      <div>
                        <p className="font-bold text-text-primary text-lg-accessible">{link.guardianUser?.name}</p>
                        <p className="text-text-muted text-sm font-mono mt-1">+{link.guardianUser?.phone}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {link.status === 'pending' ? (
                          <span className="flex items-center space-x-1 text-verdict-suspicious bg-verdict-suspiciousBg px-2 py-1 rounded text-xs font-bold"><Clock className="w-4 h-4" /><span>Pending</span></span>
                        ) : (
                          <span className="flex items-center space-x-1 text-verdict-safe bg-verdict-safeBg px-2 py-1 rounded text-xs font-bold"><CheckCircle2 className="w-4 h-4" /><span>Active</span></span>
                        )}
                        <button onClick={() => handleRemoveLink(link._id)} className="text-text-muted hover:text-verdict-scam p-2 transition-colors cursor-pointer" title="Remove Guardian"><Trash2 className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}