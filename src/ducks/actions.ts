import { ActionType } from "typesafe-actions";

import * as caActionsV3 from "./features/cav3/actions";
import * as certsActions from "./features/certificates/actions";
import * as alertsActions from "./features/alerts/actions";
import * as devicesActions from "./features/devices/actions";
import * as dmsActions from "./features/ra/actions";

export const actions = {
    caActionsV3,
    certsActions,
    alertsActions,
    devicesActions,
    dmsActions
};

export type CertsActions = ActionType<typeof certsActions>;
export type CAsActionsV3 = ActionType<typeof caActionsV3>;
export type AlertsActions = ActionType<typeof alertsActions>;
export type DevicesActions = ActionType<typeof devicesActions>;
export type DMSActions = ActionType<typeof dmsActions>;

export type RootAction =
    | CAsActionsV3
    | CertsActions
    | AlertsActions
    | DevicesActions
    | DMSActions
