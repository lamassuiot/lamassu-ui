import { App } from "App";
import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

declare global {
  interface Window { _env_: any; }
}

ReactDOM.render(
    <React.StrictMode>
        <FluentProvider theme={webLightTheme} style={{ height: "100%" }}>
            <App />
        </FluentProvider>
    </ React.StrictMode>,
    document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
