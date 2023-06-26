import { createAsyncAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { AlertsInfo, CloudEvent, UserSubscription } from "./models";

export const actionTypes = {
    GET_INFO_ALERTS_API: "GET_INFO_ALERTS_API",
    GET_EVENTS: "GET_EVENTS",
    GET_SUBSCRIPTIONS: "GET_SUBSCRIPTIONS",
    SUBSCRIBE: "SUBSCRIBE",
    UNSUBSCRIBE: "UNSUBSCRIBE"
};

export type SubscribeAction = {
    eventType: string,
    channels: any[],
    conditions: string[],
    condition_type: string,
}
export type UnsubscribeAction = {
    SubscriptionID: string
}

export const getInfoAction = createAsyncAction(
    [actionTypes.GET_INFO_ALERTS_API, () => { }],
    [success(actionTypes.GET_INFO_ALERTS_API), (req: AlertsInfo) => req],
    [failed(actionTypes.GET_INFO_ALERTS_API), (req: Error) => req]
)();

export const getEvents = createAsyncAction(
    [actionTypes.GET_EVENTS, () => { }],
    [success(actionTypes.GET_EVENTS), (req: Array<CloudEvent>) => { return req; }],
    [failed(actionTypes.GET_EVENTS), (req: Error) => req]
)();

export const getSubscriptions = createAsyncAction(
    [actionTypes.GET_SUBSCRIPTIONS, () => { }],
    [success(actionTypes.GET_SUBSCRIPTIONS), (req: UserSubscription) => { return req; }],
    [failed(actionTypes.GET_SUBSCRIPTIONS), (req: Error) => req]
)();

export const subscribeAction = createAsyncAction(
    [actionTypes.SUBSCRIBE, (req: SubscribeAction) => req],
    [success(actionTypes.SUBSCRIBE), (req: any) => { return req; }],
    [failed(actionTypes.SUBSCRIBE), (req: Error) => req]
)();

export const unsubscribeAction = createAsyncAction(
    [actionTypes.UNSUBSCRIBE, (req: UnsubscribeAction) => req],
    [success(actionTypes.UNSUBSCRIBE), (req: any) => { return req; }],
    [failed(actionTypes.UNSUBSCRIBE), (req: Error) => req]
)();
