import { combineEpics } from "redux-observable";

import * as casv3Epic from "./features/cav3/epic";
import * as casEpic from "./features/cas/epic";
import * as cloudProxyEpic from "./features/cloud-proxy/epic";
import * as devicesEpic from "./features/devices/epic";
import * as devicesLogsEpic from "./features/devices-logs/epic";
import * as dmsEpic from "./features/dms-enroller/epic";
import * as alertsEpic from "./features/alerts/epic";

const combinedEpics = [
    ...Object.values(casv3Epic),
    ...Object.values(casEpic),
    ...Object.values(cloudProxyEpic),
    ...Object.values(devicesEpic),
    ...Object.values(devicesLogsEpic),
    ...Object.values(dmsEpic),
    ...Object.values(alertsEpic)
];

const epics = combineEpics(...combinedEpics);

export default epics;
