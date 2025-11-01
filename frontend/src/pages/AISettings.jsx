import { useState } from "react";
import { Cpu, MessageSquare, SlidersHorizontal } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const toneOptions = ["simpático", "formal", "técnico", "motivacional"];
const styleOptions = ["curta", "detalhada", "analítica"];

export default function AISettings() {
  const [tone, setTone] = useState("simpático");
  const [style, setStyle] = useState("curta");
  const [goal, setGoal] = useState("satisfação geral");
  const [aiMode, setAiMode] = useState("llama");

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

          <section className="mt-8 grid gap-6 lg:grid-cols-3">
            <Card title="Tom e linguagem" icon={MessageSquare}>
              <label className="text-sm font-medium text-slate-600">Tom da IA</label>
              <select
                value={tone}
                onChange={(event) => setTone(event.target.value)}
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
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-8 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300"
            >
              Guardar configurações
            </button>
          </div>
        </main>
      </div>
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
