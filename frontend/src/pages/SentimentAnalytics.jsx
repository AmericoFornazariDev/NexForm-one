import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import SentimentChart from "../components/SentimentChart.jsx";
import TrendChart from "../components/TrendChart.jsx";
import { analyzeFormSentiment, getSentimentTrend } from "../services/api.js";

const EMPTY_DISTRIBUTION = [
  { label: "Positivo", value: 0 },
  { label: "Neutro", value: 0 },
  { label: "Negativo", value: 0 },
];

const sumTotals = (trend) => {
  const totals = { positive: 0, neutral: 0, negative: 0 };

  for (const entry of trend ?? []) {
    totals.positive += Number(entry?.positive ?? entry?.positivo ?? 0) || 0;
    totals.neutral += Number(entry?.neutral ?? entry?.neutro ?? 0) || 0;
    totals.negative += Number(entry?.negative ?? entry?.negativo ?? 0) || 0;
  }

  return totals;
};

export default function SentimentAnalytics() {
  const { formId } = useParams();
  const [trend, setTrend] = useState([]);
  const [distribution, setDistribution] = useState(EMPTY_DISTRIBUTION);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const hasTrendData = useMemo(() => {
    return trend.some((entry) => {
      const positive = Number(entry?.positive ?? 0) || 0;
      const neutral = Number(entry?.neutral ?? 0) || 0;
      const negative = Number(entry?.negative ?? 0) || 0;
      return positive + neutral + negative > 0;
    });
  }, [trend]);

  useEffect(() => {
    const fetchTrend = async () => {
      if (!formId) {
        setTrend([]);
        setDistribution(EMPTY_DISTRIBUTION);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getSentimentTrend(formId);
        const payload = response?.data ?? {};

        const trendData = Array.isArray(payload?.trend)
          ? payload.trend
          : Array.isArray(payload)
          ? payload
          : [];

        const totals = payload?.totals ?? sumTotals(trendData);

        setTrend(trendData);
        setDistribution([
          { label: "Positivo", value: Number(totals?.positive ?? 0) || 0 },
          { label: "Neutro", value: Number(totals?.neutral ?? 0) || 0 },
          { label: "Negativo", value: Number(totals?.negative ?? 0) || 0 },
        ]);
      } catch (err) {
        console.error("Erro ao carregar tendência de sentimento", err);
        setError("Não foi possível carregar os dados de sentimento deste formulário.");
        setTrend([]);
        setDistribution(EMPTY_DISTRIBUTION);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrend();
  }, [formId]);

  const handleRefresh = async () => {
    if (!formId) return;

    setIsRefreshing(true);
    setError(null);
    setStatusMessage(null);

    try {
      const response = await analyzeFormSentiment(formId);
      const payload = response?.data ?? {};
      const message =
        typeof payload?.message === "string" && payload.message.trim()
          ? payload.message.trim()
          : "Sentimentos atualizados com sucesso!";
      setStatusMessage(message);
      const refreshed = await getSentimentTrend(formId);
      const refreshedData = refreshed?.data ?? {};
      const trendData = Array.isArray(refreshedData?.trend)
        ? refreshedData.trend
        : Array.isArray(refreshedData)
        ? refreshedData
        : [];
      const totals = refreshedData?.totals ?? sumTotals(trendData);
      setTrend(trendData);
      setDistribution([
        { label: "Positivo", value: Number(totals?.positive ?? 0) || 0 },
        { label: "Neutro", value: Number(totals?.neutral ?? 0) || 0 },
        { label: "Negativo", value: Number(totals?.negative ?? 0) || 0 },
      ]);
    } catch (err) {
      console.error("Erro ao atualizar sentimentos", err);
      setError("Não foi possível atualizar os sentimentos com a IA neste momento.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-nexform-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Sentimentos" />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Sentimento das Respostas</h1>
              <p className="text-sm text-slate-500">
                Acompanhe a perceção do público e atualize as análises com IA quando necessário.
              </p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing || !formId}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden="true">🔄</span>
              {isRefreshing ? "Analisando..." : "Atualizar Sentimentos (IA)"}
            </button>
          </div>

          {statusMessage && (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/80 px-5 py-3 text-sm text-emerald-700 shadow-sm">
              {statusMessage}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-3xl bg-white p-8 text-center text-slate-500 shadow-lg shadow-violet-100">
              Carregando dados de sentimento...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SentimentChart data={distribution} />
              <TrendChart data={trend} />
            </div>
          )}

          {!isLoading && !hasTrendData && (
            <div className="rounded-3xl bg-white p-6 text-center text-slate-500 shadow-lg shadow-violet-100">
              Nenhum sentimento foi registado ainda para este formulário.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
