import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import NPSChart from "../components/NPSChart";
import InsightBox from "../components/InsightBox";
import {
  getReportOverview,
  generateReportInsights,
} from "../services/api";

const EMPTY_TOTALS = {
  responses: "-",
  last7d: "-",
  last30d: "-",
};

export default function Reports() {
  const { formId } = useParams();
  const [stats, setStats] = useState(null);
  const [npsData, setNpsData] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    if (!formId) {
      setIsLoading(false);
      setStats({ totals: EMPTY_TOTALS, nps: {}, recent: {} });
      return;
    }

    let isMounted = true;

    const fetchOverview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getReportOverview(formId);
        if (!isMounted) return;

        const data = response?.data ?? {};

        const totals = {
          responses: data?.totals?.responses ?? data?.responses ?? 0,
          last7d:
            data?.totals?.last7d ?? data?.recent?.last7d ?? data?.responses_last7d ?? 0,
          last30d:
            data?.totals?.last30d ??
            data?.recent?.last30d ??
            data?.responses_last30d ??
            0,
        };

        const rawNps = data?.nps ?? {};
        const promoters =
          rawNps?.promoters ?? rawNps?.promoters_count ?? rawNps?.promotersCount ?? 0;
        const neutrals =
          rawNps?.neutrals ?? rawNps?.passives ?? rawNps?.neutral ?? 0;
        const detractors =
          rawNps?.detractors ?? rawNps?.detractors_count ?? rawNps?.detractorsCount ?? 0;

        setStats({ totals, nps: rawNps, recent: data?.recent ?? {} });
        setNpsData([
          { label: "Promotores", value: Number(promoters) || 0 },
          { label: "Neutros", value: Number(neutrals) || 0 },
          { label: "Detratores", value: Number(detractors) || 0 },
        ]);
      } catch (err) {
        if (!isMounted) return;
        console.error("Erro ao carregar overview do relatório", err);
        setError("Não foi possível carregar o relatório deste formulário.");
        setStats({ totals: EMPTY_TOTALS, nps: {}, recent: {} });
        setNpsData([
          { label: "Promotores", value: 0 },
          { label: "Neutros", value: 0 },
          { label: "Detratores", value: 0 },
        ]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const totals = stats?.totals ?? EMPTY_TOTALS;
  const hasNpsData = useMemo(
    () => npsData.some((item) => Number(item.value) > 0),
    [npsData]
  );

  const generateInsights = async () => {
    if (!formId) return;

    setIsGeneratingInsights(true);
    setError(null);

    try {
      const response = await generateReportInsights(formId);
      setInsights(response?.data ?? null);
    } catch (err) {
      console.error("Erro ao gerar insights de IA", err);
      setError("Não foi possível gerar os insights de IA neste momento.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow">
              A carregar relatório...
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <StatCard title="Total de Respostas" value={totals.responses} />
                <StatCard title="Últimos 7 dias" value={totals.last7d} />
                <StatCard title="Últimos 30 dias" value={totals.last30d} />
              </div>

              {hasNpsData ? (
                <NPSChart data={npsData} />
              ) : (
                <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow">
                  Sem dados suficientes de NPS para apresentar.
                </div>
              )}

              {insights ? (
                <InsightBox insights={insights} />
              ) : (
                <button
                  type="button"
                  onClick={generateInsights}
                  disabled={isGeneratingInsights}
                  className="rounded bg-blue-600 px-6 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
                >
                  {isGeneratingInsights ? "Gerando Insights..." : "Gerar Insights IA"}
                </button>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
