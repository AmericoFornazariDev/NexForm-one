import { useCallback, useEffect } from "react";

export function useSpeech() {
  const isSpeechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

  const speak = useCallback(
    (text, { onStart, onEnd } = {}) => {
      const trimmedText = text?.trim();

      if (!trimmedText) {
        onStart?.();
        onEnd?.();
        return;
      }

      if (!isSpeechSupported) {
        onStart?.();
        onEnd?.();
        return;
      }

      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = "pt-PT";
      utterance.rate = 1.0;

      if (onStart) {
        let hasStarted = false;
        const handleStart = () => {
          if (hasStarted) {
            return;
          }
          hasStarted = true;
          onStart();
          utterance.removeEventListener("start", handleStart);
        };

        utterance.addEventListener("start", handleStart);
        handleStart();
      }

      if (onEnd) {
        const handleEnd = () => {
          onEnd();
          utterance.removeEventListener("end", handleEnd);
          utterance.removeEventListener("error", handleEnd);
        };

        utterance.addEventListener("end", handleEnd);
        utterance.addEventListener("error", handleEnd);
      }

      synth.speak(utterance);
    },
    [isSpeechSupported]
  );

  useEffect(() => {
    return () => {
      if (isSpeechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeechSupported]);

  return { speak, isSpeechSupported };
}
