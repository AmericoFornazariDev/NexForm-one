const plans = [
  {
    name: 'Starter',
    price: '€19/mês',
    description: 'Ideal para pequenos negócios a iniciar com formulários inteligentes.'
  },
  {
    name: 'Growth',
    price: '€49/mês',
    description: 'Automatiza fluxos com IA e integrações avançadas.'
  },
  {
    name: 'Scale',
    price: '€99/mês',
    description: 'Suporte prioritário e funcionalidades premium para equipas.'
  }
];

const Plans = () => (
  <div className="space-y-6">
    <section className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Planos</h2>
        <p className="mt-2 text-sm text-slate-600">Escolhe o plano ideal para o teu crescimento.</p>
      </div>
      <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
        Falar com vendas
      </button>
    </section>

    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <div key={plan.name} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
            <span className="text-sm font-medium text-slate-600">{plan.price}</span>
          </div>
          <p className="mt-4 text-sm text-slate-600">{plan.description}</p>
          <button className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
            Fazer upgrade
          </button>
        </div>
      ))}
    </div>
  </div>
);

export default Plans;
