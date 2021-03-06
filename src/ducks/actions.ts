import { ActionType } from "typesafe-actions";

import * as caActions from "./features/cas/actions";
import * as cloudProxyActions from "./features/cloud-proxy/actions";
import * as devicesActions from "./features/devices/actions";
import * as devicesLogsActions from "./features/devices-logs/actions";
import * as dmsActions from "./features/dms-enroller/actions";
export const actions = {
    caActions,
    cloudProxyActions,
    devicesActions,
    devicesLogsActions,
    dmsActions
};

export type CAsActions = ActionType<typeof caActions>;
export type CloudProxyActions = ActionType<typeof cloudProxyActions>;
export type DevicesActions = ActionType<typeof devicesActions>;
export type DevicesLogsActions = ActionType<typeof devicesLogsActions>;
export type DMSActions = ActionType<typeof dmsActions>;

export type RootAction =
    | CAsActions
    | CloudProxyActions
    | DevicesActions
    | DevicesLogsActions
    | DMSActions
