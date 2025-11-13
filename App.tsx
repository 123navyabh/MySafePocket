import React from 'react';
import { IdentityProvider, useIdentity } from './hooks/useIdentity';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import { LogoIcon } from './components/icons';

const App: React.FC = () => {
  return (
    <IdentityProvider>
      <div className="min-h-screen bg-brand-primary text-brand-light font-sans">
        <header className="py-4 px-6 border-b border-brand-dark/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-brand-secondary" />
            <h1 className="text-2xl font-bold tracking-wider text-white">MySafePocket</h1>
          </div>
        </header>
        <main className="p-4 sm:p-6 md:p-8">
          <AppContent />
        </main>
      </div>
    </IdentityProvider>
  );
};

const AppContent: React.FC = () => {
  const { identity } = useIdentity();

  return identity ? <Dashboard /> : <LoginScreen />;
};

export default App;