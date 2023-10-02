import React, { useEffect, useState } from "react";

import { Box, Button, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import { LamassuStatusChip } from "components/LamassuComponents/Chip";
import { ListWithDataController, OperandTypes } from "components/LamassuComponents/Table";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import DeleteIcon from "@mui/icons-material/Delete";
import { CloudProviderIcon } from "components/CloudProviderIcons";
import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { GoLinkExternal } from "react-icons/go";
import AddIcon from "@mui/icons-material/Add";
import { useAppSelector } from "ducks/hooks";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import { CloudConnector } from "ducks/features/cloud-proxy/models";
import { useDispatch } from "react-redux";
import { EnabledConnectorSynchronizationModal } from "./CloudProviders/Actions/EnabledConnectorSynchronization";
import AwsIotCore from "./CloudProviders/Types/AWSIotCore";
import Azure from "./CloudProviders/Types/Azure";
import { CertificateAuthority } from "ducks/features/cav3/apicalls";

interface CloudProvidersProps {
    caData: CertificateAuthority
}

export const CloudProviders: React.FC<CloudProvidersProps> = ({ caData }) => {
    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route path="aws" element={<Outlet />}>
                    <Route path=":connectorId" element={<RoutedAwsIotCoreConnector caName={caData.id} />} />
                </Route>
                <Route path="azure" element={<Outlet />}>
                    <Route path=":connectorId" element={<RoutedAzureConnector caName={caData.id} />} />
                </Route>
                <Route index element={<CloudProviderSelector caName={caData.id} />} />
            </Route>
        </Routes>
    );
};

interface RoutedAwsIotCoreConnectorProps {
    caName: string
}

const RoutedAwsIotCoreConnector: React.FC<RoutedAwsIotCoreConnectorProps> = ({ caName }) => {
    const params = useParams();

    if (params.connectorId !== undefined) {
        return (
            <AwsIotCore caName={caName} connectorID={params.connectorId} />
        );
    }
    return <Box sx={{ fontStyle: "italic" }}>Missing cloud connector ID</Box>;
};

interface RoutedAzureConnectorProps {
    caName: string
}

const RoutedAzureConnector: React.FC<RoutedAzureConnectorProps> = ({ caName }) => {
    const params = useParams();

    if (params.connectorId !== undefined) {
        return (
            <Azure caName={caName} connectorID={params.connectorId} />
        );
    }
    return <Box sx={{ fontStyle: "italic" }}>Missing cloud connector ID</Box>;
};

interface Props {
    caName: string
}

export const CloudProviderSelector: React.FC<Props> = ({ caName }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(cloudProxyActions.getConnectorsAction.request());
    }, []);

    const requestStatus = useAppSelector((state) => cloudProxySelector.getRequestStatus(state));
    const cloudConnectors = useAppSelector((state) => cloudProxySelector.getCloudConnectors(state)!);

    const [isEnableConnectorOpen, setIsEnableConnectorOpen] = useState({ isOpen: false, connectorId: "" });

    const cloudConnectorTableColumns = [
        { key: "connectorId", dataKey: "id", title: "Connector ID", query: true, type: OperandTypes.string, align: "start", size: 4 },
        { key: "connectorStatus", dataKey: "status", title: "Connector Status", type: OperandTypes.enum, align: "center", size: 2 },
        { key: "syncStatus", title: "Synchronization Status", align: "center", size: 2 },
        { key: "connectorType", dataKey: "cloud_provider", title: "Connector Type", type: OperandTypes.enum, align: "center", size: 2 },
        { key: "connectorAlias", dataKey: "name", title: "Alias", type: OperandTypes.string, query: true, align: "center", size: 2 },
        { key: "connectorEnabled", title: "Connector Enabled", align: "center", size: 2 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const cloudConnectorsRender = (cloudConnector: CloudConnector) => {
        const filteredSynchronizedCAs = cloudConnector.synchronized_cas.filter(syncCa => syncCa.ca_name === caName);

        const enabledConnectorSync = filteredSynchronizedCAs.length === 1;
        return {
            connectorId: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>#{cloudConnector.id}</Typography>,
            syncStatus: (
                <LamassuStatusChip label={enabledConnectorSync ? "Enabled" : "Disabled"} color={enabledConnectorSync ? "green" : "red"} />
            ),
            connectorStatus: (
                <LamassuStatusChip label={cloudConnector.status} color={cloudConnector.status_color} />
            ),
            connectorType: (
                <Box>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>
                            <CloudProviderIcon cloudProvider={cloudConnector.cloud_provider} />
                        </Grid>
                        {/* <Grid item>
                            <Typography style={{fontWeight: "400", fontSize: 14, color: theme.palette.text.primary}}>{cloudConnector.cloud_provider}</Typography>
                        </Grid> */}
                    </Grid>
                </Box>
            ),
            connectorAlias: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{cloudConnector.name}</Typography>
            ),
            connectorDeployed: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{"-"}</Typography>,
            connectorEnabled: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{
                enabledConnectorSync ? moment(filteredSynchronizedCAs[0].enabled).format("DD/MM/YYYY") : "-"
            }</Typography>,
            actions: (
                <Box>
                    <Grid container spacing={1}>
                        {
                            enabledConnectorSync
                                ? (
                                    cloudConnector.status === "passing" && (
                                        <>
                                            <Grid item>
                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                    <IconButton onClick={() => navigate(`${cloudConnector.cloud_provider + "/" + cloudConnector.id}`)} >
                                                        <FormatAlignJustifyIcon fontSize={"small"} />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                            <Grid item>
                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                    <IconButton >
                                                        <DeleteIcon fontSize={"small"} />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        </>
                                    )
                                )
                                : (
                                    cloudConnector.status === "passing" && (
                                        <>
                                            <Grid item>
                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                    <IconButton onClick={() => setIsEnableConnectorOpen({ isOpen: true, connectorId: cloudConnector.id })} >
                                                        <AddIcon fontSize={"small"} />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        </>
                                    )
                                )
                        }
                    </Grid>
                </Box>
            )
        };
    };

    return (
        <>
            <ListWithDataController
                data={cloudConnectors}
                listConf={cloudConnectorTableColumns}
                totalDataItems={cloudConnectors.length}
                invertContrast={true}
                isLoading={requestStatus.isLoading}
                onChange={(ev: any) => { console.log("callback", ev); }}
                emptyContentComponent={
                    <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>
                        <Grid item xs="auto" container justifyContent={"center"} alignItems={"center"} flexDirection="column">
                            <img src={process.env.PUBLIC_URL + "/assets/icon-cloud.png"} height={150} style={{ marginBottom: "25px" }} />
                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>
                            Synchronize your PKI with Cloud Providers
                            </Typography>
                            <Typography>Install different cloud connectors to synchronize your certificates with AWS, Azure or Google Cloud</Typography>
                            <Button
                                endIcon={<GoLinkExternal />}
                                variant="contained"
                                sx={{ marginTop: "10px", color: theme.palette.primary.main, background: theme.palette.primary.light }}
                                onClick={() => {
                                    window.open("https://www.lamassu.io/docs/setup/#deploy-aws-iot-core-connectors", "_blank");
                                }}
                            >
                            Go to install instructions
                            </Button>
                        </Grid>
                    </Grid>
                }
                listRender={{
                    renderFunc: cloudConnectorsRender,
                    enableRowExpand: false
                }}
                withRefresh={() => { dispatch(cloudProxyActions.getConnectorsAction.request()); }}
            />
            <EnabledConnectorSynchronizationModal isOpen={isEnableConnectorOpen.isOpen} connectorID={isEnableConnectorOpen.connectorId} caName={caName} onClose={() => setIsEnableConnectorOpen({ isOpen: false, connectorId: "" })} />
        </>

    );
};
