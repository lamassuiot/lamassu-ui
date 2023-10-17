import { combineEpics } from "redux-observable";

import * as casv3Epic from "./features/cav3/epic";
import * as alertsEpic from "./features/alerts/epic";

const combinedEpics = [
    ...Object.values(casv3Epic),
    ...Object.values(alertsEpic)
];

const epics = combineEpics(...combinedEpics);

export default epics;
