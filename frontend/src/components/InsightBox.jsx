export default function InsightBox({ insights }) {
  if (!insights) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow space-y-4">
      <h2 className="text-lg font-semibold text-slate-700">Insights da IA</h2>
      {insights.summary && <p className="text-slate-700">{insights.summary}</p>}
      <div>
        <h3 className="font-semibold text-slate-600">Pontos Positivos</h3>
        <ul className="list-disc ml-5 text-slate-700">
          {(insights.top_positives ?? []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-slate-600">Pontos Negativos</h3>
        <ul className="list-disc ml-5 text-slate-700">
          {(insights.top_negatives ?? []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold text-slate-600">Ações Sugeridas</h3>
        <ul className="list-disc ml-5 text-slate-700">
          {(insights.suggested_actions ?? []).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
