import { loginKeycloak, logoutKeycloak, getTokenKeycloak, isAuthenticatedKeycloak, getEmailKeycloak } from "./keycloak";
import { loginCognito, logoutCognito, getTokenCognito, isAuthenticatedCognito, getEmailCognito } from "./cognito";

const authProvider = window._env_.AUTH.COGNITO.ENABLED ? "cognito" : "keycloak";

class AuthService {
    async login (): Promise<void> {
        if (authProvider === "keycloak") {
            await loginKeycloak();
        } else if (authProvider === "cognito") {
            loginCognito();
        }
    }

    async logout (): Promise<void> {
        if (authProvider === "keycloak") {
            await logoutKeycloak();
        } else if (authProvider === "cognito") {
            logoutCognito();
        }
    }

    getToken (): string | null {
        if (authProvider === "keycloak") {
            return getTokenKeycloak();
        } else if (authProvider === "cognito") {
            return getTokenCognito();
        }
        return null;
    }

    async isAuthenticated (): Promise<boolean> {
        if (authProvider === "keycloak") {
            return await isAuthenticatedKeycloak();
        } else if (authProvider === "cognito") {
            return await isAuthenticatedCognito();
        }
        return false;
    }

    getEmail (): string {
        if (authProvider === "keycloak") {
            return getEmailKeycloak();
        } else if (authProvider === "cognito") {
            return getEmailCognito();
        }
        return "";
    }
}

export default new AuthService();
