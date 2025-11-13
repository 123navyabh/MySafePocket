import React, { useState } from 'react';
import { useIdentity } from '../hooks/useIdentity';
import { ShieldCheckIcon } from './icons';

const LoginScreen: React.FC = () => {
  const [username, setUsername] = useState('');
  const { createIdentity } = useIdentity();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      createIdentity(username.trim());
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-6 bg-brand-dark/30 rounded-2xl shadow-2xl border border-brand-secondary/20">
        <div className="text-center">
          <ShieldCheckIcon className="w-16 h-16 mx-auto text-brand-accent" />
          <h2 className="mt-4 text-3xl font-extrabold text-white">Create Your MySafePocket</h2>
          <p className="mt-2 text-brand-light/70">Your personal, secure pocket for digital credentials.</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-brand-light/80">
              Pocket Name (e.g., your name or alias)
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full px-3 py-2 text-white placeholder-gray-500 bg-brand-primary/50 border border-brand-dark rounded-md shadow-sm focus:outline-none focus:ring-brand-accent focus:border-brand-accent sm:text-sm"
                placeholder="My Personal Pocket"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex justify-center w-full px-4 py-3 text-sm font-medium text-brand-primary bg-brand-accent border border-transparent rounded-md shadow-sm hover:bg-sky-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent focus:ring-offset-brand-primary transition-all duration-300"
            >
              Create & Secure Pocket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;