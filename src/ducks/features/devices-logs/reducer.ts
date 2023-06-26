/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { DeviceLog } from "./models";
import { ActionStatus, ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { logTypeToColor } from "./utils";

interface DeviceLogsInfo {
    logs: Array<DeviceLog>;
}

export interface DevicesLogsState {
    status: ActionStatus
    map: Map<String, DeviceLogsInfo>
}

const initialState = {
    status: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    },
    map: new Map<String, DeviceLogsInfo>()
};

export const devicesLogsReducer = createReducer<DevicesLogsState, RootAction>(initialState)
    .handleAction(actions.devicesLogsActions.getDeviceLogs.request, (state, action) => {
        const map = new Map<String, DeviceLogsInfo>();
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read }, map: map };
    })

    .handleAction(actions.devicesLogsActions.getDeviceLogs.success, (state, action) => {
        const currentLogMap = state.map;
        let newLogs = action.payload.logs.map((log: DeviceLog) => { log.log_type_color = logTypeToColor(log.log_type); return log; });
        const slotLogsKeys = Object.keys(action.payload.slot_logs);
        for (const i in slotLogsKeys) {
            const slotLogs = action.payload.slot_logs;
            const coloredLogs: Array<DeviceLog> = slotLogs[slotLogsKeys[i]]!.map((log: DeviceLog) => { log.log_type_color = logTypeToColor(log.log_type); return log; });
            newLogs = newLogs.concat(coloredLogs);
        }
        currentLogMap.set(action.meta.deviceID, { logs: newLogs });
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, map: currentLogMap };
    })

    .handleAction(actions.devicesLogsActions.getDeviceLogs.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    });

const getSelector = (state: RootState): DevicesLogsState => state.devicesLogs;

export const getRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};

export const getLogs = (state: RootState, deviceID: string): Array<DeviceLog> => {
    const reducer = getSelector(state);
    const logs = reducer.map.get(deviceID) !== undefined ? reducer.map.get(deviceID)!.logs : [];
    return logs.sort((a: DeviceLog, b: DeviceLog) => (a.timestamp < b.timestamp) ? 1 : ((b.timestamp < a.timestamp) ? -1 : 0));
};
