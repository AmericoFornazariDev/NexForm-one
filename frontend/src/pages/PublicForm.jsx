import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';

const PublicForm = () => {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const { data } = await api.get(`/forms/${id}`);
        setForm(data);
      } catch (err) {
        setError('Não foi possível carregar o formulário.');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-500">A preparar o teu formulário...</p>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          <h1 className="text-xl font-semibold text-slate-900">Ops!</h1>
          <p className="mt-2 text-sm text-slate-600">{error || 'Formulário não encontrado.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-100 px-4 py-12">
      <div className="mx-auto w-full max-w-3xl rounded-3xl bg-white p-10 shadow-xl">
        <header className="border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-semibold text-slate-900">{form.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{form.description}</p>
        </header>

        <section className="mt-8 space-y-6">
          {form.questions?.map((question, index) => (
            <div key={question.id ?? index} className="rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-medium text-slate-900">
                {index + 1}. {question.text}
              </h3>
              {question.type === 'text' && (
                <textarea
                  className="mt-3 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-slate-500 focus:outline-none"
                  placeholder="Escreve a tua resposta"
                  rows={4}
                />
              )}
              {question.type === 'choice' && (
                <div className="mt-4 space-y-2">
                  {question.options?.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm text-slate-600">
                      <input type="radio" name={`question-${index}`} value={option} />
                      {option}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        <button className="mt-10 w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700">
          Enviar respostas
        </button>
      </div>
    </div>
  );
};

export default PublicForm;
