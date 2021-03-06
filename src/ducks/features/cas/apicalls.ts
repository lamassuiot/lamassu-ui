import { apiRequest } from "ducks/services/api";

export const getStats = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.REACT_APP_LAMASSU_CA_API + "/v1/stats"
    });
};

export const getCAs = async (limit: number, offset: number, sortMode: "asc" | "desc", sortField: string, filterQuery: Array<string>): Promise<any> => {
    let url = window._env_.REACT_APP_LAMASSU_CA_API + "/v1/pki?"/* + `sort_by=${sortField}.${sortMode}&` */ + `limit=${limit}&offset=${offset}`;
    filterQuery.forEach(filter => {
        url += `&filter=${filter}`;
    });
    return apiRequest({
        method: "GET",
        url: url
    });
};

export const getIssuedCerts = async (caName: string, offset: number, page: number) => {
    const idFilter = "";
    let url = window._env_.REACT_APP_LAMASSU_CA_API + "/v1/pki/" + caName + `/issued?&page={${page},${offset}}`;
    if (idFilter !== "") {
        url = url + `&filter={and(contains(id,${idFilter}))}`;
    }
    return apiRequest({
        method: "GET",
        url: url
    });
};

type CreateCA = {
    subject: {
        country: string,
        state: string,
        locality: string,
        organization: string,
        organization_unit: string,
        common_name: string
    },
    key_metadata: {
        type: string,
        bits: number
    },
    ca_ttl: number,
    enroller_ttl: number

}

export const createCA = async (caName: string, payload: CreateCA) => {
    return apiRequest({
        method: "POST",
        url: window._env_.REACT_APP_LAMASSU_CA_API + "/v1/pki/" + caName,
        data: payload
    });
};

export const importCA = async (caName: string, enrollerTTL: number, certificateB64: string, privatekeyB64: string) => {
    return apiRequest({
        method: "POST",
        url: window._env_.REACT_APP_LAMASSU_CA_API + "/v1/pki/import/" + caName,
        data: {
            enroller_ttl: enrollerTTL,
            crt: certificateB64,
            private_key: privatekeyB64
        }
    });
};

export const revokeCA = async (caName: string) => {
    return apiRequest({
        method: "DELETE",
        url: window._env_.REACT_APP_LAMASSU_CA_API + "/v1/pki/" + caName
    });
};

export const revokeCertificate = async (caName: string, serialNumber: string) => {
    return apiRequest({
        method: "DELETE",
        url: window._env_.REACT_APP_LAMASSU_CA_API + "/v1/pki/" + caName + "/cert/" + serialNumber
    });
};
