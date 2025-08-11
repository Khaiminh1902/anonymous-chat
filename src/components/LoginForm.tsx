'use client';

import { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Terminal, User, Lock, UserPlus } from 'lucide-react';

export default function LoginForm() {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codename.trim() || !password.trim()) {
      setError('Codename and password are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = isLogin 
        ? await login(codename, password)
        : await register(codename, password);

      if (!success) {
        setError(isLogin ? 'Invalid credentials' : 'Registration failed');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-green-400 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Terminal className="w-12 h-12 text-green-400" />
          </div>
          <h1 className="text-3xl font-bold mb-2 glitch">
            ANONYMOUS CHAT
          </h1>
          <p className="text-green-600 text-sm">
            [SECURE_TERMINAL_ACCESS_REQUIRED]
          </p>
        </div>

        <div className="terminal-border rounded-lg p-6">
          <div className="mb-4 text-center">
            <div className="inline-flex terminal-border rounded-lg p-1">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`px-4 py-2 rounded text-sm transition-all duration-200 ${
                  isLogin 
                    ? 'terminal-button-primary' 
                    : 'text-green-600 hover:text-green-400'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                LOGIN
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`px-4 py-2 rounded text-sm transition-all duration-200 ${
                  !isLogin 
                    ? 'terminal-button-primary' 
                    : 'text-green-600 hover:text-green-400'
                }`}
              >
                <UserPlus className="w-4 h-4 inline mr-2" />
                REGISTER
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-green-300">
                [CODENAME]
              </label>
              <input
                type="text"
                value={codename}
                onChange={(e) => setCodename(e.target.value)}
                placeholder="Enter your codename..."
                className="w-full p-3 terminal-input rounded-lg"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-green-300">
                [PASSWORD]
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full p-3 terminal-input rounded-lg"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm p-2 border border-red-500/30 bg-red-900/20 rounded">
                [ERROR] {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full terminal-button-primary p-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="typing-indicator mr-2">▓</div>
                  PROCESSING...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Lock className="w-4 h-4 mr-2" />
                  {isLogin ? 'ACCESS TERMINAL' : 'CREATE IDENTITY'}
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-green-600">
            <p>⚠️ SECURITY NOTICE ⚠️</p>
            <p>All communications are encrypted</p>
          </div>
        </div>
      </div>
    </div>
  );
}
