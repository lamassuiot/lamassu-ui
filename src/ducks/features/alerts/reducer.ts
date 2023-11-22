/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { Event, Subscription } from "./models";

export interface AlertsState {
    eventsStatus: ActionStatus
    eventList: Array<Event>
    subscriptionsStatus: ActionStatus
    subscriptionsList: Array<Subscription>
}

const initialState = {
    eventsStatus: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None,
        err: ""
    },
    eventList: [],
    subscriptionsStatus: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None,
        err: ""
    },
    subscriptionsList: []
};

export const alertsReducer = createReducer<AlertsState, RootAction>(initialState)
    .handleAction(actions.alertsActions.getEvents.request, (state, action) => {
        return { ...state, eventsStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, eventList: [] };
    })

    .handleAction(actions.alertsActions.getEvents.failure, (state, action) => {
        return { ...state, eventsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.alertsActions.getEvents.success, (state, action) => {
        return { ...state, eventsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Success }, eventList: action.payload };
    })

    .handleAction(actions.alertsActions.getSubscriptions.request, (state, action) => {
        return { ...state, subscriptionsStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, subscriptionsList: [] };
    })

    .handleAction(actions.alertsActions.getSubscriptions.failure, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.alertsActions.getSubscriptions.success, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Success }, subscriptionsList: action.payload };
    });

const getSelector = (state: RootState): AlertsState => state.alerts;

export const getEvents = (state: RootState): Array<Event> => {
    const reducer = getSelector(state);
    return reducer.eventList;
};

export const getEventsRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.eventsStatus;
};

export const getSubscriptions = (state: RootState): Array<Subscription> => {
    const reducer = getSelector(state);
    return reducer.subscriptionsList;
};

export const getSubscriptionsRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.subscriptionsStatus;
};
