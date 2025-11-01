export default function StatCard({ title, value, helper }) {
  return (
    <div className="group overflow-hidden rounded-2xl bg-white p-6 text-center shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <span className="text-lg font-semibold">{String(value).slice(0, 1)}</span>
      </div>
      <h3 className="mt-4 text-sm font-medium uppercase tracking-wide text-slate-400">{title}</h3>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
      {helper ? <p className="mt-2 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}
