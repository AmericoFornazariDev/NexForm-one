import { useContext, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Layers,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import { api } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const INITIAL_STATS = {
  forms: 0,
  plan: "Free",
  responses: 0,
};

const PIE_COLORS = ["#7C3AED", "#3B82F6", "#6366F1", "#F97316", "#22C55E"];

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setStats(INITIAL_STATS);
      setForms([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [profileResponse, formsResponse] = await Promise.all([
          api.get("/profile", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get("/forms", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!isMounted) {
          return;
        }

        const profileData = profileResponse?.data ?? {};
        const rawForms = formsResponse?.data ?? [];
        const formsList = Array.isArray(rawForms)
          ? rawForms
          : Array.isArray(rawForms?.forms)
          ? rawForms.forms
          : Array.isArray(rawForms?.data)
          ? rawForms.data
          : [];

        const totalResponses = formsList.reduce((accumulator, form) => {
          if (typeof form?.responses === "number") {
            return accumulator + form.responses;
          }

          if (typeof form?.responsesCount === "number") {
            return accumulator + form.responsesCount;
          }

          if (Array.isArray(form?.responses)) {
            return accumulator + form.responses.length;
          }

          return accumulator;
        }, 0);

        const planName = (() => {
          if (!profileData?.plan) {
            return "Free";
          }

          if (typeof profileData.plan === "string") {
            return profileData.plan;
          }

          return (
            profileData.plan?.name ||
            profileData.plan?.title ||
            profileData.plan?.label ||
            "Free"
          );
        })();

        const responsesFromProfile =
          typeof profileData?.responses === "number"
            ? profileData.responses
            : typeof profileData?.responsesCount === "number"
            ? profileData.responsesCount
            : null;

        setForms(formsList);
        setStats({
          forms: formsList.length,
          plan: planName,
          responses: responsesFromProfile ?? totalResponses ?? 0,
        });
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Erro ao carregar dados do dashboard", err);
        setError("Não foi possível carregar os dados do dashboard.");
        setStats((previous) => ({ ...previous, responses: 0 }));
        setForms([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const cards = useMemo(
    () => [
      {
        title: "Total de Formulários",
        value: stats.forms,
        icon: FileText,
        accent: "bg-violet-100 text-violet-600",
        description: "Projetos ativos na plataforma",
      },
      {
        title: "Respostas Recebidas",
        value: stats.responses,
        icon: MessageCircle,
        accent: "bg-indigo-100 text-indigo-600",
        description: "Total consolidado de feedbacks",
      },
      {
        title: "Plano Ativo",
        value: stats.plan,
        icon: Sparkles,
        accent: "bg-slate-100 text-slate-600",
        description: "Funcionalidades disponíveis",
      },
    ],
    [stats]
  );

  const responsesTrend = useMemo(() => {
    if (!forms.length) {
      return [];
    }

    return forms.map((form, index) => {
      const rawValue =
        typeof form?.responses === "number"
          ? form.responses
          : typeof form?.responsesCount === "number"
          ? form.responsesCount
          : Array.isArray(form?.responses)
          ? form.responses.length
          : 0;

      return {
        name: form?.title?.length ? form.title : `Formulário ${index + 1}`,
        responses: Number(rawValue) || 0,
      };
    });
  }, [forms]);

  const hasTrendData = responsesTrend.some((item) => Number(item.responses) > 0);

  const aiDistribution = useMemo(() => {
    if (!forms.length) {
      return [];
    }

    const groups = forms.reduce((accumulator, form) => {
      const mode = (form?.ai_mode || "Personalizado").toString().toLowerCase();
      const key = mode === "gpt" ? "GPT" : mode === "llama" ? "LLaMA" : "Outros";
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {});

    return Object.entries(groups).map(([label, value]) => ({
      label,
      value,
    }));
  }, [forms]);

  const hasDistribution = aiDistribution.some((item) => Number(item.value) > 0);

  const highlightedForms = useMemo(
    () =>
      forms
        .slice()
        .sort((a, b) => {
          const responsesA = Array.isArray(a?.responses)
            ? a.responses.length
            : Number(a?.responses ?? a?.responsesCount ?? 0);
          const responsesB = Array.isArray(b?.responses)
            ? b.responses.length
            : Number(b?.responses ?? b?.responsesCount ?? 0);
          return responsesB - responsesA;
        })
        .slice(0, 4),
    [forms]
  );

  return (
    <div className="flex min-h-screen bg-nexform-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Dashboard" />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-4 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[0, 1, 2].map((key) => (
                <div
                  key={key}
                  className="h-40 animate-pulse rounded-2xl bg-white/70 shadow-lg shadow-violet-100"
                />
              ))}
            </div>
          ) : (
            <>
              <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {cards.map((card) => (
                  <DashboardCard
                    key={card.title}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    accent={card.accent}
                    description={card.description}
                  />
                ))}
              </section>

              <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <div className="group rounded-2xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                    <header className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Atividade dos Formulários</h2>
                        <p className="text-sm text-slate-500">Respostas registadas por formulário</p>
                      </div>
                      <Zap className="h-6 w-6 text-violet-500" />
                    </header>
                    <div className="mt-6 h-64">
                      {hasTrendData ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={responsesTrend} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="4 8" stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fill: "#64748B" }} tickLine={false} axisLine={false} />
                            <YAxis allowDecimals={false} tick={{ fill: "#64748B" }} tickLine={false} axisLine={false} />
                            <Tooltip cursor={{ strokeDasharray: "4 4" }} contentStyle={{ borderRadius: "1rem", borderColor: "#E5E7EB" }} />
                            <Line type="monotone" dataKey="responses" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#EEF2FF" }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                          Ainda não existem respostas suficientes para gerar o gráfico.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="group h-full rounded-2xl bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
                    <header className="mb-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-800">Distribuição dos Modelos de IA</h2>
                        <p className="text-sm text-slate-500">Modelos preferidos pelos seus formulários</p>
                      </div>
                      <Layers className="h-6 w-6 text-indigo-500" />
                    </header>
                    <div className="h-64">
                      {hasDistribution ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={aiDistribution}
                              dataKey="value"
                              nameKey="label"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={4}
                            >
                              {aiDistribution.map((entry, index) => (
                                <Cell key={entry.label} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: "1rem", borderColor: "#E5E7EB" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex h-full items-center justify-center rounded-2xl bg-slate-50 text-sm text-slate-500">
                          Configure os seus formulários para ver a distribuição dos modelos.
                        </div>
                      )}
                    </div>
                    <div className="mt-6 space-y-2">
                      {aiDistribution.length ? (
                        aiDistribution.map((entry, index) => (
                          <div key={entry.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                              />
                              <span className="text-slate-600">{entry.label}</span>
                            </div>
                            <span className="font-medium text-slate-700">{entry.value}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">Sem dados disponíveis.</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-lg shadow-violet-100">
                  <h2 className="text-lg font-semibold text-slate-800">Formulários em destaque</h2>
                  <p className="text-sm text-slate-500">Os projetos com maior interação recente</p>
                  <div className="mt-4 space-y-3">
                    {highlightedForms.length ? (
                      highlightedForms.map((form) => {
                        const totalResponses = Array.isArray(form?.responses)
                          ? form.responses.length
                          : Number(form?.responses ?? form?.responsesCount ?? 0) || 0;
                        const modeValue = form?.ai_mode?.toString().toLowerCase();
                        const modeLabel =
                          modeValue === "llama"
                            ? "LLaMA"
                            : modeValue === "gpt"
                            ? "GPT"
                            : modeValue
                            ? modeValue.toUpperCase()
                            : "-";

                        return (
                          <div
                            key={form.id ?? form.title}
                            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-3 text-sm text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50/70"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-700">{form.title ?? "Formulário"}</p>
                                <p className="text-xs text-slate-500">Modo {modeLabel}</p>
                              </div>
                            </div>
                            <span className="font-semibold text-violet-600">{totalResponses} respostas</span>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
                        Crie o seu primeiro formulário para acompanhar o desempenho.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-6 text-white shadow-lg shadow-violet-100">
                  <h2 className="text-lg font-semibold">Sugestões da IA NexForm</h2>
                  <p className="mt-1 text-sm text-violet-100">
                    Aproveite os recursos premium para potenciar as suas pesquisas e recolha de dados.
                  </p>
                  <ul className="mt-6 space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <Sparkles className="h-4 w-4" />
                      </span>
                      Automatize seguimentos e receba alertas inteligentes quando chegar novo feedback.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <MessageCircle className="h-4 w-4" />
                      </span>
                      Personalize o tom da IA para refletir a voz da sua marca em cada interação.
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                        <Zap className="h-4 w-4" />
                      </span>
                      Aceda a relatórios avançados com previsões e tendências semanais.
                    </li>
                  </ul>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
