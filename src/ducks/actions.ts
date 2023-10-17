import { ActionType } from "typesafe-actions";

import * as caActionsV3 from "./features/cav3/actions";
import * as alertsActions from "./features/alerts/actions";
export const actions = {
    caActionsV3,
    alertsActions
};

export type CAsActionsV3 = ActionType<typeof caActionsV3>;
export type AlertsActions = ActionType<typeof alertsActions>;

export type RootAction =
    | CAsActionsV3
    | AlertsActions
