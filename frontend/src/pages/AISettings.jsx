import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import AIConfigCard from "../components/AIConfigCard.jsx";
import { getAIConfig, saveAIConfig } from "../services/api";

const INITIAL_CONFIG = {
  tone: "",
  style: "",
  objective: "",
  ai_mode: "",
};

export default function AISettings() {
  const [config, setConfig] = useState(INITIAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      setIsLoading(true);
      setFeedback({ type: null, message: "" });

      try {
        const response = await getAIConfig();
        const data = response?.data ?? {};

        if (!isMounted) {
          return;
        }

        setConfig({
          tone: data.tone ?? data.ai_tone ?? "",
          style: data.style ?? data.ai_style ?? "",
          objective: data.objective ?? data.goal ?? "",
          ai_mode: data.ai_mode ?? data.preferred_ai ?? "",
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load AI config", error);
        setFeedback({
          type: "error",
          message: "Não foi possível carregar a configuração da IA.",
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!config.tone || !config.style || !config.ai_mode) {
      setFeedback({
        type: "error",
        message: "Preencha pelo menos tom, estilo e IA preferida.",
      });
      return;
    }

    try {
      setIsSaving(true);
      setFeedback({ type: null, message: "" });
      await saveAIConfig({
        tone: config.tone,
        style: config.style,
        objective: config.objective,
        ai_mode: config.ai_mode,
      });
      setFeedback({ type: "success", message: "Configurações guardadas com sucesso." });
    } catch (error) {
      console.error("Failed to save AI config", error);
      setFeedback({
        type: "error",
        message: "Não foi possível guardar as configurações.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl">
            <header className="mb-6">
              <h1 className="text-2xl font-semibold text-slate-800">Configurações da IA</h1>
              <p className="mt-1 text-sm text-slate-600">
                Personalize o comportamento da IA de acordo com a identidade do seu comércio.
              </p>
            </header>

            {feedback.message && (
              <div
                className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                  feedback.type === "success"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}

            {isLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
                A carregar configuração...
              </div>
            ) : (
              <AIConfigCard
                value={config}
                onChange={handleChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
