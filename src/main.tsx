import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { CarritoProvider } from "./context/CarritoContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
<CarritoProvider>
      <App />
</CarritoProvider>
  </StrictMode>
);
