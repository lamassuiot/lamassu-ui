import { combineReducers } from "redux";
import * as cas from "./features/cav3/reducer";
import * as certs from "./features/certificates/reducer";
import * as devices from "./features/devices/reducer";
import { notificationsReducer, NotificationsState } from "./features/notifications/reducer";
import * as dms from "./features/ra/reducer";
import * as alerts from "./features/alerts/reducer";

export type RootState = {
  cav3: cas.CertificateAuthoritiesState,
  certs: certs.CertificatesState,
  notifications: NotificationsState,
  devices: devices.DevicesState
  dmss: dms.DMSsState
  alerts: alerts.AlertsState
}

const reducers = combineReducers({
    cav3: cas.certificateAuthoritiesReducer,
    certs: certs.certificatesReducer,
    notifications: notificationsReducer,
    devices: devices.devicesReducer,
    dmss: dms.dmssReducer,
    alerts: alerts.alertsReducer
});

export const selectors = {
    alerts: alerts,
    certs: certs,
    cas: cas,
    devices: devices,
    dms: dms
};

export default reducers;
