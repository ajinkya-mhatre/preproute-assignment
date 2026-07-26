import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateEditTestPage from './pages/CreateEditTestPage';
import AddQuestionsPage from './pages/AddQuestionsPage';
import PreviewPublishPage from './pages/PreviewPublishPage';
import ProtectedRoute from "./components/common/ProtectedRoute.tsx";
import Layout from "./components/common/Layout.tsx";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-test"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateEditTestPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-test/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CreateEditTestPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:id/questions"
            element={
              <ProtectedRoute>
                <Layout>
                  <AddQuestionsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/test/:id/preview"
            element={
              <ProtectedRoute>
                <Layout>
                  <PreviewPublishPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
