import Typography from "@mui/material/Typography";
import { Box, Paper, Grid, useTheme } from "@mui/material";
import React, { ReactElement } from "react";

interface props {
    title: string | ReactElement,
    subtitle: string | ReactElement,
}

export const FormattedView: React.FC<props> = ({ title, subtitle, ...rest }) => {
    const theme = useTheme();
    return (
        <Box sx={{ height: "100%" }} component={Paper}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "40px 40px 0 40px" }}>
                    <Grid item container spacing={2} flexDirection="column">
                        <Grid item container>
                            <Grid item container spacing={2} justifyContent="flex-start">
                                <Grid item xs={12}>
                                    <Box style={{ display: "flex", alignItems: "center" }}>
                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{title}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                            <Grid>
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>{subtitle}</Typography>
                            </Grid>
                        </Grid>
                        <Grid item container>
                            {rest.children}
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};
