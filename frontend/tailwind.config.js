export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        "violet-soft": "0 24px 60px -40px rgba(124, 58, 237, 0.65)",
      },
      colors: {
        "nexform-surface": "#F8FAFC",
        "nexform-text": "#1E293B",
      },
    },
  },
  plugins: [],
};
