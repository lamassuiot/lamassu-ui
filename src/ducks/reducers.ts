import { combineReducers } from "redux";
import { certificateAuthoritiesReducer as certificateAuthoritiesReducerV3, CertificateAuthoritiesState as CertificateAuthoritiesStateV3 } from "./features/cav3/reducer";
import { alertsReducer, AlertsState } from "./features/alerts/reducer";
import { notificationsReducer, NotificationsState } from "./features/notifications/reducer";

export type RootState = {
  cav3: CertificateAuthoritiesStateV3,
  notifications: NotificationsState,
  alerts: AlertsState
}

const reducers = combineReducers({
    cav3: certificateAuthoritiesReducerV3,
    notifications: notificationsReducer,
    alerts: alertsReducer
});

export default reducers;
