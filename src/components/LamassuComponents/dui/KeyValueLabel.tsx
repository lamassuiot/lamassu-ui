
import React from "react";
import { Grid, Tooltip, Typography, useTheme } from "@mui/material";
import Label from "./typographies/Label";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";

interface KeyValueLabelProps {
    label: string
    tooltip?: string | React.ReactNode
    value: string | React.ReactNode
}

const KeyValueLabel: React.FC<KeyValueLabelProps> = ({ label, tooltip, value }) => {
    const theme = useTheme();
    return (
        <Grid container flexDirection={"column"}>
            <Grid item container alignItems={"center"}>
                <Grid item xs="auto">
                    <Label>{label}</Label>
                </Grid>
                {
                    tooltip && (
                        <Grid item xs="auto">
                            <Tooltip title={tooltip} sx={{}}>
                                <HelpOutlinedIcon sx={{ fontSize: "16px", marginLeft: "5px", color: "#555" }} />
                            </Tooltip>
                        </Grid>
                    )
                }
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
