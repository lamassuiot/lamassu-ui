import React, { useState } from "react";
import { IconButton, Menu, MenuItem, Paper, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { useDispatch } from "react-redux";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";

interface Props {
    deviceID: string
    connectorID: string,
    serialNumber: string,
    caName: string,
    status: string
}

export const AWSCloudConnectorDeviceActions: React.FC<Props> = ({ deviceID, connectorID, caName, serialNumber, status }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [anchorCloudConnectorEl, setAnchorCloudConnectorEl] = useState(null);
    const handleCloudConnectorClick = (event: any) => {
        if (anchorCloudConnectorEl !== event.currentTarget) {
            setAnchorCloudConnectorEl(event.currentTarget);
        }
    };
    const handleCloudConnectorClose = (event: any) => {
        setAnchorCloudConnectorEl(null);
    };

    return (
        <>
            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                <IconButton onClick={handleCloudConnectorClick}>
                    <MoreHorizIcon fontSize={"small"} />
                </IconButton>
            </Box>
            <Menu
                style={{ marginTop: 1, width: "auto", borderRadius: 0 }}
                id="simple-menu2"
                anchorEl={anchorCloudConnectorEl}
                open={Boolean(anchorCloudConnectorEl)}
                onClose={handleCloudConnectorClose}
            // MenuListProps={{ onMouseLeave: handleClose }}
            >
                <MenuItem disabled={status === "ACTIVE" || status === "REVOKED"} style={{ width: "100%" }} onClick={(ev: any) => {
                    dispatch(cloudProxyActions.updateDeviceCertificateStatusAction.request({
                        connectorID: connectorID,
                        deviceID: deviceID,
                        caName: caName,
                        serialNumber: serialNumber,
                        status: "ACTIVE"
                    }));
                }}>Activate</MenuItem>
                <MenuItem disabled={status === "INACTIVE" || status === "REVOKED"} style={{ width: "100%" }} onClick={(ev: any) => {
                    dispatch(cloudProxyActions.updateDeviceCertificateStatusAction.request({
                        connectorID: connectorID,
                        deviceID: deviceID,
                        caName: caName,
                        serialNumber: serialNumber,
                        status: "INACTIVE"
                    }));
                }}>Deactivate</MenuItem>
            </Menu>
        </>
    );
};
