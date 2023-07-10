/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { Device, DeviceManagerInfo, ODeviceStatus, OSlotCertificateStatus } from "./models";
import { ActionStatus, ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { keyStrengthToColor } from "../cas/utils";
import { deviceStatusToColor, slotCertificateStatusToColor } from "./utils";

export interface DevicesState {
    info: DeviceManagerInfo
    status: ActionStatus
    stats: {
        devices_stats: Map<string, number>
        slot_stats: Map<string, number>
        scan_date: Date
    }
    list: Array<Device>
    totalDevices: number
    historyCertsStatus: ActionStatus

}

let baseDeviceStats = new Map<string, number>();
Object.keys(ODeviceStatus).forEach(key => {
    baseDeviceStats.set(key, 0);
});

let baseSlotStats = new Map<string, number>();
Object.keys(OSlotCertificateStatus).forEach(key => {
    baseSlotStats.set(key, 0);
});

const initialState = {
    info: {
        build_version: "",
        build_time: ""
    },
    status: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    },
    stats: {
        devices_stats: baseDeviceStats,
        slot_stats: baseSlotStats,
        scan_date: new Date()
    },
    list: [],
    totalDevices: 0,
    historyCertsStatus: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    }
};

export const devicesReducer = createReducer<DevicesState, RootAction>(initialState)
    .handleAction(actions.devicesActions.getInfoAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })
    .handleAction(actions.devicesActions.getInfoAction.success, (state, action) => {
        return { ...state, info: action.payload, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })
    .handleAction(actions.devicesActions.getInfoAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.devicesActions.getDevicesAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read }, list: [] };
    })

    .handleAction(actions.devicesActions.getStatsAction.success, (state, action) => {
        let baseDeviceStats = new Map<string, number>();
        Object.keys(ODeviceStatus).forEach(key => {
            baseDeviceStats.set(key, 0);
        });

        let baseSlotStats = new Map<string, number>();
        Object.keys(OSlotCertificateStatus).forEach(key => {
            baseSlotStats.set(key, 0);
        });

        baseDeviceStats.forEach((value, key) => {
            if (action.payload.stats.devices_stats[key] !== undefined) {
                baseDeviceStats.set(key, action.payload.stats.devices_stats[key]);
            }
        });

        return {
            ...state,
            stats: {
                devices_stats: baseDeviceStats,
                slot_stats: action.payload.stats.slots_stats,
                scan_date: action.payload.scan_date
            }
        };
    })

    .handleAction(actions.devicesActions.getDevicesAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.devicesActions.getDevicesAction.success, (state, action) => {
        let devices: Array<Device> = action.payload.devices;

        for (let i = 0; i < devices.length; i++) {
            devices[i] = parseDevice(devices[i]);
        }
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: devices, totalDevices: action.payload.total_devices };
    })

    .handleAction(actions.devicesActions.getDeviceByIDAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })

    .handleAction(actions.devicesActions.getDeviceByIDAction.success, (state, action) => {
        let newDevice: Device = new Device(action.payload);
        let devices: Array<Device> = state.list;

        newDevice = parseDevice(newDevice);

        const index = state.list.map(device => device.id).indexOf(newDevice.id);
        if (index === -1) {
            devices.push(newDevice);
        } else {
            devices[index] = newDevice;
        }

        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: devices };
    })

    .handleAction(actions.devicesActions.getDeviceByIDAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.devicesActions.revokeActiveDeviceCertificateAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Delete } };
    })
    .handleAction(actions.devicesActions.revokeActiveDeviceCertificateAction.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Success } };
    })
    .handleAction(actions.devicesActions.revokeActiveDeviceCertificateAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Failed } };
    })
    .handleAction(actions.devicesActions.decommissionDeviceAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Delete } };
    })
    .handleAction(actions.devicesActions.decommissionDeviceAction.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Success } };
    })
    .handleAction(actions.devicesActions.decommissionDeviceAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Failed } };
    })
    .handleAction(actions.devicesActions.registerDeviceAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Create } };
    })
    .handleAction(actions.devicesActions.registerDeviceAction.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Success } };
    })
    .handleAction(actions.devicesActions.registerDeviceAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Failed } };
    });

const getSelector = (state: RootState): DevicesState => state.devices;

export const getInfo = (state: RootState): DeviceManagerInfo => {
    const caReducer = getSelector(state);
    return caReducer.info;
};

export const getDevices = (state: RootState): Array<Device> => {
    const reducer = getSelector(state);
    return reducer.list;
};

export const getDevicesStats = (state: RootState) => {
    const reducer = getSelector(state);
    return reducer.stats;
};
export const getTotalDevices = (state: RootState): number => {
    const reducer = getSelector(state);
    return reducer.totalDevices;
};

export const getDevice = (state: RootState, id: string): Device | undefined => {
    const reducer = getSelector(state);
    const filteredList = reducer.list.filter((ca: Device) => ca.id === id);
    if (filteredList.length === 1) {
        return filteredList[0];
    }
    return undefined;
};

export const getRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};

export const getHistoricalCertRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.historyCertsStatus;
};

// ----------------------------------------------------------------------------------------

const parseDevice = (newDevice: Device) => {
    newDevice.status_color = deviceStatusToColor(newDevice.status);

    for (let i = 0; i < newDevice.slots.length; i++) {
        newDevice.slots[i].active_certificate.status_color = slotCertificateStatusToColor(newDevice.slots[i].active_certificate.status);
        newDevice.slots[i].active_certificate.key_metadata.strength_color = keyStrengthToColor(newDevice.slots[i].active_certificate.key_metadata.strength);

        for (let j = 0; j < newDevice.slots[i].archive_certificates.length; j++) {
            newDevice.slots[i].archive_certificates[j].status_color = slotCertificateStatusToColor(newDevice.slots[i].archive_certificates[j].status);
            newDevice.slots[i].archive_certificates[j].key_metadata.strength_color = keyStrengthToColor(newDevice.slots[i].archive_certificates[j].key_metadata.strength);
        }
    }
    return new Device({ ...newDevice });
};
