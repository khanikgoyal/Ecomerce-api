import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import ShopContextProvider from "./contexts/ShopContext.jsx";

// Polyfill process for Vite
window.process = {
  env: {
    REACT_APP_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  },
};

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ShopContextProvider>
      <App />
    </ShopContextProvider>
  </BrowserRouter>
);
