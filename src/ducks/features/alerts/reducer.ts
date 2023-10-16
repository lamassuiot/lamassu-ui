/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { AlertsInfo, CloudEvent, UserSubscription } from "./models";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";

export interface AlertsState {
    events: Array<CloudEvent>
    eventsStatus: ActionStatus
    subscription: UserSubscription
    subscriptionsStatus: ActionStatus
    info: AlertsInfo
}

const initialState = {
    info: {
        build_version: "",
        build_time: ""
    },
    eventsStatus: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None
    },
    subscriptionsStatus: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None
    },
    events: [],
    subscription: {
        email: "",
        subscriptions: []
    }
};

export const alertsReducer = createReducer<AlertsState, RootAction>(initialState)
    .handleAction(actions.alertsActions.getInfoAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read } };
    })
    .handleAction(actions.alertsActions.getInfoAction.success, (state, action) => {
        return { ...state, info: action.payload, eventsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Success } };
    })
    .handleAction(actions.alertsActions.getInfoAction.failure, (state, action) => {
        return { ...state, eventsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.alertsActions.getEvents.request, (state, action) => {
        return { ...state, eventsStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read }, events: [] };
    })

    .handleAction(actions.alertsActions.getEvents.success, (state, action) => {
        return { ...state, eventsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Success }, events: action.payload };
    })

    .handleAction(actions.alertsActions.getEvents.failure, (state, action) => {
        return { ...state, eventsStatus: { ...state.eventsStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.alertsActions.getSubscriptions.request, (state, action) => {
        return { ...state, subscriptionsStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read }, subscription: { email: "", subscriptions: [] } };
    })

    .handleAction(actions.alertsActions.getSubscriptions.success, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.subscriptionsStatus, isLoading: false, status: RequestStatus.Success }, subscription: action.payload };
    })

    .handleAction(actions.alertsActions.getSubscriptions.failure, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.subscriptionsStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.alertsActions.subscribeAction.request, (state, action) => {
        return { ...state, subscriptionsStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read } };
    })

    .handleAction(actions.alertsActions.subscribeAction.success, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.subscriptionsStatus, isLoading: false, status: RequestStatus.Success } };
    })

    .handleAction(actions.alertsActions.subscribeAction.failure, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.subscriptionsStatus, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.alertsActions.unsubscribeAction.request, (state, action) => {
        return { ...state, subscriptionsStatus: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read } };
    })

    .handleAction(actions.alertsActions.unsubscribeAction.success, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.subscriptionsStatus, isLoading: false, status: RequestStatus.Success } };
    })

    .handleAction(actions.alertsActions.unsubscribeAction.failure, (state, action) => {
        return { ...state, subscriptionsStatus: { ...state.subscriptionsStatus, isLoading: false, status: RequestStatus.Failed } };
    });

const getSelector = (state: RootState): AlertsState => state.alerts;

export const getInfo = (state: RootState): AlertsInfo => {
    const caReducer = getSelector(state);
    return caReducer.info;
};

export const getEvents = (state: RootState): Array<CloudEvent> => {
    const reducer = getSelector(state);
    return reducer.events;
};

export const getEventRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.eventsStatus;
};

export const getSubscriptions = (state: RootState): UserSubscription => {
    const reducer = getSelector(state);
    return reducer.subscription;
};

export const getSubscriptionRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.subscriptionsStatus;
};
