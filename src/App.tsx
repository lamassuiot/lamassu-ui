import { Provider } from "react-redux";
import { store } from "ducks";

import { DashboardLayout } from "views/DashboardLayout";
import { AuthProvider } from "oidc-react";

export const App = () => {
    return (
        <AuthProvider
            authority="https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_OxnFHF2Am/"
            clientId="55dkpv38sm3f1ivbboi4h7eahr"
            redirectUri={window.location.origin}
            postLogoutRedirectUri={window.location.origin}
            autoSignIn={true}>
            <Provider store={store}>
                <DashboardLayout />
            </Provider>
        </AuthProvider>
    );
};
