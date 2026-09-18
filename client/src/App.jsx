import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LearnerProvider, useLearner } from './LearnerContext.jsx';
import Intake from './pages/Intake.jsx';
import Welcome from './pages/Welcome.jsx';
import Objectives from './pages/Objectives.jsx';
import { M1S1, M1S2, M1S3, M1S4, M1Practice } from './pages/Module1.jsx';
import { M2S1, M2S2, M2S3, M2S4, M2S5, M2S6, M2S7, M2Practice } from './pages/Module2.jsx';
import Assessment from './pages/Assessment.jsx';
import Completion from './pages/Completion.jsx';
import AdminApp from './admin/AdminApp.jsx';

function RequireLearner({ children }) {
  const { learner } = useLearner();
  if (!learner) return <Navigate to="/" replace />;
  return children;
}

function LearnerRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Intake />} />
      <Route path="/welcome" element={<RequireLearner><Welcome /></RequireLearner>} />
      <Route path="/objectives" element={<RequireLearner><Objectives /></RequireLearner>} />
      <Route path="/module1/1" element={<RequireLearner><M1S1 /></RequireLearner>} />
      <Route path="/module1/2" element={<RequireLearner><M1S2 /></RequireLearner>} />
      <Route path="/module1/3" element={<RequireLearner><M1S3 /></RequireLearner>} />
      <Route path="/module1/4" element={<RequireLearner><M1S4 /></RequireLearner>} />
      <Route path="/module1/practice" element={<RequireLearner><M1Practice /></RequireLearner>} />
      <Route path="/module2/1" element={<RequireLearner><M2S1 /></RequireLearner>} />
      <Route path="/module2/2" element={<RequireLearner><M2S2 /></RequireLearner>} />
      <Route path="/module2/3" element={<RequireLearner><M2S3 /></RequireLearner>} />
      <Route path="/module2/4" element={<RequireLearner><M2S4 /></RequireLearner>} />
      <Route path="/module2/5" element={<RequireLearner><M2S5 /></RequireLearner>} />
      <Route path="/module2/6" element={<RequireLearner><M2S6 /></RequireLearner>} />
      <Route path="/module2/7" element={<RequireLearner><M2S7 /></RequireLearner>} />
      <Route path="/module2/practice" element={<RequireLearner><M2Practice /></RequireLearner>} />
      <Route path="/assessment" element={<RequireLearner><Assessment /></RequireLearner>} />
      <Route path="/complete" element={<RequireLearner><Completion /></RequireLearner>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route
          path="/*"
          element={
            <LearnerProvider>
              <LearnerRoutes />
            </LearnerProvider>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
