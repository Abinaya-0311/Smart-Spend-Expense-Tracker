import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';
import SignUpPage from './components/SignUpPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';

type View = 'login' | 'signup' | 'dashboard' | 'forgotPassword';

const App: React.FC = () => {
  const [view, setView] = useState<View>('login');

  const handleLogin = () => {
    setView('dashboard');
  };

  const handleSignUp = () => {
    // Automatically log in the user after successful signup
    setView('dashboard');
  };
  
  const handleLogout = () => {
    setView('login');
  };

  const switchToSignUp = () => {
    setView('signup');
  };

  const switchToLogin = () => {
    setView('login');
  };

  const switchToForgotPassword = () => {
    setView('forgotPassword');
  }

  const renderView = () => {
    switch (view) {
      case 'signup':
        return <SignUpPage onSignUp={handleSignUp} onSwitchToLogin={switchToLogin} />;
      case 'dashboard':
        return <Dashboard onLogout={handleLogout} />;
      case 'forgotPassword':
        return <ForgotPasswordPage onSwitchToLogin={switchToLogin} />;
      case 'login':
      default:
        return <LoginPage onLogin={handleLogin} onSwitchToSignUp={switchToSignUp} onSwitchToForgotPassword={switchToForgotPassword} />;
    }
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {renderView()}
    </div>
  );
};

export default App;