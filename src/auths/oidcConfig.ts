import { UserManager, WebStorageStateStore } from "oidc-client-ts";

const env = window._env_;

export const isAuthEnabled = env.AUTH.ENABLED;

export const isCognitoAuth = (isAuthEnabled && env.AUTH.COGNITO.ENABLED) || false;

export const cognitoData = {
    domain: env.AUTH.COGNITO.HOSTED_UI_DOMAIN,
    clientId: env.AUTH.OIDC.CLIENT_ID
};

export const oidcConfig = {
    authority: env.AUTH.OIDC.AUTHORITY,
    client_id: env.AUTH.OIDC.CLIENT_ID,
    redirect_uri: window.location.origin + "/callback",
    response_type: "code",
    scope: "openid",
    post_logout_redirect_uri: window.location.origin + "/",
    userStore: new WebStorageStateStore({ store: window.localStorage })
};

export const userManager = new UserManager(oidcConfig);
