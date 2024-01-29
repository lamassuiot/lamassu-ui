import React from "react";
import { Box, Grid, Paper, Typography, useTheme } from "@mui/material";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import { useNavigate } from "react-router-dom";
import { Chart, registerables } from "chart.js";
import { DeviceStatusChart } from "./charts/DeviceStatus";
import { useDispatch } from "react-redux";

import { numberToHumanReadableString } from "components/utils/NumberToHumanReadableString";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import { CryptoEngineViewer } from "components/LamassuComponents/lamassu/CryptoEngineViewer";
import { CAStats, CryptoEngine } from "ducks/features/cav3/models";
import { apicalls } from "ducks/apicalls";
import { DMSStats } from "ducks/features/ra/models";
import { DeviceStats } from "ducks/features/devices/models";

Chart.register(...registerables);

export const Home = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <FetchViewer
            fetcher={() => Promise.all([
                apicalls.cas.getStats(),
                apicalls.dms.getStats(),
                apicalls.devices.getStats(),
                apicalls.cas.getEngines()
            ])}
            errorPrefix={"Could not fetch CA stats"}
            renderer={(item: [CAStats, DMSStats, DeviceStats, CryptoEngine[]]) => {
                const caStats = item[0];
                const dmsStats = item[1];
                const deviceStats = item[2];
                const engines = item[3];
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
                                            <Typography variant="h3" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 25 }}>{numberToHumanReadableString(dmsStats.total, ".")}</Typography>
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
                                            <Typography variant="h3" style={{ color: theme.palette.homeCharts.mainCard.text, fontSize: 25 }}>{numberToHumanReadableString(deviceStats.total, ".")}</Typography>
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
                                width: 400,
                                display: "flex",
                                flexDirection: "column",
                                background: "#265da2",
                                height: "fit-content"
                            }}
                            >
                                <Typography variant="button" fontWeight="bold" sx={{ color: theme.palette.homeCharts.deviceStatusCard.text }}>Crypto Engines</Typography>
                                <Grid container spacing={2} sx={{ marginTop: "5px" }}>
                                    {
                                        engines.map((engine, idx) => (
                                            <Grid item xs={12} key={idx}>
                                                <CryptoEngineViewer engine={engine} style={{ color: "#fff" }} />
                                            </Grid>
                                        ))
                                    }
                                </Grid>
                            </Box>
                        </Box>
                        <DeviceStatusChart deviceStats={deviceStats} style={{ marginLeft: "20px" }} />
                    </Box>
                );
            }} />
    );
};
