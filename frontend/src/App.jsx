import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Forms from "./pages/Forms.jsx";
import Plans from "./pages/Plans.jsx";
import PublicForm from "./pages/PublicForm.jsx";
import AISettings from "./pages/AISettings.jsx";
import FormQuestions from "./pages/FormQuestions.jsx";
import Reports from "./pages/Reports.jsx";

function PrivateRoute() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function PublicRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/forms" element={<Forms />} />
            <Route path="/forms/:id/questions" element={<FormQuestions />} />
            <Route path="/ai-settings" element={<AISettings />} />
            <Route path="/plans" element={<Plans />} />
            <Route path="/reports/:formId" element={<Reports />} />
          </Route>

          <Route path="/form/:id" element={<PublicForm />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
