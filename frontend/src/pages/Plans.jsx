import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function Plans() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold text-slate-700">Planos e Subscrições</h1>
            <p className="text-slate-600">
              Escolha o plano que melhor se adapta ao seu negócio.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="font-semibold text-lg mb-2">Free</h2>
                <p className="text-slate-500 mb-4">1 Formulário, IA básica, QR automático</p>
                <button className="bg-slate-600 text-white px-4 py-2 rounded">Ativo</button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="font-semibold text-lg mb-2">Pro</h2>
                <p className="text-slate-500 mb-4">5 Formulários, IA híbrida (LLaMA + GPT)</p>
                <button className="bg-blue-600 text-white px-4 py-2 rounded">Subscrever</button>
              </div>

              <div className="bg-white p-6 rounded-xl shadow text-center">
                <h2 className="font-semibold text-lg mb-2">Enterprise</h2>
                <p className="text-slate-500 mb-4">Ilimitado, relatórios avançados e API</p>
                <button className="bg-emerald-600 text-white px-4 py-2 rounded">Contactar</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
