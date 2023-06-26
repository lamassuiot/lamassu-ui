import { apiRequest } from "ducks/services/api";

export const sendRequestToAZURE = async (payload: any) => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CA_API + "/v1/pki"
    });
};
