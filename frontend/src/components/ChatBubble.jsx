import { motion } from "framer-motion";

const bubbleVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function ChatBubble({ message }) {
  const isAI = message.sender === "ai";

  return (
    <motion.div
      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
      initial="hidden"
      animate="visible"
      variants={bubbleVariants}
      transition={{ type: "spring", stiffness: 120, damping: 14 }}
    >
      <div
        className={`max-w-sm rounded-2xl px-4 py-3 text-sm shadow-sm transition-colors ${
          isAI
            ? "bg-white text-slate-700 border border-slate-200"
            : "bg-blue-600 text-white"
        }`}
      >
        {message.text}
      </div>
    </motion.div>
  );
}
