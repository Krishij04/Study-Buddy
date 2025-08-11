import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";
// import { ThemeProvider } from "./context/ThemeContext";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    {/* <ThemeProvider> */}
      <StoreContextProvider>
        <App />
      </StoreContextProvider>
    {/* </ThemeProvider> */}
  </BrowserRouter>
);
