import { Device, DeviceEvent, DeviceEventType } from "ducks/features/devices/models";
import { Typography, useTheme } from "@mui/material";
import React from "react";
import { StandardEventVisualizer } from "./Standard";
import { getAWSEventVisualizerData } from "./AWSEvents";
import { CertificateStandardFetchViewer } from "components/Certificates/CertificateStandardFetchViewer";
import Grid from "@mui/material/Unstable_Grid2";

interface Props {
    event: DeviceEvent;
    device: Device
    refresh: () => void;
}

export const EventVisualizer: React.FC<Props> = (props) => {
    const theme = useTheme();

    let tooltip: string | undefined;
    let icon: React.ReactNode | undefined;
    let eventTitle: string = props.event.type;
    let description: string | React.ReactNode = props.event.description;

    if (props.event.source.includes("lrn://service/lamassuiot-awsiot/aws.")) {
        const aws = getAWSEventVisualizerData(props.event);
        tooltip = aws.tooltip;
        icon = aws.icon;
        eventTitle = aws.label;
        description = aws.description;
    } else {
        switch (props.event.type) {
        case DeviceEventType.StatusUpdated:
            eventTitle = "Status Update";
            break;
        }

        if (props.event.type === DeviceEventType.Provisioned) {
            tooltip = "Device has been provisioned with a certificate for the first time";
            description = <CertificateStandardFetchViewer sn={props.device.identity.versions[0]} clickDisplay clickRevoke={true} onReactivate={() => props.refresh()} onRevoke={() => props.refresh()} />;
        }

        if (props.event.type === DeviceEventType.ReProvisioned) {
            tooltip = "Device has acquired a new certificate using the ENROLL procedure (not using the RE-ENROLL)";
            description = <CertificateStandardFetchViewer sn={props.device.identity.versions[parseInt(props.event.description.replace("New Active Version set to ", ""))]} clickDisplay clickRevoke={true} onReactivate={() => props.refresh()} onRevoke={() => props.refresh()} />;
        }

        if (props.event.type === DeviceEventType.Renewed) {
            tooltip = "Device has acquired a new certificate using the RE-ENROLL procedure";
            description = (
                <Grid container spacing={1}>
                    <Grid xs={12}>
                        <Typography fontSize="12px" fontWeight="400">{props.event.description}</Typography>
                    </Grid>
                    <Grid xs={12}>
                        <CertificateStandardFetchViewer sn={props.device.identity.versions[parseInt(props.event.description.replace("New Active Version set to ", ""))]} clickDisplay clickRevoke={true} onReactivate={() => props.refresh()} onRevoke={() => props.refresh()} />
                    </Grid>
                </Grid>
            );
        }
    }

    return (
        <StandardEventVisualizer
            icon={icon}
            label={eventTitle}
            description={description}
            tooltip={tooltip}
        />
    );
};
