import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppLoader from './components/common/Feedback/AppLoader';
import Home from './pages/Home';

function App() {
  const [showHome, setShowHome] = useState(false);

  const handleLoaderComplete = () => {
    setShowHome(true);
  };

  return (
    <BrowserRouter>
      {showHome ? <Home /> : <AppLoader onComplete={handleLoaderComplete} />}
    </BrowserRouter>
  );
}

export default App;