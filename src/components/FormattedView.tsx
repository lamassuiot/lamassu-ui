import { Box, Paper, useTheme } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { ReactElement, ReactNode } from "react";
import Typography from "@mui/material/Typography";

interface props {
    title: string | ReactElement,
    subtitle: string | ReactElement,
    children?: ReactNode;
    actions?: ReactNode;
}

export const FormattedView: React.FC<props> = ({ title, subtitle, ...rest }) => {
    const theme = useTheme();
    return (
        <Box sx={{ height: "100%" }} component={Paper} borderRadius={0}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Grid container spacing={2} flexDirection="column" flexWrap={"nowrap"} flexGrow={1} sx={{ height: "100%" }}>
                    <Grid>
                        <Box sx={{ padding: "40px 40px 0 40px" }}>
                            <Grid container>
                                <Grid xs container spacing={1} justifyContent="flex-start">
                                    <Grid xs={12}>
                                        <Typography variant="h3">{title}</Typography>
                                    </Grid>
                                    <Grid xs={12}>
                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>{subtitle}</Typography>
                                    </Grid>
                                </Grid>
                                {
                                    rest.actions && (
                                        <Grid xs="auto">
                                            {rest.actions}
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid sx={{ height: "100%", padding: "10px" }}>
                        <Box style={{ /* flexGrow: 1, */ height: "100%", display: "flex", flexDirection: "column" }}>
                            <Grid container flexDirection={"column"} sx={{ height: "50px", flexGrow: 1, overflowY: "auto", flexWrap: "nowrap" }} >
                                <Grid container paddingX={"40px"}>
                                    {rest.children}
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};
