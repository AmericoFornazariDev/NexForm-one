import FormCard from '../components/FormCard.jsx';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-2xl font-semibold text-slate-900">Bem-vindo de volta 👋</h2>
        <p className="mt-2 text-sm text-slate-600">
          Aqui encontras uma visão geral rápida dos teus formulários e desempenho.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((form) => (
          <FormCard
            key={form}
            title={`Formulário ${form}`}
            description="Coleciona feedback dos teus clientes com IA."
            responses={Math.floor(Math.random() * 120)}
          />
        ))}
      </section>
    </div>
  );
};

export default Dashboard;
