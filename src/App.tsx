import { Provider } from "react-redux";
import { store } from "ducks";
import { DashboardLayout } from "views/DashboardLayout";
import { AuthProvider } from "react-oidc-context";
import * as oidc from "oidc-client-ts";
console.log(oidc.Version);
oidc.Log.setLevel(oidc.Log.DEBUG);
oidc.Log.setLogger(console);

export const App = () => {
    return (
        <AuthProvider
            authority="https://cognito-idp.eu-west-1.amazonaws.com/eu-west-1_OxnFHF2Am/"
            client_id="55dkpv38sm3f1ivbboi4h7eahr"
            redirect_uri={window.location.origin}
            post_logout_redirect_uri={window.location.origin}
            userStore={new oidc.WebStorageStateStore({ store: window.localStorage })}
        >
            <Provider store={store}>
                <DashboardLayout />
            </Provider>
        </AuthProvider>
    );
};
