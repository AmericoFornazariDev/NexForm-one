import { Link } from "react-router-dom";
import { ArrowRight, FileText, MessageCircle, Trash2 } from "lucide-react";

export default function FormCard({ form, onDelete }) {
  if (!form) return null;

  const totalResponses = Array.isArray(form?.responses)
    ? form.responses.length
    : Number(form?.responses ?? form?.responsesCount ?? 0) || 0;

  const modeLabel = (() => {
    const value = form?.ai_mode?.toString().toLowerCase();
    if (!value) return "Personalizado";
    if (value === "llama") return "LLaMA";
    if (value === "gpt") return "GPT";
    return value.toUpperCase();
  })();

  return (
    <article className="group flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <div>
        <header className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{form.title}</h3>
              {form.description ? (
                <p className="mt-1 text-sm text-slate-500">{form.description}</p>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onDelete?.(form.id)}
            disabled={!onDelete}
            className="rounded-full border border-transparent p-2 text-slate-400 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-red-100 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Eliminar formulário"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </header>

        {form.qr_code ? (
          <div className="mt-5 flex justify-center">
            <img
              src={form.qr_code}
              alt="QR Code do Formulário"
              className="h-32 w-32 rounded-xl border border-violet-100 bg-white p-2 shadow-md"
            />
          </div>
        ) : null}
      </div>

      <footer className="mt-6 space-y-4 text-sm">
        <div className="flex flex-wrap items-center gap-3 text-slate-500">
          <span className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-600">
            Modo {modeLabel}
          </span>
          <span className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            <MessageCircle className="h-4 w-4" />
            {totalResponses} respostas
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {form.id ? (
            <Link
              to={`/forms/${form.id}/questions`}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            >
              Gerir Perguntas
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}

          {form.id ? (
            <Link
              to={`/sentiment/${form.id}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 font-medium text-white shadow shadow-violet-200 transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-violet-300"
            >
              Análise de Sentimento
            </Link>
          ) : null}
        </div>
      </footer>
    </article>
  );
}
