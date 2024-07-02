import { DMS } from "ducks/features/dmss/models";
import { FetchHandle } from "components/FetchViewer";
import { IconInput } from "components/IconInput";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React, { ReactElement, Ref } from "react";

type Props = {
    dms: DMS
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    return (
        <Grid container spacing={2} alignItems={"center"}>
            <Grid xs={"auto"}>
                <IconInput label="" size={40} value={{
                    bg: props.dms!.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-")[0],
                    fg: props.dms!.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-")[1],
                    name: props.dms!.settings.enrollment_settings.device_provisioning_profile.icon
                }} />
            </Grid>

            <>
                <Grid xs={"auto"}>
                    <Typography fontWeight={"500"} fontSize={"14px"}>{props.dms.name}</Typography>
                    <Typography fontWeight={"400"} fontSize={"14px"}>{props.dms.id}</Typography>
                </Grid>

            </>

        </Grid>
    );
};

export const DMSViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
