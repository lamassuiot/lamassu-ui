import * as alertsApiCalls from "./features/alerts/apicalls";
import * as casApiCalls from "./features/cas/apicalls";
import * as devicesApiCalls from "./features/devices/apicalls";
import * as dmssApiCalls from "./features/dmss/apicalls";
import * as estApiCalls from "./features/est/apicalls";
import * as vaApiCalls from "./features/va/apicalls";

export default {
    alerts: alertsApiCalls,
    cas: casApiCalls,
    devices: devicesApiCalls,
    dmss: dmssApiCalls,
    est: estApiCalls,
    va: vaApiCalls
};
