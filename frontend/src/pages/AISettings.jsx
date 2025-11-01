import { useEffect, useState } from "react";
import { Cpu, MessageSquare, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { getAIConfig, saveAIConfig } from "../services/api.js";

const toneOptions = ["simpático", "formal", "técnico", "motivacional"];
const styleOptions = ["curta", "detalhada", "analítica"];

export default function AISettings() {
  const [tone, setTone] = useState("simpático");
  const [style, setStyle] = useState("curta");
  const [goal, setGoal] = useState("satisfação geral");
  const [aiMode, setAiMode] = useState("llama");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchConfig = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getAIConfig();
        if (!isMounted) return;

        const data = response?.data ?? {};

        if (typeof data.tone === "string" && toneOptions.includes(data.tone)) {
          setTone(data.tone);
        }

        if (typeof data.style === "string" && styleOptions.includes(data.style)) {
          setStyle(data.style);
        }

        if (typeof data.goal === "string" && data.goal.trim().length > 0) {
          setGoal(data.goal);
        }

        if (typeof data.ai_mode === "string") {
          const normalizedMode = data.ai_mode.toLowerCase();
          if (["llama", "gpt"].includes(normalizedMode)) {
            setAiMode(normalizedMode);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load AI configuration", err);
        setError("Não foi possível carregar a configuração da IA.");
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

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setToastMessage(null);
    }, 3500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [toastMessage]);

  const isFormDisabled = isLoading || isSaving;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      await saveAIConfig({
        tone,
        style,
        goal,
        ai_mode: aiMode,
      });
      setToastMessage("Configurações guardadas com sucesso!");
    } catch (err) {
      console.error("Failed to save AI configuration", err);
      setError("Não foi possível guardar as configurações da IA.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-nexform-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Configurar IA" />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <section className="rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 px-6 py-8 text-white shadow-lg shadow-violet-200">
            <h1 className="text-2xl font-semibold">Personalize o assistente NexForm</h1>
            <p className="mt-2 max-w-2xl text-sm text-violet-100">
              Ajuste o tom, estilo e objetivos do motor de IA para oferecer experiências consistentes e alinhadas com a sua marca.
            </p>
          </section>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/80 px-5 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          )}

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card title="Tom e linguagem" icon={MessageSquare}>
              <label className="text-sm font-medium text-slate-600">Tom da IA</label>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
                disabled={isFormDisabled}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {toneOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>

              <label className="mt-4 text-sm font-medium text-slate-600">Estilo de resposta</label>
              <select
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                disabled={isFormDisabled}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                {styleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </Card>

            <Card title="Objetivo das interações" icon={SlidersHorizontal}>
              <label className="text-sm font-medium text-slate-600">Foco principal</label>
              <input
                type="text"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                disabled={isFormDisabled}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
                placeholder="ex: satisfação geral, atendimento, produto..."
              />
              <p className="mt-3 text-xs text-slate-500">
                Este objetivo é utilizado para orientar a geração de respostas e priorizar feedback relevante.
              </p>
            </Card>

            <Card title="Modelo inteligente" icon={Cpu}>
              <label className="text-sm font-medium text-slate-600">Modelo de IA</label>
              <select
                value={aiMode}
                onChange={(event) => setAiMode(event.target.value)}
                disabled={isFormDisabled}
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
              >
                <option value="llama">LLaMA · execução local</option>
                <option value="gpt">GPT-5 · inteligência na nuvem</option>
              </select>
              <div className="mt-4 rounded-2xl bg-violet-50/70 p-4 text-xs text-violet-700">
                <p className="font-semibold">Sugestão</p>
                <p className="mt-1">
                  Utilize o modo híbrido GPT-5 para análises mais profundas quando tiver picos de respostas.
                </p>
              </div>
            </Card>
          </section>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={isFormDisabled}
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300"
            >
              {isSaving ? "A guardar..." : isLoading ? "A carregar..." : "Guardar configurações"}
            </button>
          </div>
        </main>
      </div>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-medium text-emerald-700 shadow-lg shadow-emerald-100">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function Card({ title, icon: Icon, children }) {
  return (
    <article className="flex h-full flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-600 shadow-sm shadow-violet-100">
          <Icon className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      </div>
      {children}
    </article>
  );
}
