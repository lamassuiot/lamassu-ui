import { ActionType } from "typesafe-actions";

import * as caActionsV3 from "./features/cav3/actions";
import * as caActions from "./features/cas/actions";
import * as cloudProxyActions from "./features/cloud-proxy/actions";
import * as devicesActions from "./features/devices/actions";
import * as devicesLogsActions from "./features/devices-logs/actions";
import * as dmsActions from "./features/dms-enroller/actions";
import * as alertsActions from "./features/alerts/actions";
export const actions = {
    caActionsV3,
    caActions,
    cloudProxyActions,
    devicesActions,
    devicesLogsActions,
    dmsActions,
    alertsActions
};

export type CAsActionsV3 = ActionType<typeof caActionsV3>;
export type CAsActions = ActionType<typeof caActions>;
export type CloudProxyActions = ActionType<typeof cloudProxyActions>;
export type DevicesActions = ActionType<typeof devicesActions>;
export type DevicesLogsActions = ActionType<typeof devicesLogsActions>;
export type DMSActions = ActionType<typeof dmsActions>;
export type AlertsActions = ActionType<typeof alertsActions>;

export type RootAction =
    | CAsActionsV3
    | CAsActions
    | CloudProxyActions
    | DevicesActions
    | DevicesLogsActions
    | DMSActions
    | AlertsActions
