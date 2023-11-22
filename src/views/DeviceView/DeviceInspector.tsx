import React, { useEffect, useState } from "react";
import { Button, Grid, IconButton, MenuItem, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { LamassuChip } from "components/LamassuComponents/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import moment from "moment";
import { RequestStatus, capitalizeFirstLetter } from "ducks/reducers_utils";
import SplitButton, { Option } from "components/LamassuComponents/SplitButton";
import { useAppSelector } from "ducks/hooks";
import { selectors } from "ducks/reducers";
import { DeviceStatus, deviceStatusToColor } from "ducks/features/devices/models";
import { DeviceInspectorSlotView } from "./DeviceInspectorViews/DeviceInspectorSlotView";
import { actions } from "ducks/actions";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { apicalls } from "ducks/apicalls";
import { IconInput } from "components/LamassuComponents/dui/IconInput";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { LamassuSwitch } from "components/LamassuComponents/Switch";
import { Select } from "components/LamassuComponents/dui/Select";

interface Props {
    deviceID: string,
}

export const DeviceInspector: React.FC<Props> = ({ deviceID }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const requestStatus = useAppSelector(state => selectors.devices.getDeviceListRequestStatus(state));
    const device = useAppSelector(state => selectors.devices.getDevice(state, deviceID));

    const [decommissioningOpen, setDecommissioningOpen] = useState(false);
    const [forceUpdate, setForceUpdate] = useState<{ open: boolean, connectorID: string, selectedActions: { [name: string]: boolean } }>({ open: false, connectorID: "", selectedActions: {} });

    useEffect(() => {
        refreshAction();
    }, []);

    const refreshAction = () => {
        dispatch(actions.devicesActions.getDeviceByID.request(deviceID));
    };

    const deviceActions: Option[] = [];

    if (device) {
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

    if (!requestStatus.isLoading && requestStatus.status === RequestStatus.Failed) {
        return (
            <>failed req</>
        );
    } else if (!requestStatus.isLoading && requestStatus.status === RequestStatus.Success && device === undefined) {
        return (
            <>something went wrong</>
        );
    }

    return (
        <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ padding: "20px", width: "calc(100% - 40px)", borderRadius: 0, zIndex: 10 }} component={Paper} elevation={2}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
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
                        <Box sx={{ marginLeft: "15px" }}>
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
                        </Box>
                        <Box sx={{ marginLeft: "25px" }}>
                            <Grid item container alignItems={"center"} flexDirection="column" spacing={0}>
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
                        </Box>
                        {
                            !requestStatus.isLoading && (
                                <>
                                    <Box sx={{ marginLeft: "35px" }}>
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
                                    </Box>
                                </>
                            )
                        }
                    </Box>
                    <Grid container spacing={2} sx={{ width: "fit-content" }}>
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
                </Box>
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
                                await apicalls.devices.decommissionDevice(deviceID);
                                dispatch(actions.devicesActions.decommissionDevice());
                                setDecommissioningOpen(false);
                            }}>Decommission</Button>
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
                                    await apicalls.devices.updateDeviceMetadata(deviceID, newMeta);
                                    dispatch(actions.devicesActions.getDeviceByID.request(deviceID));
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
