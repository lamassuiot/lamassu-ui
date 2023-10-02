import React from "react";
import { Grid, Typography, useTheme } from "@mui/material";
import { DMS } from "ducks/features/dms-enroller/models";
import { IconInput } from "../dui/IconInput";

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
                    bg: dms!.identity_profile.enrollment_settings.color.split("-")[0],
                    fg: dms!.identity_profile.enrollment_settings.color.split("-")[1],
                    name: dms!.identity_profile.enrollment_settings.icon
                }} />
            </Grid>

            <>
                <Grid item xs={"auto"}>
                    <Typography fontWeight={"500"} fontSize={"14px"}>{dms.name}</Typography>
                    <Typography fontWeight={"400"} fontSize={"14px"}>{dms.name}</Typography>
                </Grid>

            </>

        </Grid >
    );
};
