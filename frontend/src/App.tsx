import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { ToastContainer } from './components/Toast';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/proposals" element={<Layout><Proposals /></Layout>} />
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Router>
        <AppContent />
      </Router>
    </ToastProvider>
  );
};

export default App;
