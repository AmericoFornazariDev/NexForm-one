import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import GlobalReportCard from "../components/GlobalReportCard";
import { exportCSV, exportPDF, getGlobalReport } from "../services/exportService";

export default function ReportsOverview() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getGlobalReport()
      .then((response) => {
        if (!isMounted) return;
        setForms(Array.isArray(response.data) ? response.data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setError("Não foi possível carregar os relatórios no momento.");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-nexform-surface">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar title="Relatórios" />
        <main className="overflow-y-auto px-6 py-8 md:px-10">
          <section className="rounded-3xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-8 text-white shadow-lg shadow-violet-200">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold">Relatórios globais</h1>
              <p className="max-w-2xl text-sm text-violet-100">
                Visualize rapidamente o desempenho dos seus formulários com dados consolidados, exportações rápidas e insights acionáveis.
              </p>
            </div>
          </section>

          {loading ? (
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[0, 1].map((index) => (
                <div key={index} className="h-48 animate-pulse rounded-3xl bg-white/70 shadow-lg shadow-violet-100" />
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-600 shadow-sm">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <section className="mt-8 space-y-4">
              {forms.length === 0 ? (
                <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center text-slate-500">
                  Ainda não existem respostas para gerar relatórios.
                </div>
              ) : (
                forms.map((form) => (
                  <GlobalReportCard
                    key={form.id}
                    form={form}
                    onExportPDF={exportPDF}
                    onExportCSV={exportCSV}
                  />
                ))
              )}
            </section>
          ) : null}
        </main>
      </div>
    </div>
  );
}
