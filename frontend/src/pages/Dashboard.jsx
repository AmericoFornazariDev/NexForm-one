import { useContext, useEffect, useMemo, useState } from "react";
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

export default function Dashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setStats(INITIAL_STATS);
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
      { title: "Formulários", value: stats.forms, icon: "📝" },
      { title: "Plano Atual", value: stats.plan, icon: "💎" },
      { title: "Respostas", value: stats.responses, icon: "📨" },
    ],
    [stats]
  );

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-md">
              A carregar estatísticas...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {cards.map((card) => (
                <DashboardCard
                  key={card.title}
                  title={card.title}
                  value={card.value}
                  icon={card.icon}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
