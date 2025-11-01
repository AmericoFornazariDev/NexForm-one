import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import FormCard from "../components/FormCard.jsx";
import FormModal from "../components/FormModal.jsx";

const TOKEN_KEY = "token";

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  const token = useMemo(() => localStorage.getItem(TOKEN_KEY), []);

  const loadForms = async () => {
    if (!token) {
      setForms([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get("http://localhost:5000/api/forms", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response?.data ?? [];
      setForms(Array.isArray(data) ? data : data?.data ?? []);
    } catch (err) {
      console.error("Erro ao carregar formulários:", err);
      setError("Não foi possível carregar os formulários. Tente novamente em instantes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, [token]);

  const handleSaveForm = async (payload) => {
    if (!token) {
      setError("É necessário iniciar sessão para criar um formulário.");
      setStatus(null);
      return;
    }

    try {
      setStatus("A criar novo formulário...");
      const response = await axios.post("http://localhost:5000/api/forms", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newForm = response?.data;
      setForms((previous) => [...previous, newForm].filter(Boolean));
      setError(null);
      setStatus("Formulário criado com sucesso!");
    } catch (err) {
      console.error("Erro ao criar formulário:", err);
      setError("Não foi possível criar o formulário. Verifique os dados e tente novamente.");
      setStatus(null);
      throw err;
    } finally {
      setTimeout(() => setStatus(null), 3000);
    }
  };

  const handleDeleteForm = async (formId) => {
    if (!token || !formId) {
      return;
    }

    const confirmed = window.confirm("Deseja mesmo eliminar este formulário?");
    if (!confirmed) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/forms/${formId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setForms((previous) => previous.filter((form) => form.id !== formId));
      setError(null);
      setStatus("Formulário removido.");
      setTimeout(() => setStatus(null), 2500);
    } catch (err) {
      console.error("Erro ao eliminar formulário:", err);
      setError("Não foi possível eliminar o formulário neste momento.");
      setStatus(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-nexform-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Formulários" />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <section className="rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 px-6 py-8 text-white shadow-lg shadow-violet-200">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Construa experiências inteligentes</h1>
                <p className="mt-1 max-w-2xl text-sm text-violet-100">
                  Organize os seus formulários, acompanhe respostas em tempo real e ofereça interações assistidas por IA aos seus clientes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-semibold text-violet-600 shadow-md shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl"
              >
                + Criar Formulário
              </button>
            </div>
          </section>

          {status ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3 text-sm text-emerald-700 shadow-sm">
              {status}
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          ) : null}

          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-800">Formulários criados</h2>
              <span className="text-sm font-medium text-slate-500">
                {isLoading ? "A carregar..." : `${forms.length} ${forms.length === 1 ? "formulário" : "formulários"}`}
              </span>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {forms.length === 0 && !isLoading ? (
                <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-slate-500 shadow-inner">
                  Ainda não existem formulários. Clique em "Criar Formulário" para começar.
                </div>
              ) : (
                forms.map((form) => (
                  <FormCard key={form.id ?? form.title} form={form} onDelete={handleDeleteForm} />
                ))
              )}
            </div>
          </section>
        </main>
      </div>

      {isModalOpen ? (
        <FormModal
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveForm}
        />
      ) : null}
    </div>
  );
}
