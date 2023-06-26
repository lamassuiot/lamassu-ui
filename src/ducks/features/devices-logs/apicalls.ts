import { apiRequest } from "ducks/services/api";

export const getDeviceLogs = async (deviceID: string/*, limit: number, offset: number, sortMode: "asc" | "desc", sortField: string, filterQuery: Array<string> */): Promise<any> => {
    const url = window._env_.LAMASSU_DEVMANAGER + `/v1/devices/${deviceID}/logs`;/* ?sort_by=${sortField}.${sortMode}&limit=${limit}&offset=${offset}`; */
    // if (filterQuery.length > 0) {
    //     filterQuery.forEach(filter => {
    //         url = url + `&filter=${filter}`;
    //     });
    // }

    return apiRequest({
        method: "GET",
        url: url
    });
};
