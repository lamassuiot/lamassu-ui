import { apiRequest } from "ducks/services/api";

export const getInfo = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.REACT_APP_LAMASSU_ALERTS + "/info"
    });
};

export const getEvents = async (): Promise<any> => {
    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/lastevents";
    return apiRequest({
        method: "GET",
        url: url
    });
};

export const getSubscriptions = async (): Promise<any> => {
    const token = localStorage.getItem("access_token");
    const userID = token;
    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/subscriptions/" + userID;

    return apiRequest({
        method: "GET",
        url: url
    });
};

export const subscribe = async (eventType: string, channel: any, conditions: Array<string>): Promise<any> => {
    const token = localStorage.getItem("access_token");
    const userID = token;
    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/subscribe";

    return apiRequest({
        method: "POST",
        url: url,
        data: {
            event_type: eventType,
            user_id: userID,
            channel: channel,
            conditions: conditions
        }
    });
};

export const unsubscribe = async (subscriptionID: string): Promise<any> => {
    const token = localStorage.getItem("access_token");
    const userID = token;

    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/unsubscribe";
    return apiRequest({
        method: "POST",
        url: url,
        data: {
            user_id: userID,
            subscription_id: subscriptionID
        }
    });
};
