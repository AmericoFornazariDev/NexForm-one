import { useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl shadow-violet-100">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Criar novo formulário</h2>
            <p className="mt-1 text-sm text-slate-500">
              Defina título, descrição e o modelo de IA que irá acompanhar os seus utilizadores.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-transparent p-2 text-slate-400 transition-all duration-300 ease-in-out hover:border-slate-200 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="form-title" className="text-sm font-medium text-slate-600">
              Título
            </label>
            <input
              id="form-title"
              type="text"
              placeholder="Ex.: Inquérito de Satisfação"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              value={form.title}
              onChange={handleChange("title")}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="form-description" className="text-sm font-medium text-slate-600">
              Descrição
            </label>
            <textarea
              id="form-description"
              placeholder="Explique ao participante o objetivo deste formulário"
              className="h-28 w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              value={form.description}
              onChange={handleChange("description")}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="form-mode" className="text-sm font-medium text-slate-600">
              Modelo de IA
            </label>
            <select
              id="form-mode"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              value={form.ai_mode}
              onChange={handleChange("ai_mode")}
            >
              <option value="llama">LLaMA · processamento local</option>
              <option value="gpt">GPT · inteligência ampliada</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl bg-violet-50/70 px-4 py-3 text-sm text-violet-700">
            <div className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4" />
              Dica NexForm
            </div>
            <p>
              Utilize descrições claras e curtas para aumentar a taxa de conclusão dos seus formulários.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-2.5 font-medium text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-2.5 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "A criar..." : "Criar formulário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
