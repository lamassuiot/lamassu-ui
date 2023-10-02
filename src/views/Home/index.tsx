import React, { useEffect } from "react";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { DeviceStatusChart } from "./charts/DeviceStatus";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";

import * as devicesAction from "ducks/features/devices/actions";
import * as devicesSelector from "ducks/features/devices/reducer";
import * as caApicalls from "ducks/features/cav3/apicalls";
import * as dmsEnrollerAction from "ducks/features/dms-enroller/actions";
import * as dmsEnrollerSelector from "ducks/features/dms-enroller/reducer";
import { numberToHumanReadableString } from "components/utils/NumberToHumanReadableString";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import { CryptoEngineViewer } from "components/LamassuComponents/lamassu/CryptoEngineViewer";

Chart.register(...registerables);

export const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const devices = useAppSelector((state) => devicesSelector.getTotalDevices(state));
    const dmsList = useAppSelector((state) => dmsEnrollerSelector.getDMSs(state));

    const devicesRequestStatus = useAppSelector((state) => devicesSelector.getRequestStatus(state));
    const dmsRequestStatus = useAppSelector((state) => dmsEnrollerSelector.getRequestStatus(state));

    const refreshAction = () => {
        dispatch(devicesAction.getStatsAction.request({ force: false }));
        dispatch(devicesAction.getDevicesAction.request({ offset: 0, limit: 10, sortField: "id", sortMode: "asc", filterQuery: [] }));
        dispatch(dmsEnrollerAction.getDMSListAction.request({
            filterQuery: [],
            limit: 10,
            offset: 0,
            sortField: "id",
            sortMode: "asc"
        }));
    };

    useEffect(() => {
        refreshAction();
    }, []);

    const dmss = dmsList.length;

    return (
        <FetchViewer
            fetcher={() => Promise.all([caApicalls.getStats(), caApicalls.getEngines()])}
            errorPrefix={"Could not fetch CA stats"}
            renderer={(item: [caApicalls.CAStats, caApicalls.CryptoEngine[]]) => {
                const caStats = item[0];
                const engines = item[1];
                return (
                    <Box sx={{ display: "flex", padding: "30px" }}>
                        <Box sx={{ display: "flex" }}>
                            <Box component={Paper} style={{
                                borderRadius: 10,
                                padding: 20,
                                width: 300,
                                height: 550,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                flexDirection: "column",
                                background: theme.palette.homeCharts.mainCard.primary,
                                cursor: "pointer"
                            }}
                            onClick={() => navigate("/cas")}
                            >
                                <Box>
                                    <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                        <Box style={{ background: theme.palette.homeCharts.mainCard.text, borderRadius: 50, width: 50, height: 50, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <ListAltOutlinedIcon style={{ fontSize: 30, color: theme.palette.homeCharts.mainCard.primary }} />
                                        </Box>
                                    </Box>
                                    <Box style={{ marginTop: 20, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }} >
                                        <Typography variant="h3" style={{ color: theme.palette.homeCharts.mainCard.text, fontWeight: "bold" }}>{numberToHumanReadableString(caStats.certificates.total, ".")}</Typography>
                                        <Typography variant="h5" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 15 }}>Issued Certificates</Typography>
                                    </Box>
                                </Box>
                                <Box style={{ marginTop: 50, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                    <Box component={Paper} style={{
                                        background: theme.palette.homeCharts.mainCard.secondary,
                                        padding: 15,
                                        width: 250,
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        cursor: "pointer"
                                    }}
                                    onClick={(ev: any) => { ev.stopPropagation(); navigate("/cas"); }}
                                    >
                                        <Box>
                                            <Typography variant="h3" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 25 }}>{caStats.cas.total}</Typography>
                                            <Typography variant="h5" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 15 }}>Certificate Authorities</Typography>
                                        </Box>
                                        <Box>
                                            <Box style={{ background: "white", borderRadius: 50, width: 30, height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <EqualizerRoundedIcon style={{ fontSize: 25, color: theme.palette.homeCharts.mainCard.primary }} />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box component={Paper} style={{ marginTop: 10, background: theme.palette.homeCharts.mainCard.secondary, padding: 15, width: 250, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                        onClick={(ev: any) => { ev.stopPropagation(); navigate("/dms"); }}
                                    >
                                        <Box>
                                            <Typography variant="h3" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 25 }}>{dmsRequestStatus.isLoading ? "-" : numberToHumanReadableString(dmss, ".")}</Typography>
                                            <Typography variant="h5" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 15 }}>Device Manufacturing Systems</Typography>
                                        </Box>
                                        <Box>
                                            <Box style={{ background: theme.palette.homeCharts.mainCard.text, borderRadius: 50, width: 30, height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <EqualizerRoundedIcon style={{ fontSize: 25, color: theme.palette.homeCharts.mainCard.primary }} />
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box component={Paper} style={{ marginTop: 10, background: theme.palette.homeCharts.mainCard.secondary, padding: 15, width: 250, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                        onClick={(ev: any) => { ev.stopPropagation(); navigate("/devmanager"); }}>
                                        <Box>
                                            <Typography variant="h3" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 25 }}>{devicesRequestStatus.isLoading ? "-" : numberToHumanReadableString(devices, ".")}</Typography>
                                            <Typography variant="h5" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 15 }}>Devices</Typography>
                                        </Box>
                                        <Box>
                                            <Box style={{ background: "white", borderRadius: 50, width: 30, height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <EqualizerRoundedIcon style={{ fontSize: 25, color: theme.palette.homeCharts.mainCard.primary }} />
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: "flex", marginLeft: "20px" }}>
                            <Box component={Paper} style={{
                                borderRadius: 10,
                                padding: 20,
                                width: 300,
                                display: "flex",
                                flexDirection: "column",
                                background: "#265da2",
                                height: "fit-content"
                            }}
                            >
                                <Typography variant="button" fontWeight="bold" sx={{ color: theme.palette.homeCharts.deviceStatusCard.text }}>Crypto Engines</Typography>
                                <Grid container spacing={2}sx={{ marginTop: "5px" }}>
                                    {
                                        engines.map((engine, idx) => (
                                            <Grid item xs={12} key={idx}>
                                                <CryptoEngineViewer engine={engine} style={{ color: "#fff" }}/>
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </Box>
                        </Box>

                        <DeviceStatusChart style={{ marginLeft: "20px" }} />
                    </Box>
                );
            }} />
    );
};
