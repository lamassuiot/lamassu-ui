import { APIServiceInfo, apiRequest } from "ducks/services/api-client";
import { Event, SubChannel, Subscription, SubscriptionCondition } from "./models";

export const getApiInfo = async (): Promise<APIServiceInfo> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_ALERTS}/health`
    }) as Promise<APIServiceInfo>;
};

export const getEvents = async (): Promise<Array<Event>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_ALERTS}/v1/events/latest`
    }) as Promise<Array<Event>>;
};

export const getSubscriptions = async (userId: string): Promise<Array<Subscription>> => {
    return apiRequest({
        method: "GET",
        url: `${window._env_.LAMASSU_ALERTS}/v1/user/${userId}/subscriptions`
    }) as Promise<Array<Subscription>>;
};

export const subscribe = async (userId: string, eventType: string, conditions: SubscriptionCondition[], channel: SubChannel): Promise<Subscription> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_ALERTS}/v1/user/${userId}/subscribe`,
        data: {
            event_type: eventType,
            conditions,
            channel
        }
    }) as Promise<Subscription>;
};

export const unsubscribe = async (userId: string, subId: string): Promise<Subscription> => {
    return apiRequest({
        method: "POST",
        url: `${window._env_.LAMASSU_ALERTS}/v1/user/${userId}/unsubscribe/${subId}`
    }) as Promise<Subscription>;
};
