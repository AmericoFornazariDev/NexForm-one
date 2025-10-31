import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Forms from "./pages/Forms.jsx";
import Plans from "./pages/Plans.jsx";
import PublicForm from "./pages/PublicForm.jsx";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/form/:id" element={<PublicForm />} />
      </Routes>
    </Router>
  );
}
