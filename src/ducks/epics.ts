import { combineEpics } from "redux-observable";

import * as casv3Epic from "./features/cav3/epic";
import * as certsEpic from "./features/certificates/epic";
import * as raEpic from "./features/ra/epic";
import * as devicesEpic from "./features/devices/epic";
import * as alertsEpic from "./features/alerts/epic";

const combinedEpics = [
    ...Object.values(casv3Epic),
    ...Object.values(certsEpic),
    ...Object.values(raEpic),
    ...Object.values(devicesEpic),
    ...Object.values(alertsEpic)
];

const epics = combineEpics(...combinedEpics);

export default epics;
