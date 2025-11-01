import { Link } from "react-router-dom";
import { BarChart3, Clock, MoveRight } from "lucide-react";
import ExportButtons from "./ExportButtons";

const formatDate = (value) => {
  if (!value) {
    return "Sem respostas";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
};

export default function GlobalReportCard({ form, onExportPDF, onExportCSV }) {
  return (
    <article className="group flex flex-col gap-6 rounded-2xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <header className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm shadow-violet-100">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{form.title}</h2>
            <p className="text-sm text-slate-500">
              {form.responses ?? 0} respostas · NPS {form.nps ?? "Sem dados"}
            </p>
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5" /> Última atualização: {formatDate(form.updated)}
            </p>
          </div>
        </div>
        <ExportButtons
          onPdf={() => onExportPDF(form.id)}
          onCsv={() => onExportCSV(form.id)}
        />
      </header>

      <footer className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          {form.description || "Resumo disponível com insights automáticos."}
        </span>
        <Link
          to={`/reports/${form.id}`}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 font-medium text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          Ver detalhes
          <MoveRight className="h-4 w-4" />
        </Link>
      </footer>
    </article>
  );
}
