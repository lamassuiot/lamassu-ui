import { Box, Divider, Grid, Paper, Typography, useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import { apicalls } from "ducks/apicalls";
import { LamassuChip } from "components/LamassuComponents/Chip";
import moment from "moment";

type ServiceInfo = {
    name: string
    version: string
    build_time: string
    build: string
    loading: boolean
}

export const InfoView = () => {
    const theme = useTheme();

    const [servicesInfo, setServicesInfo] = useState<Array<ServiceInfo>>([]);

    const refreshAction = async () => {
        const services = [
            { name: "CA", fetcher: apicalls.cas.getApiInfo },
            { name: "DMS Manager", fetcher: apicalls.dms.getApiInfo },
            { name: "Device Manager", fetcher: apicalls.devices.getApiInfo },
            { name: "Alerts", fetcher: apicalls.alerts.getApiInfo }
        ];

        const initSvc : Array<ServiceInfo> = [];
        for (let i = 0; i < services.length; i++) {
            const svc = services[i];
            initSvc.push({
                name: svc.name,
                build: "-",
                build_time: "-",
                version: "-",
                loading: true
            });
        }

        setServicesInfo([...initSvc]);

        for (let i = 0; i < services.length; i++) {
            const svc = services[i];
            const fetcher = svc.fetcher;
            const apiInfo = await fetcher();
            initSvc[i] = {
                name: initSvc[i].name,
                build: apiInfo.build,
                build_time: apiInfo.build_time,
                version: apiInfo.version,
                loading: false
            };

            setServicesInfo([...initSvc]);
        }
    };

    useEffect(() => {
        refreshAction();
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Grid sx={{ overflowY: "auto", flexGrow: 1, height: "300px" }} component={Paper}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box style={{ padding: "40px" }}>
                        <Grid container spacing={3} flexDirection={"column"}>
                            <Grid item container>
                                <Grid item>
                                    <Typography style={{ color: theme.palette.primary.main, fontWeight: "500", fontSize: 30, lineHeight: "24px", marginRight: "10px" }}>UI</Typography>
                                </Grid>

                                <Grid item container spacing={0} justifyContent="space-between">
                                    <Grid item xs={6}>
                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Version</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <LamassuChip color={"blue"} label={window._env_.INFO.UI_VERSION} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Build Time</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>
                                            {moment(window._env_.INFO.BUILD_TIME).format("DD-MM-YYYY HH:mm")}
                                        </Typography>
                                        <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "400", fontSize: 11 }}>
                                            {moment(window._env_.INFO.BUILD_TIME).fromNow(false)}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Build ID</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>{window._env_.INFO.BUILD_ID}</Typography>
                                    </Grid>
                                    {
                                        window._env_.INFO.CHART_VERSION && (
                                            <>
                                                <Grid item xs={6}>
                                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Helm Chart Version</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>{window._env_.INFO.CHART_VERSION}</Typography>
                                                </Grid>
                                            </>
                                        )
                                    }
                                    {
                                        window._env_.INFO.HELM_REVISION && (
                                            <>
                                                <Grid item xs={6}>
                                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Helm Chart Revision</Typography>
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>{window._env_.INFO.HELM_REVISION}</Typography>
                                                </Grid>
                                            </>
                                        )
                                    }
                                </Grid>

                                <Grid item container sx={{ marginBottom: "10px" }}>
                                    <Divider sx={{ marginTop: "20px", width: "100%" }} />
                                </Grid>
                            </Grid>
                            {
                                servicesInfo.map((si, idx) => (
                                    <Grid key={idx} item container spacing={0} flexDirection={"column"}>
                                        <Grid item container spacing={1} justifyContent="flex-start">
                                            <Grid item xs={12}>
                                                <Box style={{ display: "flex", alignItems: "center" }}>
                                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{si.name}</Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>

                                        <Grid item container spacing={1} justifyContent="space-between">
                                            <Grid item xs={6}>
                                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Version</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <LamassuChip color={"blue"} label={si.version} />
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Build Time</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>
                                                    {moment(si.build_time).format("DD-MM-YYYY HH:mm")}
                                                </Typography>
                                                <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "400", fontSize: 11 }}>
                                                    {moment(si.build_time).fromNow(false)}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>Build ID</Typography>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Typography style={{ color: theme.palette.text.primaryLight, fontWeight: "500", fontSize: 13 }}>{si.build}</Typography>
                                            </Grid>
                                        </Grid>

                                        <Grid item sx={{ marginBottom: "10px" }}>
                                            <Divider sx={{ marginTop: "20px" }} />
                                        </Grid>

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
