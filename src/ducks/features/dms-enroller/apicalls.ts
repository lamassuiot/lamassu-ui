import { apiRequest } from "ducks/services/api";
import { DMSStatus } from "./models";

export const getInfo = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/info"
    });
};

export const getDMSList = async (limit: number, offset: number, sortMode: "asc" | "desc", sortField: string, filterQuery: Array<string>): Promise<any> => {
    let url = window._env_.LAMASSU_DMS_MANAGER_API + "/v1/?" + `sort=${sortField}.${sortMode}&limit=${limit}&offset=${offset}`;
    filterQuery.forEach(filter => {
        url += `&filter=${filter}`;
    });
    return apiRequest({
        method: "GET",
        url: url
    });
};
export const getDMS = async (name: string): Promise<any> => {
    const url = window._env_.LAMASSU_DMS_MANAGER_API + `/v1/${name}`;
    return apiRequest({
        method: "GET",
        url: url
    });
};

export const createDMS = async (dmsForm: any): Promise<any> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/v1/",
        data: dmsForm
    });
};

export const updateDMS = async (dmsForm: any): Promise<any> => {
    return apiRequest({
        method: "PUT",
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/v1/",
        data: dmsForm
    });
};

export const updateDMSStatus = async (dmsName: string, status: DMSStatus): Promise<any> => {
    // eslint-disable-next-line prefer-const
    let payload: any = {
        status: status
    };

    return apiRequest({
        method: "PUT",
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/v1/" + dmsName + "/status",
        data: payload
    });
};

export const updateDMSAuthorizedCAs = async (dmsName: string, authorizedCAs: Array<string>): Promise<any> => {
    // eslint-disable-next-line prefer-const
    let payload: any = {
        authorized_cas: authorizedCAs
    };

    return apiRequest({
        method: "PUT",
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/v1/" + dmsName + "/auth",
        data: payload
    });
};

export const getESTCACerts = async (dmsName: string, pemFormat: boolean = false): Promise<any> => {
    return apiRequest({
        method: "GET",
        headers: {
            ...pemFormat && { Accept: "application/x-pem-file" }
        },
        url: window._env_.LAMASSU_DMS_MANAGER_API + "/.well-known/est/" + dmsName + "/cacerts"
    });
};
