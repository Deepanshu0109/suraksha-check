import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Core States
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [step, setStep] = useState(1);       // 1: Phone/Details, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpHint, setDevOtpHint] = useState('');

  // Form States
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('primary'); 

  // Step 1: Request OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (mode === 'register' && !name.trim()) {
      setError('Please enter your name to create an account.');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.sendOtp(cleanPhone, mode);
      setPhone(cleanPhone);
      setStep(2);
      if (data.otp) {
        setDevOtpHint(`Dev OTP: ${data.otp}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.trim().length !== 6) {
      setError('Please enter the full 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      // If logging in, we pass undefined for name and role
      const reqName = mode === 'register' ? name : undefined;
      const reqRole = mode === 'register' ? role : undefined;

      const data = await authService.verifyOtp(phone, otp, reqName, reqRole);
      login(data.token, data.user);
      navigate('/'); // The Traffic Cop in Home.jsx will route them properly
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setStep(1);
    setError('');
    setOtp('');
  };

  return (
    <div className="min-h-screen bg-surface-ground flex flex-col">
      <header className="bg-brand-dark px-6 py-5 text-text-inverse flex items-center space-x-3 shadow-md">
        <Shield className="w-8 h-8 text-brand-light" />
        <div>
          <h1 className="text-xl-accessible font-bold tracking-wide">SurakshaCheck</h1>
          <p className="text-xs text-brand-subtle opacity-90">Digital Safety for Families</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center px-4 py-8 max-w-lg w-full mx-auto">
        <div className="bg-surface-panel border border-surface-border p-6 shadow-sm">
          
          {error && (
            <div className="mb-6 p-4 bg-verdict-scamBg border-l-4 border-verdict-scam text-verdict-scam text-base-accessible font-medium">
              {error}
            </div>
          )}

          {devOtpHint && (
            <div className="mb-6 p-3 bg-verdict-safeBg border border-verdict-safe text-verdict-safe text-sm font-mono font-bold text-center">
              {devOtpHint}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <h2 className="text-xl-accessible font-bold text-text-primary mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-base-accessible text-text-muted">
                  {mode === 'login' 
                    ? 'Enter your mobile number to securely log in.' 
                    : 'Set up your profile to stay protected.'}
                </p>
              </div>

              {/* ALWAYS SHOW PHONE NUMBER */}
              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Phone Number
                </label>
                <div className="flex border-2 border-surface-border focus-within:border-brand-primary bg-surface-panel">
                  <span className="inline-flex items-center px-4 bg-surface-header text-text-primary font-bold text-base-accessible border-r border-surface-border">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-4 py-3 text-lg-accessible text-text-primary outline-none"
                    autoFocus
                  />
                </div>
              </div>

              {/* ONLY SHOW NAME AND ROLE IF REGISTERING */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-text-primary mb-2">
                      Your Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-4 py-3 text-base-accessible border-2 border-surface-border focus:border-brand-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-text-primary mb-2">
                      I am using this as:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('primary')}
                        className={`py-3 px-4 text-center font-bold text-base-accessible border-2 transition-colors ${
                          role === 'primary'
                            ? 'border-brand-primary bg-brand-subtle text-brand-dark'
                            : 'border-surface-border bg-surface-panel text-text-muted hover:bg-surface-header'
                        }`}
                      >
                        Main User
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('guardian')}
                        className={`py-3 px-4 text-center font-bold text-base-accessible border-2 transition-colors ${
                          role === 'guardian'
                            ? 'border-brand-primary bg-brand-subtle text-brand-dark'
                            : 'border-surface-border bg-surface-panel text-text-muted hover:bg-surface-header'
                        }`}
                      >
                        Guardian
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-primary hover:bg-brand-dark text-text-inverse py-4 px-6 font-bold text-lg-accessible flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Sending Code...' : 'Get Verification Code'}</span>
                <ArrowRight className="w-6 h-6" />
              </button>

              {/* TOGGLE MODE BUTTON */}
              <div className="pt-4 text-center border-t border-surface-border">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-brand-primary font-bold text-base-accessible hover:underline cursor-pointer"
                >
                  {mode === 'login' 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Log in"}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <h2 className="text-xl-accessible font-bold text-text-primary mb-2">
                  Enter 6-Digit Code
                </h2>
                <p className="text-base-accessible text-text-muted">
                  Code sent to <span className="font-bold text-text-primary">+91 {phone}</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-text-primary mb-2">
                  Verification Code (OTP)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 text-center tracking-widest text-2xl font-mono font-bold border-2 border-surface-border focus:border-brand-primary outline-none"
                  autoFocus
                />
              </div>

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-primary hover:bg-brand-dark text-text-inverse py-4 px-6 font-bold text-lg-accessible flex items-center justify-center space-x-2 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{loading ? 'Verifying...' : 'Verify & Continue'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                  }}
                  className="w-full py-2 text-center text-brand-primary font-bold text-base-accessible hover:underline cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}