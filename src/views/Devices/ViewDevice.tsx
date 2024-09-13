import { Alert, Box, Button, IconButton, MenuItem, Paper, Typography, lighten, useTheme } from "@mui/material";
import { CertificateSelector } from "components/Certificates/CertificateSelector";
import { Device, DeviceStatus, deviceStatusToColor } from "ducks/features/devices/models";
import { DeviceTimeline } from "./StatusTimeline";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import { IOSSwitch } from "components/Switch";
import { IconInput } from "components/IconInput";
import { Modal } from "components/Modal";
import { Select } from "components/Select";
import { ViewDeviceDetails } from "./ViewDeviceDetails";
import { enqueueSnackbar } from "notistack";
import { useParams } from "react-router-dom";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import SplitButton, { Option } from "components/SplitButton";
import apicalls from "ducks/apicalls";
import moment from "moment";

interface Props { }

export const ViewDevice: React.FC<Props> = () => {
    const theme = useTheme();
    const params = useParams();

    const ref = React.useRef<FetchHandle>(null);

    const [decommissioningOpen, setDecommissioningOpen] = useState(false);
    const [forceUpdate, setForceUpdate] = useState<{ open: boolean, connectorID: string, selectedActions: { [name: string]: boolean } }>({ open: false, connectorID: "", selectedActions: {} });
    const [showAssignIdentity, setShowAssignIdentity] = useState(false);
    const [bindedCert, setBindedCert] = useState("");

    const refreshAction = () => {
        if (ref.current) {
            ref.current.refresh();
        }
    };

    const getDeviceActions = (device: Device): Array<Option> => {
        const deviceActions: Array<Option> = [];

        if (device.status !== DeviceStatus.Decommissioned) {
            deviceActions.push({
                disabled: false,
                label: "Assign Identity",
                onClick: () => { setShowAssignIdentity(true); }
            });
        }

        let connectorID = "";
        const connectorMeta = Object.keys(device.metadata).find(mKey => mKey.includes("lamassu.io/iot/"));
        if (connectorMeta) {
            connectorID = connectorMeta.split("/", 2)[2];
        }

        deviceActions.push({
            disabled: device.status === DeviceStatus.NoIdentity || device.status === DeviceStatus.Decommissioned,
            label: "Force Update",
            onClick: () => {
                setForceUpdate({
                    open: true,
                    connectorID,
                    selectedActions: {
                        UPDATE_TRUST_ANCHOR_LIST: true,
                        UPDATE_CERTIFICATE: true
                    }
                });
            }
        });

        deviceActions.push({
            disabled: device.status === DeviceStatus.Decommissioned,
            label: "Decommission Device",
            onClick: () => {
                setDecommissioningOpen(true);
            }
        });

        return deviceActions;
    };

    return (
        <FetchViewer ref={ref} fetcher={() => apicalls.devices.getDeviceByID(params.deviceId!)} renderer={device => {
            return (
                <Grid container flexDirection={"column"} sx={{ height: "100%" }}>
                    <Grid padding={"20px"} component={Paper} borderRadius={0} zIndex={10} elevation={2}>
                        <Grid container alignItems={"center"} justifyContent={"space-between"} spacing={"40px"}>
                            <Grid xs container alignItems={"center"} spacing="20px">
                                <Grid xs="auto">
                                    <Box>
                                        <IconInput readonly label="" size={40} value={{ bg: device!.icon_color.split("-")[0], fg: device!.icon_color.split("-")[1], name: device!.icon }} />
                                    </Box>
                                </Grid>
                                <Grid xs="auto">
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>{device!.id}</Typography>
                                </Grid>
                                <Grid xs="auto" container alignItems={"center"} flexDirection="column" spacing={0}>
                                    <Grid container>
                                        <Label color={deviceStatusToColor(device.status)}>{device.status}</Label>
                                    </Grid>
                                    <Grid container>
                                        <Box style={{ display: "flex", alignItems: "center", marginTop: "3px" }}>
                                            <AccessTimeIcon style={{ color: theme.palette.text.secondary, fontSize: 15, marginRight: 5 }} />
                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`Creation date: ${moment(device!.creation_timestamp).format("DD/MM/YYYY")}`}</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid xs={"auto"} container spacing={1} style={{ marginTop: "1px" }}>
                                    {
                                        device!.tags.map((tag, idx) => (
                                            <Grid key={idx}>
                                                <Label>{tag}</Label>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                                <Grid xs>
                                    <DeviceTimeline device={device} />
                                </Grid>
                            </Grid>
                            <Grid xs="auto" container spacing={2} sx={{ width: "fit-content" }}>
                                <Grid>
                                    <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => { refreshAction(); }}>
                                        <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                    </IconButton>
                                </Grid>
                                <Grid>
                                    <SplitButton options={getDeviceActions(device)} />
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid flexGrow={1}>
                        {
                            device.status !== DeviceStatus.NoIdentity && (
                                <ViewDeviceDetails device={device} />
                            )
                        }
                    </Grid>
                    <Modal
                        isOpen={decommissioningOpen}
                        onClose={() => setDecommissioningOpen(false)}
                        title="Decommission Device"
                        subtitle="By decommissioning the device, it will revoke all attached identities as well as loosing all access to Lamassu and other platforms"
                        maxWidth="md"
                        content={
                            <></>
                        }
                        actions={
                            <Grid container spacing={1}>
                                <Grid xs>
                                    <Button variant="text" onClick={() => setDecommissioningOpen(false)}>Close</Button>
                                </Grid>
                                <Grid xs="auto">
                                    <Button variant="contained" onClick={async () => {
                                        try {
                                            await apicalls.devices.decommissionDevice(device.id);
                                            refreshAction();
                                            enqueueSnackbar(`Device ${device.id} decommissioned`, { variant: "success" });
                                            setDecommissioningOpen(false);
                                        } catch (e) {
                                            enqueueSnackbar(`Failed to decommission device ${device.id}: ${e}`, { variant: "error" });
                                        }
                                    }}>Decommission</Button>
                                </Grid>
                            </Grid>
                        }
                    />
                    <Modal
                        isOpen={showAssignIdentity}
                        onClose={() => setShowAssignIdentity(false)}
                        title="Assign Identity"
                        subtitle="Select the certificate to be attached to this device. Only certificate with a Common Name matching the device ID are displayed"
                        maxWidth="md"
                        content={
                            <Grid container sx={{ marginTop: "20px" }}>
                                <Grid xs={12}>
                                    <CertificateSelector label="Certificate"
                                        limitSelection={device.id}
                                        // filters={[
                                        //     { propertyField: { key: "subject.common_name", label: "Common Name", type: FieldType.String }, propertyOperator: "equal", propertyValue: device.id }
                                        // ]}
                                        multiple={false} onSelect={(cert) => {
                                            if (cert) {
                                                if (!Array.isArray(cert)) {
                                                    setBindedCert(cert.serial_number);
                                                }
                                            }
                                        }
                                        } />
                                </Grid>
                            </Grid>
                        }
                        actions={
                            <Grid container spacing={1}>
                                <Grid xs>
                                    <Button variant="text" onClick={() => setShowAssignIdentity(false)}>Close</Button>
                                </Grid>
                                <Grid xs="auto">
                                    <Button variant="contained" onClick={async () => {
                                        try {
                                            await apicalls.dmss.bindDeviceIdentity(device.id, bindedCert);
                                            refreshAction();
                                            enqueueSnackbar(`Identity assigned to device ${device.id}`, { variant: "success" });
                                            setShowAssignIdentity(false);
                                        } catch (e) {
                                            enqueueSnackbar(`Failed to assign identity to device ${device.id}: ${e}`, { variant: "error" });
                                        }
                                    }}>Assign Identity</Button>
                                </Grid>
                            </Grid>
                        }
                    />
                    <Modal
                        isOpen={forceUpdate.open}
                        onClose={() => setForceUpdate({ open: false, connectorID: "", selectedActions: {} })}
                        title="Force Device Update"
                        subtitle="Select the remediation actions to be delivered using a cloud provider IoT Platform (i.e. AWS IoT Core Shadows)"
                        maxWidth="md"
                        content={
                            <Grid container flexDirection={"column"} spacing={2}>
                                {
                                    Object.keys(device.metadata).find(mKey => mKey.includes(forceUpdate.connectorID)) === undefined && (
                                        <Grid marginTop={"10px"}>
                                            <Alert severity="warning">
                                                {"The selected cloud connector is not associated with this device. Selecting an action may not have any effect on the device."}
                                            </Alert>
                                        </Grid>
                                    )
                                }

                                <Grid>
                                    <Select label="Cloud Connector" onChange={(ev: any) => setForceUpdate({ ...forceUpdate, connectorID: ev.target.value })} value={forceUpdate.connectorID}>
                                        {
                                            window._env_.CLOUD_CONNECTORS.map((id: string, idx: number) => {
                                                return (
                                                    <MenuItem key={idx} value={id}>{id}</MenuItem>
                                                );
                                            })
                                        }
                                    </Select>
                                </Grid>
                                {
                                    forceUpdate.connectorID !== "" && Object.keys(forceUpdate.selectedActions).map((action, idx) => {
                                        return (
                                            <Grid key={idx} container flexDirection={"column"} spacing={0}>
                                                <Grid >
                                                    <Label>{action}</Label>
                                                </Grid>
                                                <Grid >
                                                    <IOSSwitch checked={forceUpdate.selectedActions[action]} onChange={() => setForceUpdate({
                                                        ...forceUpdate,
                                                        selectedActions: {
                                                            ...forceUpdate.selectedActions,
                                                            [action]: !forceUpdate.selectedActions[action]
                                                        }
                                                    })} />
                                                </Grid>
                                            </Grid>
                                        );
                                    })
                                }
                            </Grid>
                        }
                        actions={
                            <Grid container spacing={1}>
                                <Grid xs>
                                    <Button variant="text" onClick={() => setForceUpdate({ open: false, connectorID: "", selectedActions: {} })}>Close</Button>
                                </Grid>
                                <Grid xs="auto">
                                    <Button variant="contained" disabled={forceUpdate.connectorID === ""} onClick={async () => {
                                        const actionsToTrigger = Object.keys(forceUpdate.selectedActions).filter(action => forceUpdate.selectedActions[action] === true);
                                        if (actionsToTrigger.length > 0) {
                                            const newMeta = device!.metadata;
                                            const deviceCloudMeta = newMeta[`lamassu.io/iot/${forceUpdate.connectorID}`];
                                            newMeta[`lamassu.io/iot/${forceUpdate.connectorID}`] = {
                                                ...deviceCloudMeta,
                                                actions: [
                                                    ...deviceCloudMeta.actions,
                                                    ...actionsToTrigger
                                                ]
                                            };

                                            try {
                                                await apicalls.devices.updateDeviceMetadata(device.id, newMeta);
                                                refreshAction();
                                                enqueueSnackbar(`Device ${device.id} cloud actions updated`, { variant: "success" });
                                                setDecommissioningOpen(false);
                                            } catch (e) {
                                                enqueueSnackbar(`Failed to update device ${device.id} cloud actions: ${e}`, { variant: "error" });
                                            }
                                        }
                                        setForceUpdate({ open: false, connectorID: "", selectedActions: {} });
                                    }}>Force Update</Button>
                                </Grid>
                            </Grid>
                        }
                    />
                </Grid>
            );
        }}
        />
    );
};
