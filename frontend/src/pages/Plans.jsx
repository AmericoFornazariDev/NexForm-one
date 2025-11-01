import { Check, Crown, Diamond, Rocket } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const plans = [
  {
    name: "Free",
    price: "0€",
    description: "Ideal para experimentar a plataforma",
    features: ["1 formulário ativo", "IA básica NexForm", "QR Code automático"],
    icon: Rocket,
    highlight: false,
    cta: "Plano atual",
  },
  {
    name: "Pro",
    price: "29€",
    description: "Tudo o que precisa para crescer",
    features: [
      "5 formulários simultâneos",
      "IA híbrida (LLaMA + GPT)",
      "Relatórios automáticos avançados",
      "Exportação ilimitada",
    ],
    icon: Crown,
    highlight: true,
    cta: "Subscrever Pro",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Soluções dedicadas para equipas",
    features: [
      "Formulários ilimitados",
      "Modelos de IA personalizados",
      "Suporte dedicado 24/7",
      "Integração com API",
    ],
    icon: Diamond,
    highlight: false,
    cta: "Falar com vendas",
  },
];

export default function Plans() {
  return (
    <div className="flex min-h-screen bg-nexform-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar title="Planos" />
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-10">
          <section className="rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 px-6 py-8 text-white shadow-lg shadow-violet-200">
            <h1 className="text-2xl font-semibold">Planos e subscrições</h1>
            <p className="mt-2 max-w-2xl text-sm text-violet-100">
              Escolha o plano que melhor se adapta ao seu negócio e liberte o potencial total das automações e relatórios NexForm.
            </p>
          </section>

          <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <article
                  key={plan.name}
                  className={`relative flex h-full flex-col rounded-3xl p-6 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl ${
                    plan.highlight
                      ? "bg-gradient-to-br from-white to-violet-50 border border-violet-200"
                      : "bg-white border border-slate-200"
                  }`}
                >
                  {plan.highlight ? (
                    <span className="absolute right-6 top-6 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white shadow shadow-violet-300">
                      Mais popular
                    </span>
                  ) : null}
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                        plan.highlight
                          ? "bg-gradient-to-br from-violet-500 to-indigo-500 text-white"
                          : "bg-violet-100 text-violet-600"
                      } shadow-sm shadow-violet-100`}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{plan.name}</h2>
                      <p className="text-sm text-slate-500">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mt-6 text-4xl font-semibold text-slate-900">
                    {plan.price}
                    <span className="text-base font-normal text-slate-400">/mês</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-600">
                    {plan.features.map((feature) => (
                      <li key={`${plan.name}-${feature}`} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-violet-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    type="button"
                    className={`mt-8 inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 ease-in-out hover:-translate-y-0.5 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300"
                        : "border border-slate-200 text-slate-600 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </article>
              );
            })}
          </section>
        </main>
      </div>
    </div>
  );
}
