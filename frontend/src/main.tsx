import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Inter selbst gehostet (fontsource, lokale woff2 – kein Google-Fonts-Fetch).
// Der ganze variable Font-Umfang in einem Import; die Family heisst "Inter Variable".
import "@fontsource-variable/inter";
import { GlobalStyle } from "./styles/GlobalStyle";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>,
);
