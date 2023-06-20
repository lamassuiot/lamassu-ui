import { Provider } from "react-redux";
import { store } from "ducks";

import { DashboardLayout } from "views/DashboardLayout";
import { AuthProvider } from "oidc-react";

export const App = () => {
    return (
        <AuthProvider
            authority="https://dev.lamassu.zpd.ikerlan.es/auth/realms/lms"
            clientId="frontend"
            redirectUri={window.location.origin}
            postLogoutRedirectUri={window.location.origin}
            autoSignIn={true}>
            <Provider store={store}>
                <DashboardLayout />
            </Provider>
        </AuthProvider>
    );
};
