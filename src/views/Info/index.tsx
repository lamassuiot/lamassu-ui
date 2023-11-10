import { Box, Divider, Grid, Paper, Typography, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const InfoView = () => {
    const theme = useTheme();

    const dispatch = useDispatch();

    const refreshAction = () => {
        // dispatch(alertsAction.getInfoAction.request());
    };

    useEffect(() => {
        refreshAction();
    }, []);

    const alertsInfo: Array<[string, any]> = [
        ["Build Version", "-1"],
        ["Build Time", "-1"]
    ];

    const servicesInfo = [
        { service: "Alerts", info: alertsInfo }
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Grid sx={{ overflowY: "auto", flexGrow: 1, height: "300px" }} component={Paper}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box style={{ padding: "40px" }}>
                        <Grid container spacing={2} flexDirection={"column"}>
                            {
                                servicesInfo.map((si, idx) => (
                                    <Grid key={idx} item container>
                                        <Grid item container spacing={2} justifyContent="flex-start">
                                            <Grid item xs={12}>
                                                <Box style={{ display: "flex", alignItems: "center" }}>
                                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{si.service}</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                        <Grid sx={{ marginBottom: "10px" }}>
                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Version, Build number, and other information regarding Lamassu Alerts API</Typography>
                                        </Grid>
                                        {
                                            si.info.map((info: any, index: number) => {
                                                return (
                                                    <Grid key={index} item container spacing={2} justifyContent="space-between">
                                                        <Grid item xs={6}>
                                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>{info[0]}</Typography>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            {
                                                                typeof info[1] === "boolean" && (
                                                                    <CheckCircleIcon htmlColor={theme.palette.success.main} />
                                                                )
                                                            }
                                                            {
                                                                typeof info[1] === "string" && (
                                                                    <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>
                                                                        {info[1]}
                                                                    </Typography>
                                                                )
                                                            }
                                                        </Grid>
                                                    </Grid>
                                                );
                                            })
                                        }

                                        <Divider sx={{ marginTop: "20px", marginBottom: "20px" }} />
                                    </Grid>
                                ))
                            }
                        </Grid>

                    </Box>
                </Box>
            </Grid>
        </Box>
    );
};
