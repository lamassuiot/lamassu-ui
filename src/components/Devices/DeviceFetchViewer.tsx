import { Device } from "ducks/features/devices/models";
import { FetchHandle, FetchViewer } from "components/FetchViewer";
import { Typography } from "@mui/material";
import React, { ReactElement, Ref } from "react";
import apicalls from "ducks/apicalls";

type Props = {
    id: string
    renderer: (item: Device) => React.ReactElement
}

const Viewer = (props: Props, ref: Ref<FetchHandle>) => {
    if (props.id === "") {
        return <Typography sx={{ fontStyle: "italic" }}>Unspecified</Typography>;
    }

    return (
        <FetchViewer
            fetcher={(controller) => { return apicalls.devices.getDeviceByID(props.id); }}
            renderer={(item: Device) => props.renderer(item)}
            ref={ref}
        />
    );
};

export const DeviceViewer = React.forwardRef(Viewer) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
