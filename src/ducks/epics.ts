import { combineEpics } from "redux-observable";

import * as casv3Epic from "./features/cav3/epic";
import * as raEpic from "./features/ra/epic";
import * as devicesEpic from "./features/devices/epic";

const combinedEpics = [
    ...Object.values(casv3Epic),
    ...Object.values(raEpic),
    ...Object.values(devicesEpic)
];

const epics = combineEpics(...combinedEpics);

export default epics;
