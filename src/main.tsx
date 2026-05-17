// © 2026 MATRXe. All rights reserved. Proprietary and confidential.
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initLanguage } from "@/i18n";

// Init language
initLanguage();

// Register PWA service worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// Init onboarding check
const onboardingSeen = localStorage.getItem("matrxe_onboarding_complete");
if (!onboardingSeen) {
  localStorage.setItem("matrxe_onboarding_show", "true");
}

createRoot(document.getElementById("root")!).render(<App />);
