import { apiRequest } from "ducks/services/api";
import { getSub } from "ducks/services/api/token";

export const getInfo = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/info"
    });
};

export const getCloudConnectors = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/v1/connectors"
    });
};

export const synchronizeCloudConnectors = async (connectorID: string, caName: string): Promise<any> => {
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/v1/connectors/synchronize",
        data: {
            connector_id: connectorID,
            ca_name: caName
        }
    });
};

export const fireEvent = async (eventType: string, eventData: any): Promise<any> => {
    const now = new Date();
    const event = {
        specversion: "1.0",
        id: now,
        source: "lamassu-ui-" + getSub(),
        type: eventType,
        datacontenttype: "application/json",
        time: now,
        data: eventData
    };
    return apiRequest({
        method: "POST",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/v1/event",
        data: event
    });
};

export const updateConfiguration = async (connectorID: string, configuration: any): Promise<any> => {
    return apiRequest({
        method: "PUT",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/v1/connectors/" + connectorID + "/config",
        data: {
            configuration: configuration
        }
    });
};

export const getDeviceConfig = async (connectorID: string, deviceID: string): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/v1/connectors/" + connectorID + "/devices/" + deviceID
    });
};

export const updateDeviceCertificateStatus = async (connectorID: string, deviceID: string, caName: string, serialNumber: string, status: string): Promise<any> => {
    return apiRequest({
        method: "PUT",
        url: window._env_.LAMASSU_CLOUD_PROXY_API + "/v1/connectors/" + connectorID + "/devices/" + deviceID + "/certificate",
        data: {
            status: status,
            serial_number: serialNumber,
            ca_name: caName
        }
    });
};
