import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";  // global styles
import "./App.css";    // dashboard styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
