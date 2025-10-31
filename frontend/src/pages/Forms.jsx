import FormCard from '../components/FormCard.jsx';

const Forms = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Formulários</h2>
        <p className="mt-2 text-sm text-slate-600">
          Gere os formulários inteligentes criados pela IA.
        </p>
      </div>
      <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700">
        Novo Formulário
      </button>
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3, 4].map((form) => (
        <FormCard
          key={form}
          title={`Formulário ${form}`}
          description="Personaliza perguntas, fluxos e integrações."
          responses={Math.floor(Math.random() * 80)}
        />
      ))}
    </div>
  </div>
);

export default Forms;
