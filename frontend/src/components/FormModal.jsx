import { useState } from "react";

export default function FormModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    ai_mode: "llama",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      await onSave?.(form);
      onClose?.();
      setForm({ title: "", description: "", ai_mode: "llama" });
    } catch (error) {
      console.error("Failed to create form", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Novo Formulário</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Título"
            className="w-full border border-slate-200 p-2 rounded"
            value={form.title}
            onChange={handleChange("title")}
            required
          />
          <textarea
            placeholder="Descrição"
            className="w-full border border-slate-200 p-2 rounded"
            value={form.description}
            onChange={handleChange("description")}
            rows={4}
          />
          <select
            className="w-full border border-slate-200 p-2 rounded"
            value={form.ai_mode}
            onChange={handleChange("ai_mode")}
          >
            <option value="llama">LLaMA (Local)</option>
            <option value="gpt">GPT (Remoto)</option>
          </select>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-300 rounded hover:bg-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
