
import React from "react";
import { Grid, Typography, useTheme } from "@mui/material";
import Label from "./typographies/Label";

interface KeyValueLabelProps {
    label: string
    value: string | React.ReactNode
}

const KeyValueLabel: React.FC<KeyValueLabelProps> = ({ label, value }) => {
    const theme = useTheme();
    return (
        <Grid container flexDirection={"column"}>
            <Grid item>
                <Label>{label}</Label>
            </Grid>
            <Grid item>
                {
                    typeof value === "string"
                        ? (
                            <Typography>{value}</Typography>
                        )
                        : value
                }
            </Grid>
        </Grid>
    );
};

export { KeyValueLabel }; export type { KeyValueLabelProps };
