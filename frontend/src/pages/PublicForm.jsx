import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";

const bubbleVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

export default function PublicForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);
  const chatRef = useRef(null);

  useEffect(() => {
    async function init() {
      try {
        const f = await axios.get(`http://localhost:5000/api/forms/${id}`);
        setForm(f.data);
        const q = await axios.post(`http://localhost:5000/api/forms/${id}/next`);
        setQuestion(q.data.question);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id]);

  useEffect(() => {
    if (!chatRef.current) return;
    chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [chat, question]);

  async function sendAnswer() {
    if (!answer.trim()) return;
    const newChat = [...chat, { type: "user", text: answer }];
    setChat(newChat);
    setAnswer("");

    try {
      const res = await axios.post(`http://localhost:5000/api/forms/${id}/respond`, { answer });
      const next = res.data.next?.question;
      if (next) {
        setChat([...newChat, { type: "ai", text: next }]);
        setQuestion(next);
      } else {
        setQuestion("Obrigado por responder ao nosso inquérito!");
      }
    } catch (error) {
      console.error(error);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-100 to-indigo-100 p-6 text-slate-600">
        A carregar formulário...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-[32px] bg-white/80 p-8 shadow-2xl shadow-violet-100 backdrop-blur">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">{form?.title}</h1>
          <p className="mt-2 text-sm text-slate-500">{form?.description}</p>
        </header>

        <div
          ref={chatRef}
          className="relative h-80 overflow-y-auto rounded-3xl border border-slate-100 bg-slate-50/60 p-4 shadow-inner"
        >
          <AnimatePresence initial={false}>
            {chat.map((msg, index) => (
              <motion.div
                key={`${msg.type}-${index}`}
                variants={bubbleVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                className={`mx-2 my-2 max-w-[80%] rounded-2xl p-3 text-sm shadow-sm transition-all duration-300 ease-in-out ${
                  msg.type === "ai"
                    ? "bg-gradient-to-r from-violet-500 to-indigo-600 text-white"
                    : "ml-auto bg-slate-200 text-slate-700"
                }`}
              >
                {msg.text}
              </motion.div>
            ))}

            {question ? (
              <motion.div
                key={question}
                variants={bubbleVariants}
                initial="initial"
                animate="animate"
                className="max-w-[80%] rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 p-3 text-sm text-white shadow-lg"
              >
                {question}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            sendAnswer();
          }}
          className="mt-6 flex flex-col gap-3 rounded-3xl border border-slate-100 bg-white/80 p-4 shadow-lg shadow-violet-100 md:flex-row"
        >
          <input
            type="text"
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            placeholder="Escreva a sua resposta..."
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-700 transition focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-200"
          />
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-violet-200 transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-300"
          >
            Enviar resposta
          </button>
        </form>
      </div>
    </div>
  );
}
