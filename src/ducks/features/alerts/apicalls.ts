import { apiRequest } from "ducks/services/api";
import { getSub } from "ducks/services/api/token";

export const getInfo = async (): Promise<any> => {
    return apiRequest({
        method: "GET",
        url: window._env_.LAMASSU_ALERTS + "/info"
    });
};

export const getEvents = async (): Promise<any> => {
    const url = window._env_.LAMASSU_ALERTS + "/v1/lastevents";
    return apiRequest({
        method: "GET",
        url: url
    });
};

export const getSubscriptions = async (): Promise<any> => {
    const url = window._env_.LAMASSU_ALERTS + "/v1/subscriptions/" + getSub();

    return apiRequest({
        method: "GET",
        url: url
    });
};

export const subscribe = async (eventType: string, channel: any, condition_type: string, conditions: Array<string>): Promise<any> => {
    const url = window._env_.LAMASSU_ALERTS + "/v1/subscribe";

    return apiRequest({
        method: "POST",
        url: url,
        data: {
            event_type: eventType,
            user_id: getSub(),
            channel: channel,
            conditions: conditions,
            condition_type: condition_type
        }
    });
};

export const unsubscribe = async (subscriptionID: string): Promise<any> => {
    const url = window._env_.LAMASSU_ALERTS + "/v1/unsubscribe";
    return apiRequest({
        method: "POST",
        url: url,
        data: {
            user_id: getSub(),
            subscription_id: subscriptionID
        }
    });
};
