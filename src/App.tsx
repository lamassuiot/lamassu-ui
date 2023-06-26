import { Provider } from "react-redux";
import { store } from "ducks";
import { DashboardLayout } from "views/DashboardLayout";
import { AuthProvider } from "react-oidc-context";
import * as oidc from "oidc-client-ts";

export const App = () => {
    return (
        <AuthProvider
            authority={window._env_.AUTH_OIDC_AUTHORITY}
            client_id={window._env_.AUTH_OIDC_CLIENT_ID}
            redirect_uri={window.location.origin}
            post_logout_redirect_uri={`${window.location.origin}/loggedout`}
            /*
                localStorage persists until explicitly deleted. Changes made are saved and available for all current and future visits to the site.
                sessionStorage, changes are only available per tab. Changes made are saved and available for the current page in that tab until it is closed. Once it is closed, the stored data is deleted.
            */
            userStore={new oidc.WebStorageStateStore({ store: window.localStorage })}
            {
                ...window._env_.AUTH_COGNITO_ENABLED && {
                    /** Can be used to seed or add additional values to the results of the discovery request */
                    metadataSeed: {
                        end_session_endpoint: `${window._env_.AUTH_COGNITO_HOSTED_UI_DOMAIN}/logout?client_id=${window._env_.AUTH_OIDC_CLIENT_ID}&logout_uri=${window.location.origin}/loggedout`
                    }
                }
            }
        >
            <Provider store={store}>
                <DashboardLayout />
            </Provider>
        </AuthProvider>
    );
};
