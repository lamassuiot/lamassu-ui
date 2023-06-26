import { apiRequest } from "ducks/services/api";
import keycloak from "keycloak";

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
    const userID = keycloak.tokenParsed?.sub;
    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/subscriptions/" + userID;

    return apiRequest({
        method: "GET",
        url: url
    });
};

export const subscribe = async (eventType: string, channel: any, condition_type: string, conditions: Array<string>): Promise<any> => {
    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/subscribe";
    const userID = keycloak.tokenParsed?.sub;

    return apiRequest({
        method: "POST",
        url: url,
        data: {
            event_type: eventType,
            user_id: userID,
            channel: channel,
            conditions: conditions,
            condition_type: condition_type
        }
    });
};

export const unsubscribe = async (subscriptionID: string): Promise<any> => {
    const url = window._env_.REACT_APP_LAMASSU_ALERTS + "/v1/unsubscribe";
    const userID = keycloak.tokenParsed?.sub;

    return apiRequest({
        method: "POST",
        url: url,
        data: {
            user_id: userID,
            subscription_id: subscriptionID
        }
    });
};
