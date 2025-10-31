import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DashboardCard from "../components/DashboardCard";
import { useAuth } from "../context/AuthContext";
import { getForms, getProfile } from "../services/api";

export default function Dashboard() {
  const { isAuthenticated, logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formCount, setFormCount] = useState(0);
  const [responsesCount, setResponsesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);

      try {
        const [profileResponse, formsResponse] = await Promise.all([
          getProfile(),
          getForms(),
        ]);

        if (!isMounted) return;

        const profileData = profileResponse?.data ?? profileResponse ?? {};
        const rawForms = formsResponse?.data ?? formsResponse ?? {};

        const formsList = Array.isArray(rawForms)
          ? rawForms
          : Array.isArray(rawForms?.forms)
          ? rawForms.forms
          : Array.isArray(rawForms?.data)
          ? rawForms.data
          : [];

        const totalResponses = formsList.reduce((total, form) => {
          if (typeof form?.totalResponses === "number") {
            return total + form.totalResponses;
          }

          if (typeof form?.responsesCount === "number") {
            return total + form.responsesCount;
          }

          if (Array.isArray(form?.responses)) {
            return total + form.responses.length;
          }

          return total;
        }, 0);

        setProfile(profileData);
        setFormCount(formsList.length);
        setResponsesCount(totalResponses);
      } catch (error) {
        console.error("Failed to load dashboard data", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  const displayName = useMemo(() => {
    const nameFromProfile = profile?.name ?? profile?.fullName;
    const nameFromContext = user?.name ?? user?.fullName;

    return nameFromProfile || nameFromContext || user?.email || "Utilizador";
  }, [profile, user]);

  const planName = useMemo(() => {
    if (!profile) return "—";

    if (typeof profile?.plan === "string") {
      return profile.plan;
    }

    return (
      profile?.plan?.name ||
      profile?.plan?.title ||
      profile?.plan?.label ||
      "—"
    );
  }, [profile]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar onLogout={logout} />
      <div className="flex flex-1 flex-col">
        <Navbar
          userName={displayName}
          onLogout={logout}
          isLoadingProfile={isLoading && !profile}
        />
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="rounded-xl bg-white p-6 text-center text-slate-500 shadow-sm">
              A carregar estatísticas...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <DashboardCard
                title="Meus Formulários"
                value={formCount}
                icon="📄"
              />
              <DashboardCard title="Plano Atual" value={planName} icon="💎" />
              <DashboardCard
                title="Respostas Totais"
                value={responsesCount}
                icon="✉️"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
