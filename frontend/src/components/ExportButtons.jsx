export default function ExportButtons({ onPdf, onCsv }) {
  return (
    <div className="flex space-x-2">
      <button
        type="button"
        onClick={onPdf}
        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
      >
        📄 PDF
      </button>
      <button
        type="button"
        onClick={onCsv}
        className="bg-slate-600 hover:bg-slate-700 text-white px-3 py-1 rounded transition"
      >
        📊 CSV
      </button>
    </div>
  );
}
