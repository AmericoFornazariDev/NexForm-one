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
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="mb-3">
          <label className="flex flex-col text-sm font-medium text-slate-700">
            Pergunta
            <textarea
              value={formData.question}
              onChange={handleChange("question")}
              rows={3}
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
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
              className="mt-1 rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formData.is_required}
              onChange={handleChange("is_required")}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Obrigatória
          </label>

          <label className="mt-5 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={handleChange("is_active")}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Ativa
          </label>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {isSubmitting ? "A guardar..." : "Guardar"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-800">{item?.question}</p>
        <p className="text-xs text-slate-500">Ordem: {item?.sort_order ?? 0}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {item?.is_required && (
            <span className="rounded-full bg-red-100 px-2 py-1 text-red-700">Obrigatória</span>
          )}
          {item?.is_active ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700">Ativa</span>
          ) : (
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-600">Inativa</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
