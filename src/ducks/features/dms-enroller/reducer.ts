/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { DMS, DMSManagerInfo } from "./models";
import { ActionStatus, ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { dmsStatusToColor } from "./utils";
import { keyStrengthToColor } from "../cas/utils";

export interface DeviceManufacturingSystemStatus {
    info: DMSManagerInfo
    status: ActionStatus
    list: Array<DMS>,
    totalDMSs: number,
    privateKey: string | undefined
}

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
    list: [],
    totalDMSs: 0,
    privateKey: undefined
};

export const dmsReducer = createReducer<DeviceManufacturingSystemStatus, RootAction>(initialState)
    .handleAction(actions.dmsActions.getInfoAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })
    .handleAction(actions.dmsActions.getInfoAction.success, (state, action) => {
        return { ...state, info: action.payload, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })
    .handleAction(actions.dmsActions.getInfoAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.dmsActions.getDMSAction.success, (state, action) => {
        let dms: DMS = action.payload;
        dms.status_color = dmsStatusToColor(dms.status);

        if (!dms.cloud_dms) {
            dms.remote_access_identity.key_metadata.strength_color = keyStrengthToColor(dms.remote_access_identity.key_metadata.strength);
        }

        return { ...state, status: { isLoading: false, status: ORequestStatus.Success, type: ORequestType.Read }, list: [dms], totalDMSs: 0 };
    })

    .handleAction([actions.dmsActions.getDMSListAction.request, actions.dmsActions.getDMSAction.request], (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read }, list: [], totalDMSs: 0 };
    })

    .handleAction([actions.dmsActions.getDMSListAction.failure, actions.dmsActions.getDMSAction.failure], (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.dmsActions.getDMSListAction.success, (state, action) => {
        let dmss: Array<DMS> = action.payload.dmss;
        for (let i = 0; i < dmss.length; i++) {
            dmss[i].status_color = dmsStatusToColor(dmss[i].status);

            if (!dmss[i].cloud_dms) {
                dmss[i].remote_access_identity.key_metadata.strength_color = keyStrengthToColor(dmss[i].remote_access_identity.key_metadata.strength);
            }
        }
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: dmss, totalDMSs: action.payload.total_dmss };
    })

    .handleAction(actions.dmsActions.approveDMSRequestAction.request, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Update } };
    })

    .handleAction(actions.dmsActions.approveDMSRequestAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })
    .handleAction(actions.dmsActions.approveDMSRequestAction.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })

    .handleAction(actions.dmsActions.createDMSWithFormAction.request, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Create } };
    })

    .handleAction(actions.dmsActions.createDMSWithFormAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })
    .handleAction(actions.dmsActions.createDMSWithFormAction.success, (state, action) => {
        console.log(action);

        return { ...state, privateKey: action.payload.private_key, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    });

const getSelector = (state: RootState): DeviceManufacturingSystemStatus => state.dmss;

export const getInfo = (state: RootState): DMSManagerInfo => {
    const caReducer = getSelector(state);
    return caReducer.info;
};

export const getTotalDMSs = (state: RootState): number => {
    const reducer = getSelector(state);
    return reducer.totalDMSs;
};

export const getDMSs = (state: RootState): Array<DMS> => {
    const reducer = getSelector(state);
    return reducer.list;
};

export const getDMS = (state: RootState, name: string): DMS | undefined => {
    const reducer = getSelector(state);
    const filteredList = reducer.list.filter((dms: DMS) => dms.name === name);
    if (filteredList.length === 1) {
        return filteredList[0];
    }
    return undefined;
};

export const getRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};

export const getLastCreatedDMSPrivateKey = (state: RootState): string | undefined => {
    const reducer = getSelector(state);
    return reducer.privateKey;
};
