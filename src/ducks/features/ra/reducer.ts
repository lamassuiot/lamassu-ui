/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { DMS } from "./models";

export interface DMSsState {
    status: ActionStatus
    list: Array<DMS>
    next: string
}

const initialState = {
    status: {
        isLoading: false,
        status: RequestStatus.Idle,
        type: RequestType.None,
        err: ""
    },
    list: [],
    next: ""
};

export const dmssReducer = createReducer<DMSsState, RootAction>(initialState)
    .handleAction(actions.dmsActions.getDMSs.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, list: [] };
    })

    .handleAction(actions.dmsActions.getDMSs.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.dmsActions.getDMSs.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Success }, list: action.payload.list, next: action.payload.next };
    })

    .handleAction(actions.dmsActions.getDMSByID.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, list: [] };
    })

    .handleAction(actions.dmsActions.getDMSByID.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.dmsActions.getDMSByID.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Success }, list: [action.payload], next: "" };
    });

const getSelector = (state: RootState): DMSsState => state.dmss;

export const getNextBookmark = (state: RootState): string => {
    const reducer = getSelector(state);
    return reducer.next;
};

export const getDMSs = (state: RootState): Array<DMS> => {
    const reducer = getSelector(state);
    return reducer.list;
};

export const getDMS = (state: RootState, id: string): DMS | undefined => {
    const reducer = getSelector(state);
    return reducer.list.find((dev: DMS) => dev.id === id);
};

export const getDMSListRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};
