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
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="p-6 space-y-4 overflow-y-auto">
          <h1 className="text-2xl font-semibold text-slate-700">Relatórios Globais</h1>
          {loading && <p className="text-slate-500">A carregar dados...</p>}
          {error && (
            <p className="text-red-500 bg-red-50 border border-red-200 p-3 rounded">{error}</p>
          )}
          {!loading && !error && forms.length === 0 && (
            <p className="text-slate-500">Ainda não existem respostas para gerar relatórios.</p>
          )}
          {!loading && !error &&
            forms.map((form) => (
              <GlobalReportCard
                key={form.id}
                form={form}
                onExportPDF={exportPDF}
                onExportCSV={exportCSV}
              />
            ))}
        </main>
      </div>
    </div>
  );
}
