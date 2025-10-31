import { useEffect, useState } from "react";
import FormCard from "../components/FormCard.jsx";
import FormModal from "../components/FormModal.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { createForm, deleteForm, getForms } from "../services/api";

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    const fetchForms = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getForms();
        const data = response?.data ?? [];
        const formsData = Array.isArray(data) ? data : data.forms ?? [];
        setForms(formsData);
      } catch (err) {
        console.error("Failed to load forms", err);
        setError("Não foi possível carregar os formulários.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleCreate = async (formData) => {
    const response = await createForm(formData);
    const newForm = response?.data?.form ?? response?.data ?? null;

    if (newForm) {
      setForms((prev) => [newForm, ...prev]);
    } else {
      const refreshed = await getForms();
      const data = refreshed?.data ?? [];
      const formsData = Array.isArray(data) ? data : data.forms ?? [];
      setForms(formsData);
    }
  };

  const handleDelete = async (formId) => {
    if (!formId) return;

    try {
      await deleteForm(formId);
      setForms((prev) => prev.filter((form) => form.id !== formId));
    } catch (err) {
      console.error("Failed to delete form", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Meus Formulários</h1>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => setModal(true)}
            >
              Novo Formulário
            </button>
          </div>

          {isLoading && (
            <p className="text-slate-500">Carregando formulários...</p>
          )}

          {error && !isLoading && (
            <p className="text-red-500 mb-4">{error}</p>
          )}

          {!isLoading && !forms.length && !error && (
            <p className="text-slate-500">Nenhum formulário encontrado. Crie o primeiro!</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <FormCard key={form.id} form={form} onDelete={handleDelete} />
            ))}
          </div>

          {modal && (
            <FormModal onClose={() => setModal(false)} onSave={handleCreate} />
          )}
        </main>
      </div>
    </div>
  );
}
