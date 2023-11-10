import { apiRequest } from "ducks/services/api";

export const getESTCACerts = async (dmsName: string, pemFormat: boolean = false): Promise<any> => {
    return apiRequest({
        method: "GET",
        headers: {
            ...pemFormat && { Accept: "application/x-pem-file" }
        },
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/.well-known/est/" + dmsName + "/cacerts"
    });
};
