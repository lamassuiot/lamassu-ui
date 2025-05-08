import Keycloak from "keycloak-js";

// @ts-ignore
const keycloak = new Keycloak({
    url: window._env_.AUTH.OIDC.AUTHORITY.split("/realms")[0] + "/",
    realm: window._env_.AUTH.OIDC.AUTHORITY.split("/realms/")[1],
    clientId: window._env_.AUTH.OIDC.CLIENT_ID
});

let isInitialized = false;

export const initKeycloak = async (): Promise<boolean> => {
    if (!isInitialized) {
        try {
            const authenticated = await keycloak.init({ onLoad: "login-required", checkLoginIframe: false });
            isInitialized = true;
            return authenticated;
        } catch (error) {
            console.error("Error initializing Keycloak:", error);
            return false;
        }
    }
    return keycloak.authenticated || false;
};

export const loginKeycloak = async (): Promise<void> => {
    const authenticated = await initKeycloak();
    if (!authenticated) {
        await keycloak.login();
    }
};

export const logoutKeycloak = async (): Promise<void> => {
    await keycloak.logout();
    isInitialized = false;
};

export const getTokenKeycloak = (): string | null => {
    return keycloak.token || null;
};

export const isAuthenticatedKeycloak = async (): Promise<boolean> => {
    return await initKeycloak();
};

export const getEmailKeycloak = (): string => {
    const token = getTokenKeycloak();
    if (token) {
        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        return decodedToken.email || "";
    }
    return "";
};
