import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PublicForm() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const f = await axios.get(`http://localhost:5000/api/forms/${id}`);
        setForm(f.data);
        const q = await axios.post(`http://localhost:5000/api/forms/${id}/next`);
        setQuestion(q.data.question);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [id]);

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
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) return <p className="p-6">A carregar...</p>;

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-6">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-slate-700">{form?.title}</h1>
        <p className="text-slate-500 mb-4">{form?.description}</p>

        <div className="bg-slate-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
          {chat.map((msg, i) => (
            <p
              key={i}
              className={`p-2 my-1 rounded-lg ${
                msg.type === "user" ? "bg-blue-100 text-right" : "bg-gray-200 text-left"
              }`}
            >
              {msg.text}
            </p>
          ))}
          {question && <p className="bg-gray-200 p-2 rounded-lg mt-2">{question}</p>}
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Digite sua resposta..."
            className="flex-1 border rounded p-2"
          />
          <button onClick={sendAnswer} className="bg-blue-600 text-white px-4 rounded">
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
