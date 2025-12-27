import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { TradingJournal } from './components/TradingJournal';
import { LandingPage } from './components/LandingPage';
import { User } from './types/Trade';
import { checkAuthStatus, logoutUser } from './utils/auth';

type AuthView = 'landing' | 'login' | 'register';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<AuthView>('landing');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const result = await checkAuthStatus();
      if (result.success && result.user) {
        setCurrentUser(result.user);
        setAuthView('landing'); // Stay on landing if user is authenticated
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setAuthView('landing');
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setAuthView('landing');
  };

  const handleGetStarted = () => {
    setAuthView('register');
  };

  const handleGoToLogin = () => {
    setAuthView('login');
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

  // If user is authenticated, show the trading journal
  if (currentUser) {
    return <TradingJournal currentUser={currentUser} onLogout={handleLogout} />;
  }

  // Show different views based on authView state
  if (authView === 'landing') {
    return (
      <LandingPage
        onGetStarted={handleGetStarted}
        onLogin={handleGoToLogin}
      />
    );
  }

  if (authView === 'login') {
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthView('register')}
        onBack={() => setAuthView('landing')}
      />
    );
  }

  return (
    <Register
      onSwitchToLogin={() => setAuthView('login')}
      onBack={() => setAuthView('landing')}
    />
  );
}

export default App;