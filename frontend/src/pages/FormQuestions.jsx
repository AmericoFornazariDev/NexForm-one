import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import QuestionItem from "../components/QuestionItem.jsx";
import {
  createFormQuestion,
  deleteQuestion,
  getFormDetails,
  getFormQuestions,
  updateQuestion,
} from "../services/api";

const INITIAL_FORM = {
  question: "",
  sort_order: 0,
  is_required: false,
  is_active: true,
};

export default function FormQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formTitle, setFormTitle] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [newQuestion, setNewQuestion] = useState(INITIAL_FORM);

  const formId = useMemo(() => id, [id]);

  useEffect(() => {
    if (!formId) {
      return;
    }

    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [formResponse, questionsResponse] = await Promise.all([
          getFormDetails(formId),
          getFormQuestions(formId),
        ]);

        if (!isMounted) {
          return;
        }

        const formData = formResponse?.data ?? {};
        const questionsData = questionsResponse?.data ?? [];

        setFormTitle(formData.title ?? formData.name ?? "");
        setQuestions(Array.isArray(questionsData) ? questionsData : questionsData.data ?? []);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error("Failed to load form questions", err);
        setError("Não foi possível carregar as perguntas do formulário.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [formId]);

  const refreshQuestions = async () => {
    if (!formId) {
      return;
    }

    try {
      setError(null);
      const response = await getFormQuestions(formId);
      const data = response?.data ?? [];
      setQuestions(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      console.error("Failed to refresh questions", err);
      setError("Não foi possível atualizar a lista de perguntas.");
    }
  };

  const handleFieldChange = (field) => (event) => {
    const value =
      field === "is_required" || field === "is_active"
        ? Boolean(event?.target?.checked)
        : event?.target?.value;

    setNewQuestion((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateQuestion = async (event) => {
    event.preventDefault();

    if (!formId) {
      return;
    }

    if (!newQuestion.question.trim() || Number(newQuestion.sort_order) < 0) {
      setError("Preencha a pergunta e uma ordem válida (>= 0).");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await createFormQuestion(formId, {
        question: newQuestion.question,
        sort_order: Number(newQuestion.sort_order) || 0,
        is_required: Boolean(newQuestion.is_required),
        is_active: Boolean(newQuestion.is_active),
      });
      setNewQuestion({ ...INITIAL_FORM });
      await refreshQuestions();
    } catch (err) {
      console.error("Failed to create question", err);
      setError("Não foi possível adicionar a pergunta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditQuestion = async (questionId, payload) => {
    if (!questionId) {
      return;
    }

    if (!payload.question.trim() || Number(payload.sort_order) < 0) {
      setError("Preencha a pergunta e uma ordem válida (>= 0).");
      return;
    }

    try {
      setError(null);
      await updateQuestion(questionId, {
        question: payload.question,
        sort_order: Number(payload.sort_order) || 0,
        is_required: Boolean(payload.is_required),
        is_active: Boolean(payload.is_active),
      });
      await refreshQuestions();
    } catch (err) {
      console.error("Failed to update question", err);
      setError("Não foi possível atualizar a pergunta.");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!questionId) {
      return;
    }

    try {
      setError(null);
      await deleteQuestion(questionId);
      await refreshQuestions();
    } catch (err) {
      console.error("Failed to delete question", err);
      setError("Não foi possível eliminar a pergunta.");
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-4xl">
            <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">Perguntas do Formulário</h1>
                {formTitle && (
                  <p className="text-sm text-slate-600">Formulário: {formTitle}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
              >
                Voltar
              </button>
            </header>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-800">Nova pergunta</h2>
              <form className="mt-4 grid gap-4" onSubmit={handleCreateQuestion}>
                <label className="flex flex-col text-sm font-medium text-slate-700">
                  Pergunta
                  <textarea
                    value={newQuestion.question}
                    onChange={handleFieldChange("question")}
                    rows={3}
                    className="mt-1 rounded-lg border border-slate-200 px-3 py-2 text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </label>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="flex flex-col text-sm font-medium text-slate-700">
                    Ordem
                    <input
                      type="number"
                      min={0}
                      value={newQuestion.sort_order}
                      onChange={handleFieldChange("sort_order")}
                      className="mt-1 rounded-lg border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </label>

                  <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={newQuestion.is_required}
                      onChange={handleFieldChange("is_required")}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Obrigatória
                  </label>

                  <label className="mt-6 flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={newQuestion.is_active}
                      onChange={handleFieldChange("is_active")}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Ativa
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 md:w-auto"
                >
                  {isSubmitting ? "A adicionar..." : "Adicionar"}
                </button>
              </form>
            </section>

            <section className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-800">Perguntas existentes</h2>
              {isLoading ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 shadow-sm">
                  A carregar perguntas...
                </div>
              ) : questions.length ? (
                questions
                  .slice()
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
                  .map((question) => (
                    <QuestionItem
                      key={question.id}
                      item={question}
                      onEdit={handleEditQuestion}
                      onDelete={handleDeleteQuestion}
                    />
                  ))
              ) : (
                <p className="text-sm text-slate-600">Nenhuma pergunta adicionada ainda.</p>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
