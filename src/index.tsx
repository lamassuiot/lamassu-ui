import "./index.css";
import * as oidc from "oidc-client-ts";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import ThemeProviderWrapper from "./theme/ThemeProvider";
import reportWebVitals from "./reportWebVitals";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

declare global {
  interface Window {
    _env_: {
      AUTH_OIDC_AUTHORITY: string;
      AUTH_OIDC_CLIENT_ID: string;
      AUTH_COGNITO_ENABLED: string;
      AUTH_COGNITO_HOSTED_UI_DOMAIN: string;

      LAMASSU_CA_API: string;
      LAMASSU_DMS_MANAGER_API: string;
      LAMASSU_TUF_API: string;
      LAMASSU_DEVMANAGER: string;
      LAMASSU_ALERTS: string;
      CLOUD_CONNECTORS: string[];
      INFO: any
    };
  }
}

root.render(
    <FluentProvider theme={webLightTheme} style={{ height: "100%" }}>
        <ThemeProviderWrapper>
            <AuthProvider
                authority={window._env_.AUTH_OIDC_AUTHORITY}
                client_id={window._env_.AUTH_OIDC_CLIENT_ID}
                redirect_uri={window.location.href}
                post_logout_redirect_uri={`${window.location.href}`}
                /*
        localStorage persists until explicitly deleted. Changes made are saved and available for all current and future visits to the site.
        sessionStorage, changes are only available per tab. Changes made are saved and available for the current page in that tab until it is closed. Once it is closed, the stored data is deleted.
      */
                userStore={new oidc.WebStorageStateStore({ store: window.localStorage })}
            >
                <Router>
                    <SnackbarProvider maxSnack={3}>
                        <App />
                    </SnackbarProvider>
                </Router>
            </AuthProvider>
        </ThemeProviderWrapper>
    </FluentProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
