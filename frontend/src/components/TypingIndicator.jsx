export default function TypingIndicator() {
  return (
    <div className="flex flex-col items-center space-y-1">
      <div className="flex space-x-1">
        <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
        <span
          className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
      <span className="text-xs text-slate-400 tracking-wide uppercase">IA está a pensar...</span>
    </div>
  );
}
