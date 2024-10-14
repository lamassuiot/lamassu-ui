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
import moment from "moment";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

declare global {
  interface Window {
    _env_: {
      AUTH: {
        ENABLED: boolean;
        OIDC: {
          AUTHORITY: string;
          CLIENT_ID: string;
        },
        COGNITO: {
          ENABLED: boolean;
          HOSTED_UI_DOMAIN: string
        }
      }
      LAMASSU_CA_API: string;
      LAMASSU_DMS_MANAGER_API: string;
      LAMASSU_TUF_API: string;
      LAMASSU_DEVMANAGER: string;
      LAMASSU_ALERTS: string;
      LAMASSU_VA: string;
      CLOUD_CONNECTORS: string[];
      INFO: any
    };
  }
}

moment.locale("en");

root.render(
    <FluentProvider theme={webLightTheme} style={{ height: "100%" }}>
        <ThemeProviderWrapper>
            <AuthProvider
                authority={window._env_.AUTH.OIDC.AUTHORITY}
                client_id={window._env_.AUTH.OIDC.CLIENT_ID}
                redirect_uri={window.location.origin}
                post_logout_redirect_uri={`${window.location.origin}`}
                {
                    ...window._env_.AUTH.ENABLED && window._env_.AUTH.COGNITO.ENABLED && {
                        /** Can be used to seed or add additional values to the results of the discovery request */
                        metadataSeed: {
                            end_session_endpoint: `${window._env_.AUTH.COGNITO.HOSTED_UI_DOMAIN}/logout?client_id=${window._env_.AUTH.OIDC.CLIENT_ID}&logout_uri=${window.location.origin}/loggedout`
                        }
                    }
                }
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
