import { apiRequest } from "ducks/services/api-client";

export const getCRL = async (caID: string): Promise<Blob> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_VA_API + "/crl/" + caID
    }) as Promise<Blob>;
};
