export default function ChatBubble({ message }) {
  const isAI = message.sender === "ai";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-xs p-3 rounded-lg ${
          isAI ? "bg-slate-200 text-slate-800" : "bg-blue-600 text-white"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
