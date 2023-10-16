import { Box, Divider, Grid, Paper, Typography, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import * as alertsAction from "ducks/features/alerts/actions";
import * as alertsSelector from "ducks/features/alerts/reducer";
import * as devicesAction from "ducks/features/devices/actions";
import * as devicesSelector from "ducks/features/devices/reducer";
import * as caAction from "ducks/features/cas/actions";
import * as caSelector from "ducks/features/cas/reducer";
import * as dmsEnrollerAction from "ducks/features/dms-enroller/actions";
import * as dmsEnrollerSelector from "ducks/features/dms-enroller/reducer";

export const InfoView = () => {
    const theme = useTheme();

    const dispatch = useDispatch();

    const dmsManagerApiInfo = useAppSelector((state) => dmsEnrollerSelector.getInfo(state));
    const deviceManagerApiInfo = useAppSelector((state) => devicesSelector.getInfo(state));
    const alertsApiInfo = useAppSelector((state) => alertsSelector.getInfo(state));
    const caApiInfo = useAppSelector((state) => caSelector.getInfo(state));

    const refreshAction = () => {
        dispatch(caAction.getInfoAction.request());
        dispatch(devicesAction.getInfoAction.request());
        dispatch(alertsAction.getInfoAction.request());
        dispatch(dmsEnrollerAction.getInfoAction.request());
    };

    useEffect(() => {
        refreshAction();
    }, []);

    const caInfo: Array<[string, any]> = [
        ["Build Version", caApiInfo.build_version],
        ["Build Time", caApiInfo.build_time]
    ];

    const dmsInfo: Array<[string, any]> = [
        ["Build Version", dmsManagerApiInfo.build_version],
        ["Build Time", dmsManagerApiInfo.build_time]
    ];

    const deviceManagerInfo: Array<[string, any]> = [
        ["Build Version", deviceManagerApiInfo.build_version],
        ["Build Time", deviceManagerApiInfo.build_time]
    ];

    const alertsInfo: Array<[string, any]> = [
        ["Build Version", alertsApiInfo.build_version],
        ["Build Time", alertsApiInfo.build_time]
    ];

    const servicesInfo = [
        { service: "Certificate Authority", info: caInfo },
        { service: "Validation Authority", info: caInfo },
        { service: "DMS Manager Service", info: dmsInfo },
        { service: "Device Manager Service", info: deviceManagerInfo },
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
