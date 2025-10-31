const FormCard = ({ title, description, responses }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
        {responses} respostas
      </span>
    </div>
    <div className="mt-4 flex gap-2 text-sm">
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-700">
        Ver respostas
      </button>
      <button className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 transition hover:bg-slate-100">
        Partilhar QR
      </button>
    </div>
  </div>
);

export default FormCard;
