import { motion } from "framer-motion";

const avatar = "https://via.placeholder.com/100?text=AI";

export default function AvatarAI({ isSpeaking }) {
  return (
    <motion.div
      animate={{ scale: isSpeaking ? 1.05 : 1, y: isSpeaking ? -2 : 0 }}
      transition={{ duration: 0.6, repeat: isSpeaking ? Infinity : 0, repeatType: "mirror" }}
      className="flex justify-center"
    >
      <img
        src={avatar}
        alt="AI Avatar"
        className="w-20 h-20 rounded-full border-4 border-blue-500 shadow-md shadow-blue-200/60"
      />
    </motion.div>
  );
}
