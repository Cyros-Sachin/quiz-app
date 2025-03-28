import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css"; // Tailwind CSS import

// Render the App Component inside the root element of the HTML
ReactDOM.render(
  <App />,  // Just render App without the extra Router
  document.getElementById("root")
);
