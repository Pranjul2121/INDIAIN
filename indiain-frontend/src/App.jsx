import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./pages/ProtectedRoute";
import JobDetail from "./pages/JobDetail";
import MarketTrends from "./pages/MarketTrends";
import ResumeBuilder from "./pages/ResumeBuilder";
import CoverLetterGenerator from "./pages/CoverLetterGenerator";
import CareerRoadmap from "./pages/CareerRoadmap";
import ReadinessDashboard from "./pages/ReadinessDashboard";
import ProfileEngine from "./pages/ProfileEngine";
import RoleAnalysis from "./pages/RoleAnalysis";
import AppLayout from "./components/AppLayout";
import { ThemeProvider } from "./context/ThemeContext";
import { ResumeProvider } from "./context/ResumeContext";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ResumeProvider>
          <AppLayout>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/job/:id"
                element={
                  <ProtectedRoute>
                    <JobDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/market-trends"
                element={
                  <ProtectedRoute>
                    <MarketTrends />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/resume-builder"
                element={
                  <ProtectedRoute>
                    <ResumeBuilder />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cover-letter"
                element={
                  <ProtectedRoute>
                    <CoverLetterGenerator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/career-roadmap"
                element={
                  <ProtectedRoute>
                    <CareerRoadmap />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/readiness-dashboard"
                element={
                  <ProtectedRoute>
                    <ReadinessDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfileEngine />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/role-analysis"
                element={
                  <ProtectedRoute>
                    <RoleAnalysis />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AppLayout>
        </ResumeProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;