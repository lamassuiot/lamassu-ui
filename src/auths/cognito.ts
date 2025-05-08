const cognitoDomain = window._env_.AUTH.COGNITO.HOSTED_UI_DOMAIN;
const clientId = window._env_.AUTH.OIDC.CLIENT_ID;
const redirectUri = window.location.origin;

export const loginCognito = (): void => {
    window.location.href = `${cognitoDomain}/login?client_id=${clientId}&response_type=token&scope=openid&redirect_uri=${redirectUri}`;
};

export const logoutCognito = (): void => {
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${redirectUri}`;
};

export const getTokenCognito = (): string | null => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get("id_token");
};

export const isAuthenticatedCognito = async (): Promise<boolean> => {
    return !!getTokenCognito();
};

export const getEmailCognito = (): string => {
    const idToken = getTokenCognito();
    if (idToken) {
        const decodedToken = JSON.parse(atob(idToken.split(".")[1]));
        return decodedToken.email || "";
    }
    return "";
};
