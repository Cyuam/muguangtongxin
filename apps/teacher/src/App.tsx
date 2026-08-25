import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import TeacherLayout from './components/TeacherLayout';
import Home from './pages/Home';
import ClassDiagnosis from './pages/ClassDiagnosis';
import StudentDiagnosis from './pages/StudentDiagnosis';
import Trends from './pages/Trends';
import Advices from './pages/Advices';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Home />} />
          <Route path="diagnosis" element={<ClassDiagnosis />} />
          <Route path="diagnosis/student/:studentId" element={<StudentDiagnosis />} />
          <Route path="trends" element={<Trends />} />
          <Route path="advices" element={<Advices />} />
          <Route path="profile" element={<Home />} />
        </Route>
        <Route path="*" element={<Navigate to="/teacher" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
