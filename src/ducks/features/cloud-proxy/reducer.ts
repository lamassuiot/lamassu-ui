/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { AWSSynchronizedCA, CloudConnector, OCloudProvider } from "./models";
import { ActionStatus, capitalizeFirstLetter, ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { awsCaStatusToColor, awsDeviceStatusToColor, awsPolicyStatusToColor, cloudConnectorStatusToColor } from "./utils";

export interface CloudProxyState {
    status: ActionStatus
    list: Array<CloudConnector>
}

const initialState = {
    status: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    },
    list: []
};

export const cloudProxyReducer = createReducer<CloudProxyState, RootAction>(initialState)
    .handleAction(actions.cloudProxyActions.getConnectorsAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read }, list: [] };
    })

    .handleAction(actions.cloudProxyActions.getConnectorsAction.success, (state, action) => {
        let connectors: Array<CloudConnector> = [];
        for (let i = 0; i < action.payload.length; i++) {
            let connector = new CloudConnector(action.payload[i]);
            connector.status = capitalizeFirstLetter(connector.status);
            connector.status_color = cloudConnectorStatusToColor(connector.status);

            let syncCAs = [];
            for (let k = 0; k < connector.synchronized_cas.length; k++) {
                switch (connector.cloud_provider) {
                case OCloudProvider.Aws: {
                    let awsSyncCA = new AWSSynchronizedCA(connector.synchronized_cas[k]);

                    if (awsSyncCA.config && awsSyncCA.config.status) {
                        awsSyncCA.config.status = capitalizeFirstLetter(awsSyncCA.config.status);
                        awsSyncCA.config.status_color = awsCaStatusToColor(awsSyncCA.config.status);
                    }
                    if (awsSyncCA.config && awsSyncCA.config.policy_status) {
                        awsSyncCA.config.policy_status = capitalizeFirstLetter(awsSyncCA.config.policy_status);
                        awsSyncCA.config.policy_status_color = awsPolicyStatusToColor(awsSyncCA.config.policy_status);
                    }
                    syncCAs.push(awsSyncCA);
                    break;
                }
                default:
                    break;
                }
            }
            connector.synchronized_cas = syncCAs;
            connectors.push(connector);
        }
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: connectors };
    })

    .handleAction(actions.cloudProxyActions.getConnectorsAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.cloudProxyActions.forceSynchronizeCloudConnectorAction.request, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Update } };
    })

    .handleAction(actions.cloudProxyActions.forceSynchronizeCloudConnectorAction.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Success } };
    })

    .handleAction(actions.cloudProxyActions.forceSynchronizeCloudConnectorAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.cloudProxyActions.updateAccessPolicyAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Update } };
    })

    .handleAction(actions.cloudProxyActions.forceSynchronizeCloudConnectorAction.success, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })

    .handleAction(actions.cloudProxyActions.forceSynchronizeCloudConnectorAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.cloudProxyActions.getCloudConnectorDeviceConfigAction.request, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })

    .handleAction(actions.cloudProxyActions.getCloudConnectorDeviceConfigAction.success, (state, action) => {
        const connectors = state.list;
        const connectorsDevices = action.payload;

        for (let k = 0; k < connectorsDevices.length; k++) {
            if (connectorsDevices[k].device_config !== null && connectorsDevices[k].device_config.status === 200) {
                const awsDevice = connectorsDevices[k].device_config.config;
                for (let j = 0; j < awsDevice.certificates.length; j++) {
                    awsDevice.certificates[j].status = capitalizeFirstLetter(awsDevice.certificates[j].status);
                    awsDevice.certificates[j].status_color = awsDeviceStatusToColor(awsDevice.certificates[j].status);
                }

                const idx = connectors.map(connector => connector.id).indexOf(connectorsDevices[k].connector_id);
                connectorsDevices[k].device_config.config = awsDevice;
                connectors[idx].devices_config = [connectorsDevices[k].device_config];
            }
        }
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, list: connectors };
        // return { ...state };
    })

    .handleAction(actions.cloudProxyActions.getCloudConnectorDeviceConfigAction.failure, (state, action) => {
        console.log(action);

        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    });

const getSelector = (state: RootState): CloudProxyState => state.cloudproxy;

export const getCloudConnectors = (state: RootState): Array<CloudConnector> => {
    const reducer = getSelector(state);
    return reducer.list;
};

export const getCloudConnector = (state: RootState, id: string): CloudConnector | undefined => {
    const reducer = getSelector(state);
    const filteredList = reducer.list.filter((ca: CloudConnector) => ca.id === id);
    if (filteredList.length === 1) {
        return filteredList[0];
    }
    return undefined;
};

export const getRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};
