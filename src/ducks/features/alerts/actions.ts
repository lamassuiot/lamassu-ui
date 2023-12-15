import { createAction, createAsyncAction } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { Event, Subscription } from "./models";

export const actionTypes = {
    GET_SUBSCRIPTIONS: "GET_SUBSCRIPTIONS",
    GET_EVENTS: "GET_EVENTS",

    SUBSCRIBE_SUCCESS: "SUBSCRIBE_SUCCESS",
    UNSUBSCRIBE_SUCCESS: "UNSUBSCRIBE_SUCCESS"
};

export const getSubscriptions = createAsyncAction(
    actionTypes.GET_SUBSCRIPTIONS,
    success(actionTypes.GET_SUBSCRIPTIONS),
    failed(actionTypes.GET_SUBSCRIPTIONS)
)<string, Array<Subscription>, Error>();

export const getEvents = createAsyncAction(
    actionTypes.GET_EVENTS,
    success(actionTypes.GET_EVENTS),
    failed(actionTypes.GET_EVENTS)
)<any, Array<Event>, Error>();

export const subscribe = createAction(actionTypes.SUBSCRIBE_SUCCESS)();
export const unsubscribe = createAction(actionTypes.UNSUBSCRIBE_SUCCESS)();
