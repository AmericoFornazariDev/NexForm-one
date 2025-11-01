import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export default function QuestionItem({ item, onEdit, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    question: item?.question ?? "",
    sort_order: item?.sort_order ?? 0,
    is_required: Boolean(item?.is_required),
    is_active: Boolean(item?.is_active),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setFormData({
      question: item?.question ?? "",
      sort_order: item?.sort_order ?? 0,
      is_required: Boolean(item?.is_required),
      is_active: Boolean(item?.is_active),
    });
    setIsEditing(false);
  }, [item]);

  const handleChange = (field) => (event) => {
    const value =
      field === "is_required" || field === "is_active"
        ? Boolean(event?.target?.checked)
        : event?.target?.value;

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!onEdit || isSubmitting) {
      return;
    }

    if (!formData.question.trim() || Number(formData.sort_order) < 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onEdit(item?.id, {
        ...formData,
        sort_order: Number(formData.sort_order) || 0,
      });
      setIsEditing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item?.id || !onDelete) {
      return;
    }

    const confirmDelete = window.confirm("Tem certeza que deseja eliminar a pergunta?");
    if (!confirmDelete) {
      return;
    }

    await onDelete(item.id);
  };

  if (isEditing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-violet-100"
      >
        <div className="mb-3">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Pergunta
            <textarea
              value={formData.question}
              onChange={handleChange("question")}
              rows={3}
              className="mt-1 rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>
        </div>

        <div className="mb-3 grid gap-3 sm:grid-cols-3">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Ordem
            <input
              type="number"
              min={0}
              value={formData.sort_order}
              onChange={handleChange("sort_order")}
              className="mt-1 rounded-2xl border border-slate-200 px-3 py-2 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </label>

          <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formData.is_required}
              onChange={handleChange("is_required")}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Obrigatória
          </label>

          <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange("is_active")}
                      className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            Ativa
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-violet-100 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-800">{item?.question}</p>
        <p className="text-xs text-slate-500">Ordem: {item?.sort_order ?? 0}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {item?.is_required && (
            <span className="rounded-full bg-rose-50 px-2 py-1 text-rose-600">Obrigatória</span>
          )}
          {item?.is_active ? (
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-600">Ativa</span>
          ) : (
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-600">Inativa</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-center">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-2xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-rose-50"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

QuestionItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    question: PropTypes.string,
    sort_order: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    is_required: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
    is_active: PropTypes.oneOfType([PropTypes.bool, PropTypes.number]),
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

QuestionItem.defaultProps = {
  onEdit: undefined,
  onDelete: undefined,
};
