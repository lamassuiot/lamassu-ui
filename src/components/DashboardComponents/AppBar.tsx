import React from "react";
import { Box, useTheme } from "@mui/system";

import { Badge } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";

import { useAuth } from "oidc-react";
interface Props {
    background: any
    logo: any
    notificationsCount: number
    onNotificationsClick: any
}

const AppBar: React.FC<Props> = ({ background, logo, notificationsCount, onNotificationsClick = () => { } }) => {
    const theme = useTheme();
    const auth = useAuth();

    return (
        <Box style={{ background: theme.palette.appbar, display: "flex", alignItems: "center", padding: "0px 10px", justifyContent: "space-between" }}>
            {logo}
            <div style={{ height: 50, display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <Badge badgeContent={notificationsCount} color="secondary" onClick={onNotificationsClick} style={{ marginRight: 30, cursor: "pointer", verticalAlign: "middle" }}>
                    <NotificationsIcon style={{ color: "#F1F2F8" }} />
                </Badge>
                <LogoutIcon style={{ color: "#F1F2F8", cursor: "pointer" }} onClick={() => {
                    auth.signOutRedirect();
                }} />
            </div>
        </Box>
    );
};

export { AppBar };
