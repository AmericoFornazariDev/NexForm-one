import axios from "axios";
import { useEffect, useState } from "react";

export default function Forms() {
  const [forms, setForms] = useState([]);
  const [newForm, setNewForm] = useState({
    title: "",
    description: "",
    ai_mode: "llama"
  });
  const [loading, setLoading] = useState(false);

  async function loadForms() {
    try {
      const res = await axios.get("http://localhost:5000/api/forms", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setForms(res.data);
    } catch (err) {
      console.error("Erro ao carregar formulários:", err);
    }
  }

  useEffect(() => {
    loadForms();
  }, []);

  async function handleCreateForm() {
    if (!newForm.title.trim()) return alert("O título é obrigatório");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/forms", newForm, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setForms([...forms, res.data]);
      setNewForm({ title: "", description: "", ai_mode: "llama" });
    } catch (err) {
      console.error("Erro ao criar formulário:", err);
      alert("Erro ao criar formulário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4 text-slate-700">Meus Formulários</h1>

      <div className="bg-white p-4 rounded-xl shadow mb-6 space-y-3">
        <input
          type="text"
          placeholder="Título do formulário"
          value={newForm.title}
          onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
          className="border rounded p-2 w-full"
        />
        <textarea
          placeholder="Descrição (opcional)"
          value={newForm.description}
          onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
          className="border rounded p-2 w-full"
        ></textarea>
        <select
          value={newForm.ai_mode}
          onChange={(e) => setNewForm({ ...newForm, ai_mode: e.target.value })}
          className="border rounded p-2 w-full"
        >
          <option value="llama">LLaMA</option>
          <option value="gpt">GPT</option>
        </select>

        <button
          onClick={handleCreateForm}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          {loading ? "A criar..." : "Salvar novo formulário"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {forms.map((form) => (
          <div key={form.id} className="bg-white p-4 rounded-xl shadow text-center">
            <h2 className="font-semibold text-slate-700">{form.title}</h2>
            <p className="text-slate-500 mb-2">{form.description}</p>
            {form.qr_code && (
              <img
                src={form.qr_code}
                alt="QR Code"
                className="w-32 h-32 mx-auto mb-2 rounded shadow"
              />
            )}
            <p className="text-xs text-slate-400 break-all">{`/forms/${form.id}`}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
