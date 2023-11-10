import * as cas from "./features/cav3/apicalls";
import * as devices from "./features/devices/apicalls";
import * as dms from "./features/ra/apicalls";
import * as alerts from "./features/alerts/apicalls";
import * as est from "./features/est/apicalls";

export const apicalls = {
    alerts: alerts,
    cas: cas,
    devices: devices,
    dms: dms,
    est: est
};
