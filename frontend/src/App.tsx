import React, { useState, useEffect } from 'react';
import { Login } from './components/Login.jsx';
import { Register } from './components/Register.jsx';
import { TradingJournal } from './components/TradingJournal';
import { User } from './types/Trade';
import { getCurrentUser } from './utils/auth';

type AuthView = 'login' | 'register';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-200 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return <TradingJournal user={currentUser} onLogout={handleLogout} />;
  }

  if (authView === 'login') {
    return (
      <Login 
        onLogin={handleLogin} 
        onSwitchToRegister={() => setAuthView('register')} 
      />
    );
  }

  return (
    <Register 
      onSwitchToLogin={() => setAuthView('login')} 
    />
  );
}

export default App;