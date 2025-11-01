import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AISettings() {
  const [tone, setTone] = useState("simpático");
  const [style, setStyle] = useState("curta");
  const [goal, setGoal] = useState("satisfação geral");
  const [aiMode, setAiMode] = useState("llama");

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold text-slate-700">Configurar IA</h1>
            <p className="text-slate-600">
              Ajuste o comportamento da IA para os seus formulários.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-slate-600 mb-2">Tom</label>
                <select value={tone} onChange={e => setTone(e.target.value)} className="border rounded p-2 w-full">
                  <option value="simpático">Simpático</option>
                  <option value="formal">Formal</option>
                  <option value="técnico">Técnico</option>
                  <option value="motivacional">Motivacional</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-2">Estilo</label>
                <select value={style} onChange={e => setStyle(e.target.value)} className="border rounded p-2 w-full">
                  <option value="curta">Curta</option>
                  <option value="detalhada">Detalhada</option>
                  <option value="analítica">Analítica</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-2">Objetivo</label>
                <input
                  type="text"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  className="border rounded p-2 w-full"
                  placeholder="ex: satisfação geral, atendimento, produto..."
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-2">Modelo de IA</label>
                <select value={aiMode} onChange={e => setAiMode(e.target.value)} className="border rounded p-2 w-full">
                  <option value="llama">LLaMA (local)</option>
                  <option value="gpt">GPT-5 (nuvem)</option>
                </select>
              </div>
            </div>

            <button className="bg-blue-600 text-white px-6 py-2 rounded shadow mt-6">
              Guardar Configurações
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
