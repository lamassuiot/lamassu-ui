import React, { useEffect, useState } from "react";
import { Button, Divider, Grid, IconButton, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import moment from "moment";
import { LamassuChip, LamassuStatusChip } from "components/LamassuComponents/Chip";
import { LamassuTable } from "components/LamassuComponents/Table";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import * as devicesSelector from "ducks/features/devices/reducer";
import * as deviceLogsSelector from "ducks/features/devices-logs/reducer";
import * as deviceLogsActions from "ducks/features/devices-logs/actions";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { Modal } from "components/Modal";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { TimelineOppositeContent } from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import RefreshIcon from "@mui/icons-material/Refresh";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { getColor } from "components/utils/lamassuColors";
import { DeviceSlot, OSlotCertificateStatus, SlotCertificate } from "ducks/features/devices/models";
import { AWSDeviceConfig, AzureDeviceConfig, CloudConnector, OCloudProvider, OCloudProviderHealthStatus } from "ducks/features/cloud-proxy/models";
import { AWSCloudConnectorDeviceActions } from "../components/AWSCloudConnectorDeviceActions";
import { CloudProviderIcon } from "components/CloudProviderIcons";
import { pSBC } from "components/utils/colors";
import { AzureCloudConnectorDeviceActions } from "../components/AzureCloudConnectorDeviceActions";

interface Props {
    slotID: string,
    deviceID: string,
}

export const DeviceInspectorSlotView: React.FC<Props> = ({ slotID, deviceID }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const device = useAppSelector((state) => devicesSelector.getDevice(state, deviceID));
    const filteredSlot = device!.slots.filter((s) => s.id === slotID);

    const connectorsRequestStatus = useAppSelector((state) => cloudProxySelector.getRequestStatus(state));
    const connectors = useAppSelector((state) => cloudProxySelector.getCloudConnectors(state));
    const deviceCloudConfiguration = useAppSelector((state) => cloudProxySelector.getDeviceCloudConfiguration(state, deviceID));
    const requestStatus = useAppSelector((state) => devicesSelector.getRequestStatus(state));
    const logRequestStatus = useAppSelector((state) => deviceLogsSelector.getRequestStatus(state));
    const logs = useAppSelector((state) => deviceLogsSelector.getLogs(state, deviceID));

    const [showCertificate, setShowCertificate] = useState(false);
    const [showRevokeCertificate, setShowRevokeCertificate] = useState(false);

    const logsRefreshAction = () => {
        dispatch(deviceLogsActions.getDeviceLogs.request({
            deviceID: deviceID
            // filterQuery: [],
            // limit: 10,
            // offset: 0,
            // sortField: "id",
            // sortMode: "asc"
        }));
    };

    const refreshAction = () => {
        logsRefreshAction();
        dispatch(cloudProxyActions.getConnectorsAction.request());
    };

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        dispatch(cloudProxyActions.getCloudConnectorDeviceConfigAction.request({
            connectorIDs: connectors.map((c) => c.id),
            deviceID: deviceID
        }));
    }, [connectors]);

    let slot: DeviceSlot | undefined;
    if (filteredSlot.length === 1) {
        slot = filteredSlot[0];
    } else {
        return (
            <>
                <Box padding="20px">
                    <Typography sx={{ marginTop: "10px", fontStyle: "italic" }}>Device with ID {deviceID} does not have slot {slotID}</Typography>
                </Box>
            </>
        );
    }

    let decodedCertificateSubject = "";
    if (slot !== undefined) {
        if (slot.active_certificate.subject.country !== undefined) decodedCertificateSubject += "C=" + slot.active_certificate.subject.country + "\\";
        if (slot.active_certificate.subject.state !== undefined) decodedCertificateSubject += "ST=" + slot.active_certificate.subject.state + "\\";
        if (slot.active_certificate.subject.locality !== undefined) decodedCertificateSubject += "L=" + slot.active_certificate.subject.locality + "\\";
        if (slot.active_certificate.subject.organization !== undefined) decodedCertificateSubject += "O=" + slot.active_certificate.subject.organization + "\\";
        if (slot.active_certificate.subject.organization_unit !== undefined) decodedCertificateSubject += "OU=" + slot.active_certificate.subject.organization_unit + "\\";
        if (slot.active_certificate.subject.common_name !== undefined) decodedCertificateSubject += "CN=" + slot.active_certificate.subject.common_name + "\\";
    }

    const certTableColumns = [
        { key: "serialNumber", title: "Serial Number", align: "start", size: 3 },
        { key: "caName", title: "CA Name", align: "center", size: 2 },
        { key: "certificateStatus", title: "Certificate Status", align: "center", size: 1 },
        { key: "issuedDate", title: "Issued Date", align: "center", size: 1 },
        { key: "revokeDate", title: "Revocation Date", align: "center", size: 1 }
    ];

    const awsDevicesCertificateTableColumn = [
        { key: "serialNumber", title: "Serial Number", align: "start", size: 3 },
        { key: "arn", title: "ARN", align: "center", size: 4 },
        { key: "status", title: "Status", align: "center", size: 1 },
        { key: "updateDate", title: "Update Date", align: "center", size: 1 },
        { key: "actions", title: "", align: "end", size: 1 }
    ];

    const connectorsTableColumns = [
        { key: "id", title: "Connector ID", align: "start", size: 3 },
        { key: "connectorType", title: "Connector Type", align: "center", size: 2 },
        { key: "connectorAlias", title: "Alias", align: "center", size: 2 },
        { key: "healthStatus", title: "Connector Health Status", align: "center", size: 1 },
        // { key: "syncStatus", title: "Connector Synchronization Status", align: "center", size: 2 },
        // { key: "connectorEnabled", title: "Connector Enabled", align: "center", size: 2 },
        { key: "actions", title: "", align: "end", size: 1 }
    ];

    const certificatesRenderer = (cert: SlotCertificate) => {
        return {
            serialNumber: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>#{cert.serial_number}</Typography>,
            caName: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>#{cert.ca_name}</Typography>,
            certificateStatus: (
                <LamassuChip label={cert.status} color={cert.status_color} />
            ),
            issuedDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{moment(cert.valid_from).format("DD-MM-YYYY HH:mm")}</Typography>,
            revokeDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
                {cert.status === OSlotCertificateStatus.REVOKED ? moment(cert.revocation_timestamp).format("DD-MM-YYYY HH:mm") : "-"}
            </Typography>
        };
    };

    const cloudConnectorsRender = (connector: CloudConnector) => {
        let enabledConnectorSync = false;
        const filteredSyncCAs = connector.synchronized_cas.filter((syncCA) => syncCA.ca_name === slot!.active_certificate.ca_name);
        if (filteredSyncCAs.length > 0) {
            enabledConnectorSync = true;
        }

        if (connector.status !== OCloudProviderHealthStatus.Passing) {
            return <>a</>;
        }

        const awsTableRenderer = (cert: any) => {
            return {
                serialNumber: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>#{cert.serial_number}</Typography>,
                arn: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary, overflowWrap: "anywhere" }}>#{cert.arn}</Typography>,
                certificateId: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>#{cert.id}</Typography>,
                status: (
                    <LamassuChip label={cert.status} color={cert.status_color} />
                ),
                updateDate: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{moment(cert.update_date).format("DD-MM-YYYY HH:mm")}</Typography>,
                actions: <AWSCloudConnectorDeviceActions connectorID={connector.id} deviceID={deviceID} caName={cert.ca_name} serialNumber={cert.serial_number} status={cert.status} />
            };
        };

        const awsRenderer = (deviceConfig: any) => {
            const awsDeviceConfig = (deviceConfig as AWSDeviceConfig);
            return (
                <>
                    <Box style={{ marginTop: "5px" }}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Last connection</Typography>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{moment(awsDeviceConfig.last_connection).format("DD-MM-YYYY HH:mm")} ({moment(awsDeviceConfig.last_connection).fromNow()})</Typography>
                    </Box>
                    {/* <Box style={{ margin: "10px 0" }}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Shadow</Typography>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>Version: {moment(awsDeviceConfig.last_connection).format("DD-MM-YYYY HH:mm")} ({moment(awsDeviceConfig.last_connection).fromNow()})</Typography>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>Last Update: {moment(awsDeviceConfig.last_connection).format("DD-MM-YYYY HH:mm")} ({moment(awsDeviceConfig.last_connection).fromNow()})</Typography>
                        <Grid container columns={9} sx={{ width: "100%" }} spacing={2}>
                            <Grid item xs container flexDirection={"column"}>
                                <Grid item>
                                    <Box sx={{ background: theme.palette.background.lightContrast, padding: "5px 10px", borderRadius: "5px" }}>
                                        <Typography variant="h5" fontWeight="500" fontSize="15px" sx={{ color: theme.palette.text.main }}>Desired</Typography>
                                    </Box>
                                </Grid>
                                <Grid item>
                                    <SyntaxHighlighter language="json" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                        {`{
    "issuer": {
        "url": "test",
        "not_after": "0001-01-01T00:00:00Z"
    },
    "certificates": {
        "default": {
            "serial_number": "7f-c9-03-f8-7c-2b-0b-c6-19-8f-30-8f-35-53-55-70-da-ce-11-e8",
            "rotate": false
        }
    },
    "trusted_cas": {
        "update": false
    }
}`}
                                    </SyntaxHighlighter>
                                </Grid>
                            </Grid>
                            <Grid item xs container flexDirection={"column"}>
                                <Grid item>
                                    <Box sx={{ background: theme.palette.background.lightContrast, padding: "5px 10px", borderRadius: "5px" }}>
                                        <Typography variant="h5" fontWeight="500" fontSize="15px" sx={{ color: theme.palette.text.main }}>Reported</Typography>
                                    </Box>
                                </Grid>
                                <Grid item>
                                    <Typography>Desired</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box> */}
                    <Box style={{ marginTop: "5px" }}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>AWS Certificates</Typography>
                        <LamassuTable data={awsDeviceConfig.certificates} listRender={{
                            columnConf: awsDevicesCertificateTableColumn,
                            renderFunc: awsTableRenderer,
                            enableRowExpand: false
                        }} style={{ marginTop: "10px" }} />
                    </Box>
                </>
            );
        };

        const azureRender = (deviceConfig: any) => {
            const azureDeviceConfig = (deviceConfig as AzureDeviceConfig);
            return (
                <>
                    <Box style={{ marginTop: "5px" }}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Status</Typography>
                        <LamassuChip label={azureDeviceConfig.status} color={azureDeviceConfig.status_color} />
                    </Box>
                    <Box style={{ marginTop: "5px" }}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Connection State</Typography>
                        <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{azureDeviceConfig.connection_state}</Typography>
                    </Box>
                    <Box style={{ marginTop: "5px" }}>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Last connection</Typography>
                        <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{moment(azureDeviceConfig.last_activity_time).format("DD-MM-YYYY HH:mm")}</Typography>
                    </Box>
                    <Box style={{ marginTop: "5px" }}>
                        <AzureCloudConnectorDeviceActions connectorID={connector.id} deviceID={deviceID} caName={slot!.active_certificate.ca_name} serialNumber={slot!.active_certificate.serial_number} status={azureDeviceConfig.status} />
                    </Box>
                </>
            );
        };

        const renderExpandedRow = () => {
            if (deviceCloudConfiguration !== undefined && deviceCloudConfiguration.has(connector.id)) {
                if (connector.cloud_provider === OCloudProvider.Aws) {
                    return awsRenderer(deviceCloudConfiguration.get(connector.id));
                } else if (connector.cloud_provider === OCloudProvider.Azure) {
                    return azureRender(deviceCloudConfiguration.get(connector.id));
                }
                return (
                    <Box marginTop="10px" marginBottom="10px">
                        <Typography sx={{ fontStyle: "italic" }}>Unsupported cloud provider</Typography>
                    </Box>
                );
            }
            return (
                <Box marginTop="10px" marginBottom="10px">
                    <Typography sx={{ fontStyle: "italic" }}>Device not connected to cloud provider</Typography>
                </Box>
            );
        };

        return {
            id: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>#{connector.id}</Typography>,
            connectorType: (
                <Box>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>
                            <CloudProviderIcon cloudProvider={connector.cloud_provider} />
                        </Grid>
                    </Grid>
                </Box>
            ),
            connectorAlias: (
                <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{connector.name}</Typography>
            ),
            healthStatus: (
                <LamassuStatusChip label={connector.status} color={connector.status_color} />
            ),
            syncStatus: (
                <LamassuStatusChip label={enabledConnectorSync ? "Enabled" : "Disabled"} color={enabledConnectorSync ? "green" : "red"} />
            ),
            connectorEnabled: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{
                enabledConnectorSync ? moment(filteredSyncCAs[0].enabled).format("DD/MM/YYYY") : "-"
            }</Typography>,
            actions: (
                connector.status === OCloudProviderHealthStatus.Passing && (
                    <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                        <IconButton onClick={() => { }}>
                            <KeyboardArrowDownIcon fontSize={"small"} />
                        </IconButton>
                    </Box>
                )
            ),
            expandedRowElement: (
                <Box sx={{ width: "calc(100% - 65px)", borderLeft: `4px solid ${theme.palette.primary.main}`, background: pSBC(theme.palette.mode === "dark" ? 0.01 : -0.03, theme.palette.background.paper), marginLeft: "20px", padding: "20px 20px 0 20px", marginBottom: "20px" }}>
                    {
                        renderExpandedRow()
                    }
                </Box>
            )
        };
    };

    return (
        <>
            <Box sx={{ padding: "10px 20px", display: "flex", alignItems: "center", zIndex: 2 }} component={Paper} borderRadius={0}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs="auto">
                        <IconButton style={{ backgroundColor: theme.palette.primary.light }} onClick={() => {
                            const url = location.pathname;
                            navigate(url.substring(0, url.lastIndexOf("/")));
                        }}>
                            <ArrowBackIcon style={{ color: theme.palette.primary.main }} />
                        </IconButton>
                    </Grid>
                    <Grid item xs="auto">
                        <Typography variant="h5" fontWeight="500" fontSize="15px" textAlign={"center"} sx={{ color: theme.palette.text.main, background: theme.palette.background.lightContrast, display: "inline", padding: "5px 10px", borderRadius: "5px" }}>Slot {slotID}</Typography>
                    </Grid>
                    <Grid item xs="auto">
                        <LamassuChip label={slot.active_certificate.status} color={slot.active_certificate.status_color} />
                    </Grid>
                    <Grid item xs container flexDirection="column">
                        <Grid item container columnSpacing={8} rowSpacing={0}>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Expiration Date</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{moment(slot!.active_certificate.valid_to).format("DD-MM-YYYY HH:mm")}</Typography>
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>CA Name</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot!.active_certificate.ca_name}</Typography>
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Serial Number</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot!.active_certificate.serial_number}</Typography>
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Key Properties</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{`${slot!.active_certificate!.key_metadata.type.toUpperCase()} ${slot!.active_certificate!.key_metadata.bits}`}</Typography>
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Key Strength</Typography>
                                <LamassuChip label={slot!.active_certificate!.key_metadata.strength} color={slot!.active_certificate!.key_metadata.strength_color} compact />
                            </Grid>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Subject</Typography>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>
                                    {decodedCertificateSubject}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs="auto">
                        {
                            slot!.active_certificate && (
                                <Grid item xs container alignItems={"center"} justifyContent={"flex-end"}>
                                    <Button variant="outlined" size="small" onClick={() => { setShowCertificate(true); }}>View Certificate</Button>
                                    <Modal
                                        title=""
                                        isOpen={showCertificate}
                                        onClose={() => { setShowCertificate(false); }}
                                        subtitle=""
                                        actions={
                                            <Box>
                                                <Button onClick={() => { setShowCertificate(false); }}>Close</Button>
                                            </Box>
                                        }
                                        content={
                                            <SyntaxHighlighter language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {window.atob(slot!.active_certificate.certificate)}
                                            </SyntaxHighlighter>
                                        }
                                    />
                                </Grid>

                            )
                        }
                    </Grid>
                </Grid>

            </Box>
            <Grid container sx={{ flexGrow: 1, overflowY: "hidden", height: "300px" }} columns={13}>
                <Grid item xs={10} sx={{ padding: "30px", overflowY: "scroll", height: "100%" }} container>
                    {
                        !requestStatus.isLoading && (
                            <Grid item container flexDirection="column" gap={2}>
                                <Grid item xs="auto" >
                                    <Box component={Paper}>
                                        <Box sx={{ padding: "15px" }}>
                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 18 }}>Certificates</Typography>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ height: "100%", padding: "20px" }}>
                                            <LamassuTable listRender={{
                                                columnConf: certTableColumns,
                                                renderFunc: certificatesRenderer,
                                                enableRowExpand: false
                                            }}
                                            data={[...slot!.archive_certificates, slot!.active_certificate]} />
                                        </Box>
                                    </Box>
                                </Grid>

                                <Grid item xs="auto" >
                                    <Box component={Paper}>
                                        <Box sx={{ padding: "15px" }}>
                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 18 }}>Cloud Connectors</Typography>
                                        </Box>
                                        <Divider />
                                        <Box sx={{ height: "calc(100% - 40px)", padding: "20px" }}>
                                            {
                                                connectorsRequestStatus.isLoading
                                                    ? (
                                                        <>
                                                            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                        </>
                                                    )
                                                    : (
                                                        <LamassuTable listRender={{
                                                            columnConf: connectorsTableColumns,
                                                            renderFunc: cloudConnectorsRender,
                                                            enableRowExpand: true
                                                        }} data={connectors} />
                                                    )
                                            }
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        )
                    }
                </Grid>

                <Grid item xs={3} container flexDirection={"column"} component={Paper} borderRadius={0} sx={{ padding: "20px" }}>
                    <Grid item container justifyContent={"flex-end"} sx={{ marginBottom: "10px" }}>
                        <IconButton style={{ backgroundColor: theme.palette.primary.light }} onClick={() => { logsRefreshAction(); }}>
                            <RefreshIcon style={{ color: theme.palette.primary.main }} />
                        </IconButton>
                    </Grid>

                    <Grid item sx={{ flexGrow: 1, overflowY: "auto", overflowX: "hidden", height: "0px" }}>
                        {
                            logRequestStatus.isLoading
                                ? (
                                    <>
                                        <Skeleton variant="rectangular" width={"100%"} height={20} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                        <Skeleton variant="rectangular" width={"100%"} height={20} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                        <Skeleton variant="rectangular" width={"100%"} height={20} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                    </>
                                )
                                : (
                                    <Timeline position="left" sx={{ width: "100%", marginLeft: "-20px" }}>
                                        {
                                            logs.map((log, idx) => (
                                                <TimelineItem key={idx}>
                                                    <TimelineOppositeContent style={{ maxWidth: "1px", paddingLeft: "0px", paddingRight: "0px" }} />
                                                    <TimelineSeparator>
                                                        <TimelineDot variant="outlined" sx={{ margin: 0 }} />
                                                        <TimelineConnector />
                                                    </TimelineSeparator>
                                                    <TimelineContent sx={{ marginTop: "-11.5px", marginBottom: "25px" }}>
                                                        <Typography fontWeight="500">{log.log_message}</Typography>
                                                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                                                            <Typography sx={{ color: theme.palette.text.secondary, marginRight: "5px" }} fontSize="13px">{moment(log.timestamp).format("DD-MM-YYYY HH:mm")}</Typography>
                                                            <Typography sx={{ color: getColor(theme, log.log_type_color)[0] }} fontSize="13px" fontWeight="500">{log.log_type}</Typography>
                                                        </Box>
                                                        <Box sx={{ marginTop: "10px" }}>
                                                            {/* <Typography sx={{ marginRight: "5px" }} fontSize="13px" fontWeight="500">
                                                        Slot A provisioned
                                                </Typography> */}
                                                            <Typography fontSize="12px">
                                                                {log.log_description}
                                                            </Typography>
                                                        </Box>
                                                    </TimelineContent>
                                                </TimelineItem>
                                            ))
                                        }
                                    </Timeline>
                                )
                        }
                    </Grid>
                </Grid>
            </Grid>
        </>
    );
};
