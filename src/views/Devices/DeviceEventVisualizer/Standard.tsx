import { Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import { KeyValueLabel } from "components/KeyValue";

interface Props {
    icon?: React.ReactNode;
    label: string;
    description?: string | React.ReactNode;
    tooltip?: string;
}

export const StandardEventVisualizer: React.FC<Props> = (props) => {
    const theme = useTheme();

    return (
        <Grid container>
            <Grid xs={12} container spacing={1} alignItems={"center"}>
                {
                    props.icon && (
                        <Grid xs="auto">
                            {props.icon}
                        </Grid>
                    )
                }
                <Grid xs>
                    <KeyValueLabel
                        label={
                            <Typography fontSize="12px" fontWeight="600" color={"primary"}>{props.label}</Typography>
                        }
                        value={<></>
                        }
                        tooltip={props.tooltip}
                    />
                </Grid>
            </Grid>
            <Grid xs={12}>
                <Typography fontSize="12px" fontWeight="400">{props.description}</Typography>
            </Grid >
        </Grid >
    );
};
