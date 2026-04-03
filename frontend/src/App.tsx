import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RetreatsPage from './pages/RetreatsPage/RetreatsPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RetreatsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
