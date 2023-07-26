import React, { useEffect, useState } from "react";
import { Grid, IconButton, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { DynamicIcon } from "components/IconDisplayer/DynamicIcon";
import { LamassuChip } from "components/LamassuComponents/Chip";
import RefreshIcon from "@mui/icons-material/Refresh";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useNavigate } from "react-router-dom";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import * as devicesAction from "ducks/features/devices/actions";
import * as deviceApiCalls from "ducks/features/devices/apicalls";
import * as devicesSelector from "ducks/features/devices/reducer";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { DeviceInspectorSlotList } from "./DeviceInspectorViews/DeviceInspectorSlotList";
import { DeviceInspectorSlotView } from "./DeviceInspectorViews/DeviceInspectorSlotView";
import moment from "moment";
import { capitalizeFirstLetter } from "ducks/reducers_utils";
import SplitButton from "components/LamassuComponents/SplitButton";
import { ODeviceStatus } from "ducks/features/devices/models";
import { IssueCertificateFromDMS } from "views/DeviceManufacturingSystemView/DmsActions/IssueCertificateFromDMS";

interface Props {
    deviceID: string,
    slotID: string,
}

export const DeviceInspector: React.FC<Props> = ({ deviceID, slotID }) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const requestStatus = useAppSelector((state) => devicesSelector.getRequestStatus(state));
    const device = useAppSelector((state) => devicesSelector.getDevice(state, deviceID));

    const refreshAction = () => {
        dispatch(devicesAction.getDeviceByIDAction.request({ deviceID: deviceID }));
        dispatch(cloudProxyActions.getConnectorsAction.request());
    };

    useEffect(() => {
        refreshAction();
    }, []);

    const [showProvisionDevice, setShowProvisionDevice] = useState(false);

    const [anchorDeviceActionEl, setAnchorDeviceActionEl] = useState(null);

    const handleDeviceActionClick = (event: any) => {
        if (anchorDeviceActionEl !== event.currentTarget) {
            setAnchorDeviceActionEl(event.currentTarget);
        }
    };

    const handleDeviceActionClose = (event: any) => {
        setAnchorDeviceActionEl(null);
    };

    const deviceActions = [
        { disabled: device?.status !== ODeviceStatus.PENDING_PROVISIONING, label: "Provision Device", onClick: () => { setShowProvisionDevice(true); } },
        { disabled: device?.status === ODeviceStatus.DECOMMISSIONED, label: "Decommission Device", onClick: () => { dispatch(devicesAction.decommissionDeviceAction.request({ deviceID: deviceID })); } }
    ];

    if (slotID !== undefined) {
        deviceActions.push({ disabled: device?.status === ODeviceStatus.DECOMMISSIONED, label: "Force Slot Certificate Renewal", onClick: () => { dispatch(devicesAction.forceDeviceReenrollmentAction.request({ deviceID: deviceID, slotID: slotID })); } });
        deviceActions.push({ disabled: device?.status === ODeviceStatus.DECOMMISSIONED, label: "Revoke Slot Certificate", onClick: () => { dispatch(devicesAction.revokeActiveDeviceCertificateAction.request({ deviceID: deviceID, slotID: slotID })); } });
    }

    if (requestStatus.isLoading || device !== undefined) {
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
                                        <Box component={Paper} sx={{ padding: "5px", background: device!.icon_color_bg, borderRadius: 2, width: 40, height: 40, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <DynamicIcon icon={device!.icon_name} size={30} color={device!.icon_color_fg} />
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
                                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{device!.alias}</Typography>
                                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>#{device!.id}</Typography>
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
                                                    <LamassuChip label={capitalizeFirstLetter(device!.status)} color={device!.status_color} />
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
                    device !== undefined && (
                        <>
                            {
                                slotID !== undefined
                                    ? (
                                        <DeviceInspectorSlotView slotID={slotID} deviceID={deviceID} />
                                    )
                                    : (
                                        <DeviceInspectorSlotList deviceID={deviceID} onSlotClick={(slotId: any) => {
                                            navigate(slotId);
                                        }} />
                                    )
                            }
                            {
                                showProvisionDevice && (
                                    <IssueCertificateFromDMS dmsName={device.dms_name} defaultCN={device.id} isOpen={showProvisionDevice} onClose={() => setShowProvisionDevice(false)} onCreate={async (certSN, caName, certPEM) => {
                                        await deviceApiCalls.assignCertificateToDevice(device.id, "default", caName, certSN);
                                        refreshAction();
                                    }} />
                                )
                            }
                        </>
                    )
                }
            </Box>
        );
    }
    return <Box padding="20px">
        <Typography sx={{ marginTop: "10px", fontStyle: "italic" }}>Device with ID {deviceID} does not exist</Typography>
    </Box>;
};
