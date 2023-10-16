import { combineReducers } from "redux";
import { certificateAuthoritiesReducer as certificateAuthoritiesReducerV3, CertificateAuthoritiesState as CertificateAuthoritiesStateV3 } from "./features/cav3/reducer";
import { certificateAuthoritiesReducer, CertificateAuthoritiesState } from "./features/cas/reducer";
import { cloudProxyReducer, CloudProxyState } from "./features/cloud-proxy/reducer";
import { devicesLogsReducer, DevicesLogsState } from "./features/devices-logs/reducer";
import { devicesReducer, DevicesState } from "./features/devices/reducer";
import { dmsReducer, DeviceManufacturingSystemStatus } from "./features/dms-enroller/reducer";
import { alertsReducer, AlertsState } from "./features/alerts/reducer";
import { notificationsReducer, NotificationsState } from "./features/notifications/reducer";

export type RootState = {
  cav3: CertificateAuthoritiesStateV3,
  cas: CertificateAuthoritiesState,
  cloudproxy: CloudProxyState,
  devices: DevicesState,
  devicesLogs: DevicesLogsState,
  notifications: NotificationsState,
  dmss: DeviceManufacturingSystemStatus
  alerts: AlertsState
}

const reducers = combineReducers({
    cas: certificateAuthoritiesReducer,
    cav3: certificateAuthoritiesReducerV3,
    notifications: notificationsReducer,
    cloudproxy: cloudProxyReducer,
    devices: devicesReducer,
    devicesLogs: devicesLogsReducer,
    dmss: dmsReducer,
    alerts: alertsReducer
});

export default reducers;
