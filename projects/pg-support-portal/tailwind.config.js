/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17212b",
        pine: "#0f766e",
        mint: "#d7f7ed",
        line: "#d9e2e7",
      },
      boxShadow: {
        soft: "0 14px 36px rgba(23, 33, 43, 0.08)",
      },
    },
  },
  plugins: [],
};
