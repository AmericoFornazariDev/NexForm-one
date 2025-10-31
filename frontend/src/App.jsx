import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Forms from './pages/Forms.jsx';
import Plans from './pages/Plans.jsx';
import PublicForm from './pages/PublicForm.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-100">
    <Navbar />
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);

const App = () => (
  <Routes>
    <Route
      path="/"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route
      path="/forms"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Forms />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/plans"
      element={
        <ProtectedRoute>
          <AppLayout>
            <Plans />
          </AppLayout>
        </ProtectedRoute>
      }
    />
    <Route path="/public/forms/:id" element={<PublicForm />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
