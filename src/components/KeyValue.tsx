import { Tooltip, Typography, useTheme } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import React from "react";

interface KeyValueLabelProps {
    label: string | React.ReactNode
    tooltip?: string | React.ReactNode
    value: string | React.ReactNode
}

const KeyValueLabel: React.FC<KeyValueLabelProps> = ({ label, tooltip, value }) => {
    const theme = useTheme();
    return (
        <Grid container flexDirection={"column"}>
            <Grid container alignItems={"center"}>
                <Grid xs="auto">
                    {
                        typeof label === "string"
                            ? (
                                <Typography>{label}</Typography>
                            )
                            : label
                    }
                </Grid>
                {
                    tooltip && (
                        <Grid xs="auto">
                            <Tooltip title={tooltip} sx={{}}>
                                <HelpOutlinedIcon sx={{ fontSize: "16px", marginLeft: "5px", color: "#555" }} />
                            </Tooltip>
                        </Grid>
                    )
                }
            </Grid>
            <Grid>
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
