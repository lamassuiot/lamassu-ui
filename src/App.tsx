import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";

import { Provider } from "react-redux";
import { store } from "ducks";
import keycloak from "./keycloak";
import { DashboardLayout } from "views/DashboardLayout";

export const App = () => {
    return (
        <ReactKeycloakProvider
            authClient={keycloak}
            initOptions={{
                // silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
                checkLoginIframe: false
            }}
            LoadingComponent={
                <div>Loading: Checking authority service status</div>
            }
            autoRefreshToken={true}
        >
            <Provider store={store}>
                <DashboardLayout />
            </Provider>
        </ReactKeycloakProvider>
    );
};
