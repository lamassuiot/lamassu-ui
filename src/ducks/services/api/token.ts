import { IdTokenClaims, User } from "oidc-client-ts";

export const getUser = (): User | null => {
    const storageString = `oidc.user:${window._env_.AUTH_OIDC_AUTHORITY}:${window._env_.AUTH_OIDC_CLIENT_ID}`;
    const oidcStorage = localStorage.getItem(storageString);
    if (!oidcStorage) {
        return null;
    }

    const user = User.fromStorageString(oidcStorage);
    return user;
};

export const getToken = (): string | null => {
    const user = getUser();
    if (!user) {
        return null;
    }

    return user.access_token;
};

export const getProfile = (): IdTokenClaims| null => {
    const user = getUser();
    if (!user) {
        return null;
    }
    return user.profile;
};

export const getSub = (): string| null => {
    const profile = getProfile();
    if (!profile) {
        return null;
    }
    return profile.sub;
};

export const getEmail = ():string | undefined| null => {
    const profile = getProfile();
    if (!profile) {
        return null;
    }

    return profile.email;
};
