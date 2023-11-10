/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { ActionStatus, RequestStatus, RequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { Device } from "./models";

export interface DevicesState {
    status: ActionStatus
    list: Array<Device>
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

export const devicesReducer = createReducer<DevicesState, RootAction>(initialState)
    .handleAction(actions.devicesActions.getDevices.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, list: [] };
    })

    .handleAction(actions.devicesActions.getDevices.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.devicesActions.getDevices.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Success }, list: action.payload.list, next: action.payload.next };
    })
    .handleAction(actions.devicesActions.getDeviceByID.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: RequestStatus.Pending, type: RequestType.Read, err: "" }, list: [] };
    })

    .handleAction(actions.devicesActions.getDeviceByID.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Failed } };
    })

    .handleAction(actions.devicesActions.getDeviceByID.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: RequestStatus.Success }, list: [action.payload] };
    });

const getSelector = (state: RootState): DevicesState => state.devices;

export const getNextBookmark = (state: RootState): string => {
    const reducer = getSelector(state);
    return reducer.next;
};

export const getDevices = (state: RootState): Array<Device> => {
    const reducer = getSelector(state);
    return reducer.list;
};

export const getDevice = (state: RootState, id: string): Device | undefined => {
    const reducer = getSelector(state);
    return reducer.list.find((dev: Device) => dev.id === id);
};

export const getDeviceListRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};
