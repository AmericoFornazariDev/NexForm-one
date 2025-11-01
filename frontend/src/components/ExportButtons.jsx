import { FileDown, Sheet } from "lucide-react";

export default function ExportButtons({ onPdf, onCsv }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={onPdf}
        className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300"
      >
        <FileDown className="h-4 w-4" />
        Exportar PDF
      </button>
      <button
        type="button"
        onClick={onCsv}
        className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
      >
        <Sheet className="h-4 w-4" />
        Exportar CSV
      </button>
    </div>
  );
}
