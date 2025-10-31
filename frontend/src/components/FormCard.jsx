export default function FormCard({ form, onDelete }) {
  if (!form) return null;

  return (
    <div className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition">
      <h2 className="text-lg font-semibold mb-2">{form.title}</h2>
      {form.qr_url && (
        <img
          src={form.qr_url}
          alt={`QR Code para ${form.title}`}
          className="mx-auto w-32 h-32 mb-3 object-contain"
        />
      )}
      {form.description && (
        <p className="text-sm text-slate-600 mb-3">{form.description}</p>
      )}
      <div className="flex justify-between items-center text-sm text-slate-500">
        <span>Modo: {form.ai_mode}</span>
        <button
          type="button"
          onClick={() => onDelete?.(form.id)}
          className="text-red-600 hover:text-red-800"
          aria-label="Eliminar formulário"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
