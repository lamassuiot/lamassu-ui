import { Box, Divider, Grid, Paper, Typography, useTheme } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import * as cloudProxyAction from "ducks/features/cloud-proxy/actions";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
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
    const cloudProxyApiInfo = useAppSelector((state) => cloudProxySelector.getInfo(state));
    const alertsApiInfo = useAppSelector((state) => alertsSelector.getInfo(state));
    const caApiInfo = useAppSelector((state) => caSelector.getInfo(state));
    const caCryptoEngine = useAppSelector((state) => caSelector.getCryptoEngine(state));

    const refreshAction = () => {
        dispatch(caAction.getInfoAction.request());
        dispatch(caAction.getCryptoEngineAction.request());
        dispatch(devicesAction.getInfoAction.request());
        dispatch(alertsAction.getInfoAction.request());
        dispatch(dmsEnrollerAction.getInfoAction.request());
        dispatch(cloudProxyAction.getInfoAction.request());
    };

    useEffect(() => {
        refreshAction();
    }, []);

    let crypyoEngineManufacturerImage = "";
    switch (caCryptoEngine.type.toLowerCase()) {
    case "softhsm":
        crypyoEngineManufacturerImage = "assets/softhsm.png";
        break;

    case "vault":
        crypyoEngineManufacturerImage = "assets/vault.png";
        break;

    case "golang":
        crypyoEngineManufacturerImage = "assets/golang.png";
        break;
    case "aws":
        crypyoEngineManufacturerImage = "assets/AWS.png";
        break;

    default:
        crypyoEngineManufacturerImage = "assets/AWS.png";
        break;
    }

    const caInfo: Array<[string, any]> = [
        ["Build Version", caApiInfo.build_version],
        ["Build Time", caApiInfo.build_time],
        ["Certificate Engine Provider", caCryptoEngine.provider]
    ];
    if (caCryptoEngine.supported_key_types.filter(key => key.type === "RSA").length > 0) {
        const rsaInfo = caCryptoEngine.supported_key_types.filter(key => key.type === "RSA")[0];

        caInfo.push(["RSA Supported", true]);
        caInfo.push(["RSA Minimum Key Size (bits)", rsaInfo.minimum_size]);
        caInfo.push(["RSA Maximum Key Size (bits)", rsaInfo.maximum_size]);
    } else {
        caInfo.push(["RSA Supported", false]);
    }

    if (caCryptoEngine.supported_key_types.filter(key => key.type === "ECDSA").length > 0) {
        const ecdsaInfo = caCryptoEngine.supported_key_types.filter(key => key.type === "ECDSA")[0];
        caInfo.push(["ECDSA Supported", true]);
        caInfo.push(["ECDSA Minimum Key Size (bits)", ecdsaInfo.minimum_size]);
        caInfo.push(["ECDSA Maximum Key Size (bits)", ecdsaInfo.maximum_size]);
    } else {
        caInfo.push(["ECDSA Supported", false]);
    }

    const dmsInfo: Array<[string, any]> = [
        ["Build Version", dmsManagerApiInfo.build_version],
        ["Build Time", dmsManagerApiInfo.build_time]
    ];

    const deviceManagerInfo: Array<[string, any]> = [
        ["Build Version", deviceManagerApiInfo.build_version],
        ["Build Time", deviceManagerApiInfo.build_time]
    ];

    const cloudProxyInfo: Array<[string, any]> = [
        ["Build Version", cloudProxyApiInfo.build_version],
        ["Build Time", cloudProxyApiInfo.build_time]
    ];

    const alertsInfo: Array<[string, any]> = [
        ["Build Version", alertsApiInfo.build_version],
        ["Build Time", alertsApiInfo.build_time]
    ];

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Grid sx={{ overflowY: "auto", flexGrow: 1, height: "300px" }} component={Paper}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box style={{ padding: "40px" }}>
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={12}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>CA</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid sx={{ marginBottom: "20px" }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Version, Build number, and other information regarding Lamassu CA API</Typography>
                        </Grid>

                        <Box component={Paper} sx={{
                            height: "75px",
                            width: "150px",
                            backgroundImage: "url('" + crypyoEngineManufacturerImage + "')",
                            backgroundSize: "contain",
                            backgroundPosition: "center",
                            backgroundRepeat: "no-repeat",
                            marginBottom: "20px"
                        }} />

                        {
                            caInfo.map((info: any, index: number) => {
                                return (
                                    <Grid key={index} item container spacing={2} justifyContent="space-between">
                                        <Grid item xs={6}>
                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 13, marginTop: "10px" }}>{info[0]}</Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            {
                                                typeof info[1] === "boolean" && (
                                                    info[1] === true
                                                        ? (
                                                            <CheckCircleIcon htmlColor={theme.palette.success.main} />
                                                        )
                                                        : (
                                                            <CancelIcon htmlColor={theme.palette.error.main} />
                                                        )
                                                )
                                            }
                                            {
                                                (typeof info[1] === "string" || typeof info[1] === "number") && (
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
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={12}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>DMS Enroller</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid sx={{ marginBottom: "10px" }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Version, Build number, and other information regarding Lamassu DMS Enroller API</Typography>
                        </Grid>
                        {
                            dmsInfo.map((info: any, index: number) => {
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
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={12}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Device Manager</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid sx={{ marginBottom: "10px" }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Version, Build number, and other information regarding Lamassu Device Manager API</Typography>
                        </Grid>
                        {
                            deviceManagerInfo.map((info: any, index: number) => {
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
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={12}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Cloud Proxy</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid sx={{ marginBottom: "10px" }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Version, Build number, and other information regarding Lamassu Cloud Proxy API</Typography>
                        </Grid>
                        {
                            cloudProxyInfo.map((info: any, index: number) => {
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
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={12}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Alerts</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid sx={{ marginBottom: "10px" }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Version, Build number, and other information regarding Lamassu Alerts API</Typography>
                        </Grid>
                        {
                            alertsInfo.map((info: any, index: number) => {
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
                    </Box>
                </Box>
            </Grid>
        </Box>
    );
};
