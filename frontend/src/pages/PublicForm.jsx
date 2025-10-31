import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChatBubble from "../components/ChatBubble.jsx";
import { getPublicForm, respondToPublicForm } from "../services/api.js";

const DEFAULT_INTRO_MESSAGE = "Olá! Sou a assistente virtual da NexForm. Vamos começar?";

export default function PublicForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadForm = async () => {
      setIsFormLoading(true);
      setError("");

      try {
        const { data } = await getPublicForm(id);
        setForm(data);

        const safeTitle = data?.title?.trim();
        const safeDescription = data?.description?.trim();
        const titleFragment = safeTitle ? ` '${safeTitle}'` : "";

        const introMessage = safeDescription
          ? `Bem-vindo ao formulário${titleFragment}. ${safeDescription}`
          : safeTitle
          ? `Bem-vindo ao formulário '${safeTitle}'. ${DEFAULT_INTRO_MESSAGE}`
          : DEFAULT_INTRO_MESSAGE;

        setMessages([{ sender: "ai", text: introMessage }]);
      } catch (err) {
        console.error("Failed to load public form", err);
        setError("Não foi possível carregar o formulário. Tente novamente mais tarde.");
        setMessages([
          {
            sender: "ai",
            text: "Desculpe, não consegui carregar este formulário agora.",
          },
        ]);
      } finally {
        setIsFormLoading(false);
      }
    };

    loadForm();
  }, [id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const isInputDisabled = useMemo(
    () => isFormLoading || isSending || Boolean(error && !form),
    [error, form, isFormLoading, isSending]
  );

  const handleSend = async () => {
    const trimmedInput = input.trim();

    if (!trimmedInput || isInputDisabled) {
      return;
    }

    const userMessage = { sender: "user", text: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setError("");
    setIsSending(true);

    try {
      const { data } = await respondToPublicForm(id, trimmedInput);
      const aiReply = data?.reply?.trim();

      if (aiReply) {
        setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
      }
    } catch (err) {
      console.error("Failed to send response", err);
      setError("Não foi possível enviar sua resposta. Tente novamente.");
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Desculpe, ocorreu um erro ao processar sua resposta. Pode tentar novamente?",
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100">
      <header className="bg-white shadow p-4 text-center">
        <p className="text-sm font-medium text-slate-500">Formulário Interativo — NexForm</p>
        {form?.title && (
          <h1 className="mt-1 text-xl font-semibold text-slate-700">{form.title}</h1>
        )}
        {form?.description && (
          <p className="mt-1 text-sm text-slate-500">{form.description}</p>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {isFormLoading && (
          <div className="text-center text-sm text-slate-500">Carregando formulário...</div>
        )}

        {messages.map((msg, index) => (
          <ChatBubble key={`${msg.sender}-${index}-${msg.text}`} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-4 border-t flex">
        <input
          type="text"
          placeholder="Digite sua resposta..."
          className="flex-1 border rounded p-2 mr-2"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isInputDisabled}
        >
          {isSending ? "Enviando..." : "Enviar"}
        </button>
      </footer>
    </div>
  );
}
