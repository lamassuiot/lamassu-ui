import React from "react";
import { Grid, Typography, useTheme } from "@mui/material";
import { IconInput } from "../dui/IconInput";
import { DMS } from "ducks/features/ra/models";

export interface DMSViewerProps {
    dms: DMS,
    simple?: boolean,
}

export const DMSViewer: React.FC<DMSViewerProps> = ({ dms, simple = false }) => {
    const theme = useTheme();

    return (
        <Grid container spacing={2} alignItems={"center"}>
            <Grid item xs={"auto"}>
                <IconInput label="" size={40} value={{
                    bg: dms!.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-")[0],
                    fg: dms!.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-")[1],
                    name: dms!.settings.enrollment_settings.device_provisioning_profile.icon
                }} />
            </Grid>

            <>
                <Grid item xs={"auto"}>
                    <Typography fontWeight={"500"} fontSize={"14px"}>{dms.name}</Typography>
                    <Typography fontWeight={"400"} fontSize={"14px"}>{dms.id}</Typography>
                </Grid>

            </>

        </Grid >
    );
};
