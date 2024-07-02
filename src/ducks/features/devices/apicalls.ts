import { APIServiceInfo, ListResponse, QueryParameters, apiRequest, queryParametersToURL } from "ducks/services/api-client";
import { CreateDevicePayload, Device, DeviceStats, Slot } from "./models";

export const getApiInfo = async (): Promise<APIServiceInfo> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_DEVMANAGER}/health`
    }) as Promise<APIServiceInfo>;
};

export const getStats = async (): Promise<DeviceStats> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_DEVMANAGER + "/v1/stats"
    }) as Promise<DeviceStats>;
};

export const getDevices = async (params?: QueryParameters): Promise<ListResponse<Device>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_DEVMANAGER}/v1/devices${queryParametersToURL(params)}`
    }) as Promise<ListResponse<Device>>;
};

export const getDeviceByID = async (id: string): Promise<Device> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_DEVMANAGER}/v1/devices/${id}`
    }) as Promise<Device>;
};

export const createDevice = async (payload: CreateDevicePayload): Promise<ListResponse<Device>> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_DEVMANAGER}/v1/devices`,
        data: payload
    }) as Promise<ListResponse<Device>>;
};

export const updateDeviceMetadata = async (id: string, meta: { [key: string]: any }): Promise<Device> => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_DEVMANAGER}/v1/devices/${id}/metadata`,
        data: {
            metadata: meta
        }
    }) as Promise<Device>;
};

export const updateDeviceIdentitySlot = async (id: string, idSlot: Slot<string>): Promise<Device> => {
    return apiRequest({
        method: "PUT",
        url: `${window._env_.LAMASSU_DEVMANAGER}/v1/devices/${id}/idslot`,
        data: idSlot
    }) as Promise<Device>;
};

export const decommissionDevice = async (id: string): Promise<Device> => {
    return apiRequest({
        method: "DELETE",
        url: `${window._env_.LAMASSU_DEVMANAGER}/v1/devices/${id}/decommission`
    }) as Promise<Device>;
};
