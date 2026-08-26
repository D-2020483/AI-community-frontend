import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#fff",
          color: "#1e293b",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 24px -6px rgba(15,23,42,0.12)",
          fontSize: "13px",
          fontWeight: 500,
        },
        success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  </StrictMode>,
);
