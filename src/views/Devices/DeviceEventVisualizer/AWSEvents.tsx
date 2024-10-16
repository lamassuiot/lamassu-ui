import { DeviceEvent, DeviceEventType } from "ducks/features/devices/models";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import Label from "components/Label";

export const getAWSEventVisualizerData = (event: DeviceEvent) => {
    let description: string | React.ReactNode = event.description;

    const icon: React.ReactNode = (
        <Grid container spacing={1} alignItems={"center"}>
            <Grid xs="auto">
                <img src={process.env.PUBLIC_URL + "/assets/AWS-logo.png"} alt="AWS" style={{ width: "35px", height: "35px" }} />
            </Grid>
            {
                event.type === DeviceEventType.ShadowUpdated && (
                    <>
                        {
                            event.description.includes("Device ACK")
                                ? (
                                    <Grid xs="auto">
                                        <RouterOutlinedIcon sx={{ fontSize: "30px" }} />
                                    </Grid>
                                )
                                : (
                                    <Grid xs="auto">
                                        <img src={process.env.PUBLIC_URL + "/assets/lamassu/lamassu_logo_blue.svg"} alt="LAMASSU" style={{ width: "30px", height: "30px", marginLeft: "5px" }} />
                                    </Grid>
                                )
                        }
                    </>
                )
            }

        </Grid>
    );

    const getEventTitle = (event: DeviceEvent) => {
        let eventTitle: string = event.type;
        switch (event.type) {
        case DeviceEventType.ShadowUpdated:
            eventTitle = "Shadow Update";
            break;
        case DeviceEventType.ConnectionUpdated: {
            const principalID = event.structured_fields.principal_identifier;
            description = (
                <Grid container spacing={0} alignItems={"center"}>
                    <Grid xs={12}>
                        {
                            principalID.length < 25 && (
                                <Label size="small" color={"black"}>Backend - {principalID}</Label>
                            )
                        }
                    </Grid>
                    <Grid xs={12}>
                        <p>{event.description}</p>
                    </Grid>
                </Grid>
            );
            break;
        }
        }
        return eventTitle;
    };

    return {
        label: getEventTitle(event),
        description,
        icon,
        tooltip: undefined
    };
};
