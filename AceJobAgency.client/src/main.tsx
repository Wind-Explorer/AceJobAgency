import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SessionTimeout from "./components/SessionTimeout.tsx";
import { getAccessToken, logout } from "./http.ts";

document.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <HeroUIProvider>
        <main>
          <App />
          <ToastContainer />
          {getAccessToken() && (
            <SessionTimeout timeout={1 * 60 * 1000} onLogout={logout} />
          )}
        </main>
      </HeroUIProvider>
    </BrowserRouter>
  </React.StrictMode>
);
