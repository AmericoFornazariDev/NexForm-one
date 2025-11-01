import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate("/", { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message ?? "Não foi possível criar a conta.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-100 via-white to-indigo-100 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-2xl shadow-violet-100 backdrop-blur">
        <h1 className="text-center text-3xl font-semibold text-violet-700">Criar conta</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Preencha os campos para começar a usar o NexForm</p>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-600 shadow-sm">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="Nome completo"
              autoComplete="name"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="email@exemplo.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "A criar conta..." : "Criar Conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Já tem conta? {" "}
          <Link to="/login" className="font-medium text-violet-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
