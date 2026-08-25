import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import RiskMap from './pages/RiskMap';
import Reports from './pages/Reports';
import ReportGenerate from './pages/ReportGenerate';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="risk-map" element={<RiskMap />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/generate" element={<ReportGenerate />} />
          <Route path="users" element={<Home />} />
          <Route path="settings" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
