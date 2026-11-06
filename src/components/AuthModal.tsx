import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Zap,
} from 'lucide-react';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'register' | 'forgot' | 'demo';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<AuthMode>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('Admin');
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setMessage({ type: 'error', text: data.message || 'Invalid credentials' });
      }
    } catch {
      // Local fallback
      if (password.length >= 4) {
        onLoginSuccess({
          id: 10,
          name: email.split('@')[0] || 'Store Associate',
          email,
          role: 'Cashier',
        });
        onClose();
      } else {
        setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({ type: 'success', text: 'Registration successful! Signing you in...' });
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 800);
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed' });
      }
    } catch {
      onLoginSuccess({
        id: Math.floor(Math.random() * 1000) + 10,
        name: name || 'Retail Associate',
        email,
        role,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessage({
          type: 'success',
          text: `Reset instructions and verification code [${data.tempPin || '849201'}] dispatched!`,
        });
      } else {
        setMessage({ type: 'error', text: data.message || 'Email not found' });
      }
    } catch {
      setMessage({
        type: 'success',
        text: `Demo recovery link dispatched to ${email}. Temporary PIN: 849201`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoSelect = (demoUser: User) => {
    onLoginSuccess(demoUser);
    onClose();
  };

  const demoAccounts: { title: string; desc: string; user: User; iconBg: string }[] = [
    {
      title: 'Administrator',
      desc: 'Full access to all systems, analytics, and database export',
      user: { id: 1, name: 'Alexander Cross', email: 'admin@retail.com', role: 'Admin' },
      iconBg: 'bg-red-600',
    },
    {
      title: 'Inventory Manager',
      desc: 'Stock control, catalog updates, reordering & supplier management',
      user: { id: 2, name: 'Elena Vance', email: 'manager@retail.com', role: 'Inventory Manager' },
      iconBg: 'bg-gray-900',
    },
    {
      title: 'Sales Cashier',
      desc: 'POS terminal, checkout processing, receipts & order management',
      user: { id: 3, name: 'Carlos Ramos', email: 'cashier@retail.com', role: 'Cashier' },
      iconBg: 'bg-red-700',
    },
    {
      title: 'Business Analyst',
      desc: 'Descriptive, predictive & prescriptive reporting & marketing',
      user: { id: 4, name: 'Nadia Thorne', email: 'analyst@retail.com', role: 'Business Analyst' },
      iconBg: 'bg-gray-800',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white font-black text-sm">
              R
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Retail System Authentication</h2>
              <p className="text-xs text-gray-500">Sign in, register, or choose a 1-click test role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 border-b border-gray-200 text-xs font-semibold bg-gray-50">
          <button
            onClick={() => {
              setMode('demo');
              setMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'demo'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Quick Demo
          </button>
          <button
            onClick={() => {
              setMode('login');
              setMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'login'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setMode('register');
              setMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'register'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => {
              setMode('forgot');
              setMessage(null);
            }}
            className={`py-3 text-center border-b-2 transition-colors cursor-pointer ${
              mode === 'forgot'
                ? 'border-red-600 text-red-600 bg-white'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Forgot PW
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 text-xs font-medium ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Body content based on mode */}
        <div className="p-6">
          {mode === 'demo' && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl mb-4 flex items-start gap-2.5">
                <Zap className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700">
                  <p className="font-bold text-red-900">Instant Evaluation Mode</p>
                  <p className="mt-0.5">
                    Click any pre-configured college project persona below to authenticate instantly with appropriate permissions.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.title}
                    onClick={() => handleQuickDemoSelect(demo.user)}
                    className="p-3 text-left border border-gray-200 hover:border-red-500 rounded-xl hover:shadow-md transition-all group bg-white cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-md ${demo.iconBg} text-white flex items-center justify-center font-bold text-xs`}>
                        {demo.title.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 group-hover:text-red-600">
                          {demo.title}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">{demo.user.email}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                      {demo.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@retail.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-red-600 hover:underline"
                >
                  Register here
                </button>
              </p>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jordan Smith"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jordan.smith@retail.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  System Role
                </label>
                <div className="relative">
                  <Shield className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as User['role'])}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  >
                    <option value="Admin">Administrator (Full Access)</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Cashier">Sales Cashier</option>
                    <option value="Business Analyst">Business Analyst</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isLoading ? 'Creating Account...' : 'Register User'}
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form onSubmit={handleForgot} className="space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                Enter your registered corporate email to receive a password reset link and 6-digit verification code.
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Your Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@retail.com"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isLoading ? 'Sending Reset...' : 'Send Recovery Instructions'}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Remember your password?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-bold text-red-600 hover:underline"
                >
                  Return to sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
