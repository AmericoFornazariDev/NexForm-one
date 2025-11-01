export default function InsightBox({ insights }) {
  if (!insights) {
    return null;
  }

  return (
    <section className="rounded-3xl bg-white p-8 shadow-lg shadow-violet-100">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Insights da IA</h2>
          {insights.summary ? (
            <p className="mt-2 max-w-3xl text-sm text-slate-500">{insights.summary}</p>
          ) : null}
        </div>
        <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-medium text-violet-600">
          Atualizado automaticamente
        </span>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <InsightList title="Pontos positivos" items={insights.top_positives} accent="emerald" />
        <InsightList title="Oportunidades" items={insights.top_negatives} accent="rose" />
        <InsightList title="Ações sugeridas" items={insights.suggested_actions} accent="indigo" />
      </div>
    </section>
  );
}

function InsightList({ title, items, accent }) {
  const accentClasses = {
    emerald: {
      text: "text-emerald-600",
      dot: "bg-emerald-500",
    },
    rose: {
      text: "text-rose-600",
      dot: "bg-rose-500",
    },
    indigo: {
      text: "text-indigo-600",
      dot: "bg-indigo-500",
    },
  };

  const palette = accentClasses[accent] ?? accentClasses.indigo;

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-6 text-center text-sm text-slate-500">
        Sem dados ainda.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-sm">
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${palette.text}`}>{title}</h3>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">
        {items.map((item, index) => (
          <li key={`${title}-${index}`} className="flex items-start gap-3">
            <span className={`mt-1 h-2.5 w-2.5 rounded-full ${palette.dot}`}></span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
