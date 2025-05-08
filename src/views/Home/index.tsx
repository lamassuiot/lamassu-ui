import { Box, Paper, Typography, useTheme } from "@mui/material";
import { CAStats, CryptoEngine } from "ducks/features/cas/models";
import { Chart, registerables } from "chart.js";
import { CryptoEngineViewer } from "components/CryptoEngines/CryptoEngineViewer";
import { DMSStats } from "ducks/features/dmss/models";
import { DeviceStats } from "ducks/features/devices/models";
import { DeviceStatusChart } from "./DeviceStatusChart";
import { FetchViewer } from "components/FetchViewer";
import { numberToHumanReadableString } from "utils/string-utils";
import { useNavigate } from "react-router-dom";
import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import Grid from "@mui/material/Unstable_Grid2";
import ListAltOutlinedIcon from "@mui/icons-material/ListAltOutlined";
import React from "react";
import apicalls from "ducks/apicalls";

Chart.register(...registerables);

type HomeProps = {
    isMenuCollapsed?: boolean;
}

export const Home: React.FC<HomeProps> = ({ isMenuCollapsed = false }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <FetchViewer
            fetcher={() => Promise.all([
                apicalls.cas.getStats(),
                apicalls.dmss.getStats(),
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
                    <Grid
                        container
                        spacing={2}
                        sx={{
                            padding: {
                                xs: "20px 60px",
                                sm: "20px 60px",
                                md: "20px",
                                lg: isMenuCollapsed ? "20px 50px" : "20px",
                                xl: isMenuCollapsed ? "20px 50px" : "20px"
                            }
                        }}
                    >
                        <Grid xs={12} md={3} lg={4}>
                            <Box sx={{ display: "flex" }}>
                                <Box component={Paper} style={{
                                    borderRadius: 10,
                                    padding: 20,
                                    width: "100%",
                                    height: 550,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    flexDirection: "column",
                                    background: theme.palette.primary.main,
                                    cursor: "pointer"
                                }}
                                onClick={() => navigate("/cas")}
                                >
                                    <Box>
                                        <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
                                            <Box style={{ background: theme.palette.primary.contrastText, borderRadius: 50, width: 50, height: 50, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                <ListAltOutlinedIcon style={{ fontSize: 30, color: theme.palette.primary.main }} />
                                            </Box>
                                        </Box>
                                        <Box style={{ marginTop: 20, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }} >
                                            <Typography style={{ color: theme.palette.primary.contrastText, fontWeight: "bold", fontSize: "3rem" }}>{numberToHumanReadableString(caStats.certificates.total, ".")}</Typography>
                                            <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 15 }}>Issued Certificates</Typography>
                                        </Box>
                                    </Box>
                                    <Box style={{ marginTop: 50, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", width: "100%" }}>
                                        <Box component={Paper}
                                            style={{
                                                background: theme.palette.primary.light,
                                                padding: 15,
                                                width: "80%",
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                cursor: "pointer"
                                            }}
                                            onClick={(ev: any) => { ev.stopPropagation(); navigate("/cas"); }}
                                        >
                                            <Box>
                                                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 25 }}>{caStats.cas.total}</Typography>
                                                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 15 }}>Certificate Authorities</Typography>
                                            </Box>
                                            <Box>
                                                <Box style={{ background: "white", borderRadius: 50, width: 30, height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <EqualizerRoundedIcon style={{ fontSize: 25, color: theme.palette.primary.main }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box component={Paper} style={{ marginTop: 10, background: theme.palette.primary.light, padding: 15, width: "80%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                            onClick={(ev: any) => { ev.stopPropagation(); navigate("/dms"); }}
                                        >
                                            <Box>
                                                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 25 }}>{numberToHumanReadableString(dmsStats.total, ".")}</Typography>
                                                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 15 }}>Device Manufacturing Systems</Typography>
                                            </Box>
                                            <Box>
                                                <Box style={{ background: theme.palette.primary.contrastText, borderRadius: 50, width: 30, height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <EqualizerRoundedIcon style={{ fontSize: 25, color: theme.palette.primary.main }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box component={Paper} style={{ marginTop: 10, background: theme.palette.primary.light, padding: 15, width: "80%", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                                            onClick={(ev: any) => { ev.stopPropagation(); navigate("/devices"); }}>
                                            <Box>
                                                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 25 }}>{numberToHumanReadableString(deviceStats.total, ".")}</Typography>
                                                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: 15 }}>Devices</Typography>
                                            </Box>
                                            <Box>
                                                <Box style={{ background: "white", borderRadius: 50, width: 30, height: 30, display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                    <EqualizerRoundedIcon style={{ fontSize: 25, color: theme.palette.primary.main }} />
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid xs={12} md={4} lg={4}>
                            <Box sx={{ display: "flex" }}>
                                <Box component={Paper} style={{
                                    borderRadius: 10,
                                    padding: 20,
                                    width: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    background: "#265da2",
                                    height: "fit-content"
                                }}
                                >
                                    <Typography variant="button" fontWeight="bold" sx={{ color: theme.palette.primary.contrastText }}>Crypto Engines</Typography>
                                    <Grid container spacing={2} sx={{ marginTop: "5px" }}>
                                        {
                                            engines.map((engine, idx) => (
                                                <Grid xs={12} key={idx}>
                                                    <CryptoEngineViewer engine={engine} style={{ color: "#fff" }} />
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>
                        <Grid xs={12} md={4} lg={4}>
                            <DeviceStatusChart deviceStats={deviceStats} />
                        </Grid>
                    </Grid>
                );
            }} />
    );
};
