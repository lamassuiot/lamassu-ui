import "./index.css";
import { BrowserRouter as Router } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import App from "./App";
import React from "react";
import ReactDOM from "react-dom/client";
import ThemeProviderWrapper from "./theme/ThemeProvider";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import moment from "moment";
import { LoadingProvider } from "components/Spinner/LoadingContext";
import Spinner from "components/Spinner/Spinner";

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
      LAMASSU_DEVMANAGER_API: string;
      LAMASSU_ALERTS_API: string;
      LAMASSU_VA_API: string;
      CLOUD_CONNECTORS: string[];
      INFO: any
    };
  }
}

moment.locale("en");

root.render(
    <FluentProvider theme={webLightTheme} style={{ height: "100%" }}>
        <ThemeProviderWrapper>
            <LoadingProvider>
                <Router>
                    <SnackbarProvider maxSnack={3}>
                        <Spinner />
                        <App />
                    </SnackbarProvider>
                </Router>
            </LoadingProvider>
        </ThemeProviderWrapper>
    </FluentProvider>

);
