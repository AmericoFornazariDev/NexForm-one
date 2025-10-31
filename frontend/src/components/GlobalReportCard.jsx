import { Link } from "react-router-dom";
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
    <div className="bg-white shadow p-4 rounded-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-700">{form.title}</h2>
        <p className="text-sm text-slate-500">
          Respostas: {form.responses ?? 0} · NPS: {form.nps ?? "Sem dados"}
        </p>
        <p className="text-xs text-slate-400 mt-1">Última atualização: {formatDate(form.updated)}</p>
      </div>
      <div className="flex items-center gap-3">
        <ExportButtons
          onPdf={() => onExportPDF(form.id)}
          onCsv={() => onExportCSV(form.id)}
        />
        <Link
          to={`/reports/${form.id}`}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded transition text-sm"
        >
          🔍 Ver Detalhes
        </Link>
      </div>
    </div>
  );
}
