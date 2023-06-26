/* eslint-disable prefer-const */
import { createReducer } from "typesafe-actions";
import { AWSDeviceConfig, AWSSynchronizedCA, AzureDeviceConfig, AzureSynchronizedCA, CloudConnector, CloudProxyInfo, OCloudProvider } from "./models";
import { ActionStatus, ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { RootState } from "ducks/reducers";
import { actions, RootAction } from "ducks/actions";
import { awsCaStatusToColor, awsDeviceStatusToColor, awsPolicyStatusToColor, azuresDeviceStatusToColor, cloudConnectorStatusToColor } from "./utils";

export interface CloudProxyState {
    info: CloudProxyInfo
    status: ActionStatus
    list: Array<CloudConnector>
    deviceCloudConfigurationID: string
    deviceCloudConfiguration: Map<string, any>
}

const initialState = {
    info: {
        build_version: "",
        build_time: ""
    },
    status: {
        isLoading: false,
        status: ORequestStatus.Idle,
        type: ORequestType.None
    },
    list: [],
    deviceCloudConfigurationID: "",
    deviceCloudConfiguration: new Map<string, any>()
};

export const cloudProxyReducer = createReducer<CloudProxyState, RootAction>(initialState)
    .handleAction(actions.cloudProxyActions.getInfoAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read } };
    })
    .handleAction(actions.cloudProxyActions.getInfoAction.success, (state, action) => {
        return { ...state, info: action.payload, status: { ...state.status, isLoading: false, status: ORequestStatus.Success } };
    })
    .handleAction(actions.cloudProxyActions.getInfoAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    })

    .handleAction(actions.cloudProxyActions.getConnectorsAction.request, (state, action) => {
        return { ...state, status: { isLoading: true, status: ORequestStatus.Pending, type: ORequestType.Read }, list: [] };
    })

    .handleAction(actions.cloudProxyActions.getConnectorsAction.success, (state, action) => {
        let connectors: Array<CloudConnector> = [];
        for (let i = 0; i < action.payload.cloud_connectors.length; i++) {
            let connector = new CloudConnector(action.payload.cloud_connectors[i]);
            connector.status_color = cloudConnectorStatusToColor(connector.status);
            let syncCAs = [];
            for (let k = 0; k < connector.synchronized_cas.length; k++) {
                switch (connector.cloud_provider) {
                case OCloudProvider.Aws: {
                    let awsSyncCA = new AWSSynchronizedCA(connector.synchronized_cas[k]);

                    if (awsSyncCA.configuration && awsSyncCA.configuration.status) {
                        awsSyncCA.configuration.status_color = awsCaStatusToColor(awsSyncCA.configuration.status);
                    }
                    if (awsSyncCA.configuration && awsSyncCA.configuration.policy_status) {
                        awsSyncCA.configuration.policy_status_color = awsPolicyStatusToColor(awsSyncCA.configuration.policy_status);
                    }
                    syncCAs.push(awsSyncCA);
                    break;
                }
                case OCloudProvider.Azure: {
                    let azureSyncCA = new AzureSynchronizedCA(connector.synchronized_cas[k]);
                    syncCAs.push(azureSyncCA);
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

    .handleAction(actions.cloudProxyActions.updateConfiguration.request, (state, action) => {
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
        const connectors: Array<CloudConnector> = state.list;
        const deviceCloudConfig: Map<string, any> = state.deviceCloudConfiguration;
        const connectorsDevices = action.payload;

        for (let k = 0; k < connectorsDevices.length; k++) {
            if (connectorsDevices[k].device_config !== null) {
                const device = connectorsDevices[k].device_config;
                const connectorIdx = connectors.map(connector => connector.id).indexOf(connectorsDevices[k].connector_id);
                switch (connectors[connectorIdx].cloud_provider) {
                case OCloudProvider.Aws: {
                    const awsDevice = new AWSDeviceConfig(device);
                    for (let j = 0; j < awsDevice.certificates.length; j++) {
                        awsDevice.certificates[j].status_color = awsDeviceStatusToColor(awsDevice.certificates[j].status);
                    }
                    deviceCloudConfig.set(connectorsDevices[k].connector_id, awsDevice);
                    break;
                }
                case OCloudProvider.Azure: {
                    const azureDevice = new AzureDeviceConfig(device);
                    azureDevice.status_color = azuresDeviceStatusToColor(azureDevice.status);
                    deviceCloudConfig.set(connectorsDevices[k].connector_id, azureDevice);
                    break;
                }
                }
            }
        }
        // @ts-ignore
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Success }, deviceCloudConfiguration: deviceCloudConfig, deviceCloudConfigurationID: action.meta.deviceID };
    })

    .handleAction(actions.cloudProxyActions.getCloudConnectorDeviceConfigAction.failure, (state, action) => {
        return { ...state, status: { ...state.status, isLoading: false, status: ORequestStatus.Failed } };
    });

const getSelector = (state: RootState): CloudProxyState => state.cloudproxy;

export const getInfo = (state: RootState): CloudProxyInfo => {
    const caReducer = getSelector(state);
    return caReducer.info;
};

export const getCloudConnectors = (state: RootState): Array<CloudConnector> => {
    const reducer = getSelector(state);
    return reducer.list;
};

export const getDeviceCloudConfiguration = (state: RootState, deviceID: string): Map<string, any> | undefined => {
    const reducer = getSelector(state);
    if (reducer.deviceCloudConfigurationID !== deviceID) {
        return undefined;
    }
    return reducer.deviceCloudConfiguration;
};

export const getCloudConnector = (state: RootState, id: string): CloudConnector | undefined => {
    const reducer = getSelector(state);

    const connector = reducer.list.find((ca: CloudConnector) => ca.id === id);
    if (connector) {
        return connector;
    }
    return undefined;
};

export const getRequestStatus = (state: RootState): ActionStatus => {
    const reducer = getSelector(state);
    return reducer.status;
};
