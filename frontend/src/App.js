import React, { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLoader from './components/common/Feedback/AppLoader';
import Home from './pages/Home';
import RegisterForm from './components/auth/RegiterForm';
import LoginForm from './components/auth/LoginForm';

function App() {
  const [showHome, setShowHome] = useState(false);

  const handleLoaderComplete = () => {
    setShowHome(true);
  };

  return (
    <BrowserRouter>
      {showHome ? (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <AppLoader onComplete={handleLoaderComplete} />
      )}
    </BrowserRouter>
  );
}

export default App;