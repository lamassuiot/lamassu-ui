import React, { useEffect, useState } from "react";

import { Box, Button, Grid, Paper, Typography, useTheme } from "@mui/material";
import { OperandTypes } from "components/LamassuComponents/Table";
import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { GoLinkExternal } from "react-icons/go";
import { useAppSelector } from "ducks/hooks";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import { useDispatch } from "react-redux";
import AwsIotCore from "./CloudProviders/Types/AWSIotCore";
import Azure from "./CloudProviders/Types/Azure";
import { CertificateAuthority } from "ducks/features/cav3/apicalls";
import Label from "components/LamassuComponents/dui/typographies/Label";

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
                <Route index element={<CloudProviderSelector caData={caData} />} />
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
    caData: CertificateAuthority
}

export const CloudProviderSelector: React.FC<Props> = ({ caData }) => {
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

    return (
        <>
            {
                window._env_.CLOUD_CONNECORS.length === 0
                    ? (
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
                    )
                    : (
                        <Grid container spacing={2}>
                            {
                                window._env_.CLOUD_CONNECORS.map((cloudConnectorID: string, idx: number) => {
                                    if (cloudConnectorID.startsWith("aws")) {
                                        console.log("a");
                                    }
                                    return (
                                        <Grid item xs={4} key={idx}>
                                            <Grid container spacing={1}>
                                                <Grid item xs="auto">
                                                    <Box component={Paper} sx={{ height: "60px", width: "60px" }}>
                                                        <img src={process.env.PUBLIC_URL + "/assets/AWS.png"} height={"100%"} width={"100%"} />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs container flexDirection={"column"}>
                                                    <Grid item xs>
                                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 20, lineHeight: "24px" }}>Ikerlan IoT DEV</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{cloudConnectorID}</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Typography style={{ fontWeight: "400", fontSize: "13px" }}>{9389367978463}</Typography>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs="auto" container flexDirection={"column"} alignItems={"center"}>
                                                    <Grid item>
                                                        <Label>Registered</Label>
                                                    </Grid>
                                                    <Grid item>
                                                        <Box sx={{ background: theme.palette.success.light, width: "30px", height: "30px", borderRadius: "100%" }}></Box>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid >
                    )
            }
        </>

    );
};
