import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import AvatarAI from "../components/AvatarAI.jsx";
import ChatBubble from "../components/ChatBubble.jsx";
import TypingIndicator from "../components/TypingIndicator.jsx";
import { useSpeech } from "../hooks/useSpeech.js";
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
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const lastSpokenIndexRef = useRef(-1);
  const { speak, isSpeechSupported } = useSpeech();

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
        const fallbackMessage = "Desculpe, não consegui carregar este formulário agora.";
        setMessages([{ sender: "ai", text: fallbackMessage }]);
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

  useEffect(() => {
    if (!isSpeechSupported) {
      setIsSpeaking(false);
      return;
    }

    const lastMessageIndex = messages.length - 1;
    const lastMessage = messages[lastMessageIndex];

    if (!lastMessage || lastMessage.sender !== "ai") {
      return;
    }

    if (lastSpokenIndexRef.current === lastMessageIndex) {
      return;
    }

    lastSpokenIndexRef.current = lastMessageIndex;

    speak(lastMessage.text, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  }, [messages, speak, isSpeechSupported]);

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
    setIsTyping(true);

    try {
      const { data } = await respondToPublicForm(id, trimmedInput);
      const aiReply = data?.reply?.trim();

      if (aiReply) {
        setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
      }
    } catch (err) {
      console.error("Failed to send response", err);
      setError("Não foi possível enviar sua resposta. Tente novamente.");
      const fallbackReply =
        "Desculpe, ocorreu um erro ao processar sua resposta. Pode tentar novamente?";
      setMessages((prev) => [...prev, { sender: "ai", text: fallbackReply }]);
    } finally {
      setIsSending(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-100 via-slate-100 to-slate-200">
      <header className="bg-white/80 backdrop-blur shadow p-4 text-center border-b border-slate-200">
        <p className="text-sm font-medium text-slate-500">Formulário Interativo — NexForm</p>
        {form?.title && (
          <h1 className="mt-1 text-xl font-semibold text-slate-700">{form.title}</h1>
        )}
        {form?.description && (
          <p className="mt-1 text-sm text-slate-500">{form.description}</p>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <AvatarAI isSpeaking={isSpeaking} />
          {error && (
            <div className="w-full max-w-lg rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {isFormLoading && (
            <div className="text-center text-sm text-slate-500">Carregando formulário...</div>
          )}
        </div>

        <div className="space-y-4">
          {messages.map((msg, index) => (
            <ChatBubble key={`${msg.sender}-${index}-${msg.text}`} message={msg} />
          ))}

          {isTyping && (
            <div className="flex justify-center">
              <TypingIndicator />
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white/90 backdrop-blur p-4 border-t border-slate-200">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Digite sua resposta..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isInputDisabled}
          />
          <button
            onClick={handleSend}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isInputDisabled}
          >
            {isSending ? "Enviando..." : "Enviar"}
          </button>
        </div>
        {!isSpeechSupported && (
          <p className="mt-2 text-xs text-slate-400 text-center">
            A voz da assistente não é suportada neste navegador.
          </p>
        )}
      </footer>
    </div>
  );
}
