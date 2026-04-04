import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner';

import { ToastProvider } from './components/common/Toast/ToastContext';

const RetreatsPage = lazy(() => import('./pages/RetreatsPage/RetreatsPage'));
const RetreatDetailPage = lazy(() => import('./pages/RetreatDetailPage/RetreatDetailPage'));
const AdminPage = lazy(() => import('./pages/AdminPage/AdminPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<RetreatsPage />} />
            <Route path="/retreats/:id" element={<RetreatDetailPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
