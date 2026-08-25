import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ChildLayout from './components/ChildLayout';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import AssessmentTake from './pages/AssessmentTake';
import AssessmentResult from './pages/AssessmentResult';
import Game from './pages/Game';
import GamePlay from './pages/GamePlay';
import Points from './pages/Points';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ChildLayout>
        <Routes>
          <Route path="/child" element={<Home />} />
          <Route path="/child/assessment" element={<Assessment />} />
          <Route path="/child/assessment/take/:scaleId" element={<AssessmentTake />} />
          <Route path="/child/assessment/result/:resultId" element={<AssessmentResult />} />
          <Route path="/child/game" element={<Game />} />
          <Route path="/child/game/play/:scenarioId" element={<GamePlay />} />
          <Route path="/child/points" element={<Points />} />
          <Route path="/child/profile" element={<Points />} />
          <Route path="*" element={<Navigate to="/child" replace />} />
        </Routes>
      </ChildLayout>
    </BrowserRouter>
  );
};

export default App;
