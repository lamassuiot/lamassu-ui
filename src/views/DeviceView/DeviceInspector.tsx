import React, { useState } from "react";
import { Button, Grid, IconButton, MenuItem, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { LamassuChip } from "components/LamassuComponents/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import moment from "moment";
import { capitalizeFirstLetter } from "ducks/reducers_utils";
import SplitButton, { Option } from "components/LamassuComponents/SplitButton";
import { useAppSelector } from "ducks/hooks";
import { selectors } from "ducks/reducers";
import { Device, DeviceStatus, deviceStatusToColor } from "ducks/features/devices/models";
import { DeviceInspectorSlotView } from "./DeviceInspectorViews/DeviceInspectorSlotView";
import { actions } from "ducks/actions";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { apicalls } from "ducks/apicalls";
import { IconInput } from "components/LamassuComponents/dui/IconInput";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { LamassuSwitch } from "components/LamassuComponents/Switch";
import { Select } from "components/LamassuComponents/dui/Select";
import { CertificateSelector } from "components/LamassuComponents/lamassu/CertificateSelector";
import { FieldType } from "components/FilterInput";
import { DeviceTimeline } from "./DeviceInspectorViews/DeviceTimeline";

interface Props {
    device: Device,
}

export const DeviceInspector: React.FC<Props> = ({ device }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const requestStatus = useAppSelector(state => selectors.devices.getDeviceListRequestStatus(state));

    const [decommissioningOpen, setDecommissioningOpen] = useState(false);
    const [forceUpdate, setForceUpdate] = useState<{ open: boolean, connectorID: string, selectedActions: { [name: string]: boolean } }>({ open: false, connectorID: "", selectedActions: {} });
    const [showAssignIdentity, setShowAssignIdentity] = useState(false);
    const [bindedCert, setBindedCert] = useState("");

    const refreshAction = () => {
        dispatch(actions.devicesActions.getDeviceByID.request(device.id));
    };

    const deviceActions: Option[] = [];

    if (device) {
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
            disabled: device.status === DeviceStatus.NoIdentity || device.status === DeviceStatus.Decommissioned || connectorID === "",
            label: "Force Update",
            onClick: () => {
                setForceUpdate({
                    open: true,
                    connectorID: connectorID,
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
    }

    return (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ padding: "20px", width: "calc(100% - 40px)", borderRadius: 0, zIndex: 10 }} component={Paper} elevation={2}>
                <Grid container alignItems={"center"} justifyContent={"space-between"} spacing={"40px"}>
                    <Grid item xs container alignItems={"center"} spacing="20px">
                        <Grid item xs="auto">
                            {
                                requestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"40px"} height={"40px"} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                    )
                                    : (
                                        <Box>
                                            <IconInput readonly label="" size={40} value={{ bg: device!.icon_color.split("-")[0], fg: device!.icon_color.split("-")[1], name: device!.icon }} />
                                        </Box>
                                    )
                            }
                        </Grid>
                        <Grid item xs="auto">
                            {
                                requestStatus.isLoading
                                    ? (
                                        <>
                                            <Skeleton variant="rectangular" width={"250px"} height={"30px"} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                            <Skeleton variant="rectangular" width={"200px"} height={"30px"} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                        </>
                                    )
                                    : (
                                        <>
                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>{device!.id}</Typography>
                                        </>
                                    )
                            }
                        </Grid>
                        <Grid item xs="auto" container alignItems={"center"} flexDirection="column" spacing={0}>
                            <Grid item container>
                                {
                                    requestStatus.isLoading
                                        ? (
                                            <Skeleton variant="rectangular" width={"60px"} height={"20px"} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                        )
                                        : (
                                            <LamassuChip label={capitalizeFirstLetter(device!.status)} color={deviceStatusToColor(device!.status)} />
                                        )
                                }
                            </Grid>
                            <Grid item container>
                                <Box style={{ display: "flex", alignItems: "center", marginTop: "3px" }}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"50px"} height={"20px"} sx={{ borderRadius: "10px", marginBottom: "20px" }} />
                                            )
                                            : (
                                                <>
                                                    <AccessTimeIcon style={{ color: theme.palette.text.secondary, fontSize: 15, marginRight: 5 }} />
                                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`Creation date: ${moment(device!.creation_timestamp).format("DD/MM/YYYY")}`}</Typography>
                                                </>
                                            )
                                    }
                                </Box>
                            </Grid>
                        </Grid>
                        {
                            !requestStatus.isLoading && (
                                <>
                                    <Grid item xs="auto">
                                        {
                                            device!.tags.length > 0
                                                ? (
                                                    <Grid item xs={12} container spacing={1} style={{ marginTop: "1px" }}>
                                                        {
                                                            device!.tags.map((tag, idx) => (
                                                                <Grid item key={idx}>
                                                                    <LamassuChip color={theme.palette.mode === "dark" ? ["#EEE", "#555"] : ["#555", "#EEEEEE"]} label={tag} compact={true} compactFontSize />
                                                                </Grid>
                                                            ))
                                                        }
                                                    </Grid>
                                                )
                                                : (
                                                    <Grid item xs={12} style={{ height: 37 }} />
                                                )
                                        }
                                    </Grid>
                                </>
                            )
                        }
                        <Grid item xs>
                            <DeviceTimeline device={device}/>
                        </Grid>
                    </Grid>
                    <Grid item xs="auto" container spacing={2} sx={{ width: "fit-content" }}>
                        {
                            !requestStatus.isLoading && (
                                <>
                                    <Grid item>
                                        <IconButton style={{ backgroundColor: theme.palette.primary.light }} onClick={() => { refreshAction(); }}>
                                            <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                        </IconButton>
                                    </Grid>
                                    <Grid item>
                                        <SplitButton options={deviceActions} />
                                    </Grid>
                                </>
                            )
                        }
                    </Grid>
                </Grid>
            </Box>
            {
                device !== undefined && device.status !== DeviceStatus.NoIdentity && (
                    <DeviceInspectorSlotView device={device} />
                )
            }
            <Modal
                isOpen={decommissioningOpen}
                onClose={() => setDecommissioningOpen(false)}
                title="Decommission Device"
                subtitle="By decommissioning the device, it will revoke all attached identities as well as loosing all access to Lamassu and other platforms"
                maxWidth="md"
                content={
                    <Grid container>
                        <Grid item></Grid>
                    </Grid>
                }
                actions={
                    <Grid container>
                        <Grid item xs>
                            <Button variant="text" onClick={() => setDecommissioningOpen(false)}>Close</Button>
                        </Grid>
                        <Grid item xs="auto">
                            <Button variant="contained" onClick={async () => {
                                await apicalls.devices.decommissionDevice(device.id);
                                dispatch(actions.devicesActions.decommissionDevice());
                                setDecommissioningOpen(false);
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
                        <CertificateSelector label="Certificate" selectLabel="Select the Device Certificate to be attached"
                            filters={[
                                { propertyField: { key: "subject.common_name", label: "Common Name", type: FieldType.String }, propertyOperator: "equal", propertyValue: device.id }
                            ]}
                            multiple={false} onSelect={(cert) => {
                                if (cert) {
                                    if (!Array.isArray(cert)) {
                                        setBindedCert(cert.serial_number);
                                    }
                                }
                            }
                            } />
                    </Grid>
                }
                actions={
                    <Grid container>
                        <Grid item xs>
                            <Button variant="text" onClick={() => setShowAssignIdentity(false)}>Close</Button>
                        </Grid>
                        <Grid item xs="auto">
                            <Button variant="contained" onClick={async () => {
                                await apicalls.dms.bindDeviceIdentity(device.id, bindedCert);
                                dispatch(actions.devicesActions.getDeviceByID.request(device.id));
                                setShowAssignIdentity(false);
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
                        <Grid item>
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
                                    <Grid key={idx} item container flexDirection={"column"} spacing={0}>
                                        <Grid item>
                                            <Label>{action}</Label>
                                        </Grid>
                                        <Grid item>
                                            <LamassuSwitch checked={forceUpdate.selectedActions[action]} onChange={() => setForceUpdate({
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
                    <Grid container>
                        <Grid item xs>
                            <Button variant="text" onClick={() => setForceUpdate({ open: false, connectorID: "", selectedActions: {} })}>Close</Button>
                        </Grid>
                        <Grid item xs="auto">
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
                                    await apicalls.devices.updateDeviceMetadata(device.id, newMeta);
                                    dispatch(actions.devicesActions.getDeviceByID.request(device.id));
                                }
                                setForceUpdate({ open: false, connectorID: "", selectedActions: {} });
                            }}>Force Update</Button>
                        </Grid>
                    </Grid>
                }
            />
        </Box>
    );
};
