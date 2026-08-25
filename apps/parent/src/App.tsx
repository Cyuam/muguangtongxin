import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ParentLayout from './components/ParentLayout';
import Home from './pages/Home';
import Warnings from './pages/Warnings';
import WarningDetail from './pages/WarningDetail';
import CareAdvices from './pages/CareAdvices';
import Tasks from './pages/Tasks';
import TaskCreate from './pages/TaskCreate';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<Home />} />
          <Route path="warnings" element={<Warnings />} />
          <Route path="warnings/:id" element={<WarningDetail />} />
          <Route path="advices" element={<CareAdvices />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="tasks/create" element={<TaskCreate />} />
          <Route path="profile" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/parent" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
