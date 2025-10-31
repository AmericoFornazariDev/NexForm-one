import PropTypes from "prop-types";

const TONE_OPTIONS = [
  { value: "simpatico", label: "Simpático" },
  { value: "formal", label: "Formal" },
  { value: "tecnico", label: "Técnico" },
  { value: "motivacional", label: "Motivacional" },
];

const STYLE_OPTIONS = [
  { value: "curta", label: "Curta" },
  { value: "detalhada", label: "Detalhada" },
  { value: "analitica", label: "Analítica" },
];

const MODE_OPTIONS = [
  { value: "llama", label: "LLaMA" },
  { value: "gpt", label: "GPT" },
];

export default function AIConfigCard({ value, onChange, onSave, isSaving }) {
  const handleChange = (field) => (event) => {
    const target = event?.target;
    const newValue = target?.value ?? "";

    onChange?.(field, newValue);
  };

  const handleObjectiveChange = (event) => {
    onChange?.("objective", event?.target?.value ?? "");
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold text-slate-800">
        Configuração da IA
      </h2>

      <div className="grid gap-4">
        <label className="flex flex-col text-sm font-medium text-slate-700">
          Tom
          <select
            value={value?.tone ?? ""}
            onChange={handleChange("tone")}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Selecione um tom
            </option>
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-slate-700">
          Estilo
          <select
            value={value?.style ?? ""}
            onChange={handleChange("style")}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Selecione um estilo
            </option>
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col text-sm font-medium text-slate-700">
          Objetivo
          <input
            type="text"
            value={value?.objective ?? ""}
            onChange={handleObjectiveChange}
            placeholder="satisfação geral, atendimento, produto..."
            className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <label className="flex flex-col text-sm font-medium text-slate-700">
          IA preferida
          <select
            value={value?.ai_mode ?? ""}
            onChange={handleChange("ai_mode")}
            className="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="" disabled>
              Selecione a IA
            </option>
            {MODE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
      >
        {isSaving ? "A guardar..." : "Guardar"}
      </button>
    </div>
  );
}

AIConfigCard.propTypes = {
  value: PropTypes.shape({
    tone: PropTypes.string,
    style: PropTypes.string,
    objective: PropTypes.string,
    ai_mode: PropTypes.string,
  }),
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  isSaving: PropTypes.bool,
};

AIConfigCard.defaultProps = {
  value: {
    tone: "",
    style: "",
    objective: "",
    ai_mode: "",
  },
  onChange: undefined,
  onSave: undefined,
  isSaving: false,
};
