import React, { useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, useTheme, Tabs, Tab } from "@mui/material";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import { Link, useNavigate } from "react-router-dom";
import { DynamicIcon } from "components/IconDisplayer/DynamicIcon";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { ListWithDataController, ListWithDataControllerConfigProps, OperandTypes } from "components/LamassuComponents/Table";
import { GoLinkExternal } from "react-icons/go";
import { Device } from "ducks/features/devices/models";
import { useDispatch } from "react-redux";
import * as devicesAction from "ducks/features/devices/actions";
import * as devicesSelector from "ducks/features/devices/reducer";
import { useAppSelector } from "ducks/hooks";
import { DeviceCard } from "./components/DeviceCard";
import deepEqual from "fast-deep-equal/es6";
import TerminalIcon from "@mui/icons-material/Terminal";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { capitalizeFirstLetter } from "ducks/reducers_utils";
import moment from "moment";

export const DeviceList = () => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => devicesSelector.getRequestStatus(state));
    const deviceList = useAppSelector((state) => devicesSelector.getDevices(state));
    const totalDevices = useAppSelector((state) => devicesSelector.getTotalDevices(state));

    const [isESTDialogOpen, setIsESTDialogOpen] = useState<{ open: boolean, id: string, selectedTab: number }>({ open: false, id: "", selectedTab: 0 });
    const [isValidateCertOpen, setIsValidateCertOpen] = useState<{ open: boolean, device: Device | null }>({ open: false, device: null });

    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filter: {
                enabled: true,
                filters: []
            },
            sort: {
                enabled: true,
                selectedField: "id",
                selectedMode: "asc"
            },
            pagination: {
                enabled: true,
                options: [50, 75, 100],
                selectedItemsPerPage: 50,
                selectedPage: 0
            }
        }
    );

    const refreshAction = () => dispatch(devicesAction.getDevicesAction.request({
        offset: tableConfig.pagination.selectedPage! * tableConfig.pagination.selectedItemsPerPage!,
        limit: tableConfig.pagination.selectedItemsPerPage!,
        sortField: tableConfig.sort.selectedField!,
        sortMode: tableConfig.sort.selectedMode!,
        filterQuery: tableConfig.filter.filters!.map((f:any) => { return f.propertyKey + "[" + f.propertyOperator + "]=" + f.propertyValue; })
    }));

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const devicesTableColumns = [
        { key: "icon", title: "", align: "start", size: 1 },
        { key: "id", dataKey: "id", title: "Device ID", query: true, type: OperandTypes.string, align: "start", size: 4 },
        { key: "alias", dataKey: "alias", title: "Alias", query: true, type: OperandTypes.string, align: "center", size: 3 },
        { key: "status", dataKey: "status", title: "Status", type: OperandTypes.enum, align: "center", size: 2 },
        { key: "creation_timestamp", dataKey: "creation_timestamp", title: "Creation Date", type: OperandTypes.date, align: "center", size: 2 },
        { key: "slots", dataKey: "slots", title: "Slots", align: "center", size: 3 },
        { key: "tags", dataKey: "tags", title: "Tags", type: OperandTypes.enum, align: "center", size: 2 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const deviceRender = (device: Device) => {
        const dmsContent = device.dms_name;
        console.log(device);
        return {
            icon: (
                <Box component={Paper} sx={{ padding: "5px", background: device.icon_color_bg, borderRadius: 2, width: 20, height: 20, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <DynamicIcon icon={device.icon_name} size={16} color={device.icon_color_fg} />
                </Box>
            ),
            id: <Typography style={{ fontWeight: "700", fontSize: 14, color: theme.palette.text.primary }}>#{device.id}</Typography>,
            alias: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{device.alias}</Typography>,
            status: <LamassuChip label={capitalizeFirstLetter(device.status)} color={device.status_color} />,
            creation_timestamp: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{moment(device.creation_timestamp).format("DD/MM/YYYY HH:mm")}</Typography>,
            dms: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{dmsContent}</Typography>,
            slots: (
                <Grid item xs={12} container spacing={1} justifyContent="center">
                    {
                        device.slots.map((slot, idx) => (
                            <Grid item key={idx}>
                                <LamassuChip color={slot.active_certificate.status_color} label={"slot " + slot.id} compact={true} compactFontSize />
                            </Grid>
                        ))
                    }
                </Grid>
            ),
            tags: (
                <Grid item xs={12} container spacing={1} justifyContent="center">
                    {
                        device.tags.map((tag, idx) => (
                            <Grid item key={idx}>
                                <LamassuChip color={theme.palette.mode === "dark" ? ["#EEE", "#555"] : ["#555", "#EEEEEE"]} label={tag} compact={true} compactFontSize />
                            </Grid>
                        ))
                    }
                </Grid>
            ),
            actions: (
                <Box>
                    <Grid container spacing={1}>
                        <Grid item container spacing={2}>
                            <Grid item>
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <IconButton onClick={() => {
                                        if (device.slots.length > 1) {
                                            navigate(device.id);
                                        } else if (device.slots.length === 1) {
                                            navigate(device.id + "/" + device.slots[0].id);
                                        } else {
                                            navigate(device.id);
                                        }
                                    }}>
                                        <FormatAlignJustifyIcon fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <IconButton onClick={() => setIsESTDialogOpen({ open: true, id: device.id, selectedTab: 0 })}>
                                        <TerminalIcon fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Grid>
                            <Grid item>
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <IconButton onClick={() => setIsValidateCertOpen({ open: true, device: device })} sx={{}}>
                                        <FactCheckOutlinedIcon fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            )
        };
    };

    const renderCardDevice = (device: Device) => {
        return (
            <Link to={device.id} style={{ textDecoration: "none" }}>
                <DeviceCard style={{ cursor: "pointer" }} device={device} />
            </Link>
        );
    };

    return (
        <Box sx={{ padding: "20px", height: "calc(100% - 40px)" }}>
            <ListWithDataController
                data={deviceList}
                totalDataItems={totalDevices}
                listConf={devicesTableColumns}
                cardView={{
                    enabled: true,
                    renderDataItem: renderCardDevice
                }}
                listRender={{
                    renderFunc: deviceRender,
                    enableRowExpand: false
                }}
                isLoading={requestStatus.isLoading}
                withAdd={() => { navigate("create"); }}
                emptyContentComponent={
                    <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>
                        <Grid item xs="auto" container justifyContent={"center"} alignItems={"center"} flexDirection="column">
                            <img src={process.env.PUBLIC_URL + "/assets/icon-iot.png"} height={150} style={{ marginBottom: "25px" }} />
                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>
                                Enroll your first IoT Device
                            </Typography>
                            <Typography>Manage the enrollment process of your devices by registering and enrolling using the EST protocol</Typography>
                            <Button
                                endIcon={<GoLinkExternal />}
                                variant="contained"
                                sx={{ marginTop: "10px", color: theme.palette.primary.main, background: theme.palette.primary.light }}
                                onClick={() => {
                                    window.open("https://www.lamassu.io/docs/usage/#provision-your-devices-with-x509-certificates", "_blank");
                                }}
                            >
                                Go to Device enrollment instructions
                            </Button>
                        </Grid>
                    </Grid>
                }
                config={tableConfig}
                onChange={(ev: any) => {
                    if (!deepEqual(ev, tableConfig)) {
                        setTableConfig(prev => ({ ...prev, ...ev }));
                        // refreshAction();
                    }
                }}
                withRefresh={() => { refreshAction(); }}
                tableProps={{
                    component: Paper,
                    style: {
                        padding: "30px",
                        width: "calc(100% - 60px)"
                    }
                }}
            />
            {
                isESTDialogOpen.open && (
                    <Dialog open={isESTDialogOpen.open} onClose={() => setIsESTDialogOpen({ open: false, id: "", selectedTab: 0 })} maxWidth={"xl"}>
                        <DialogTitle>Enroll over Secure Transport</DialogTitle>
                        <DialogContent>
                            <Tabs variant="fullWidth" value={isESTDialogOpen.selectedTab} onChange={(ev, newValue) => setIsESTDialogOpen((prev: any) => ({ ...prev, selectedTab: newValue }))}>
                                <Tab label="Enroll" />
                                <Tab label="Re-enroll" />
                            </Tabs>
                            <Grid container>
                                {
                                    isESTDialogOpen.selectedTab === 0 && (
                                        <Grid item xs={12}>
                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px" color="primary">Step 1</Typography>
                                                Define the Device Manager EST server and the credentials to be used during the enrollment process performed in step 6. Those credentials are one of your DMS instances key and cert files:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {"export DEVICE_MANAGER_EST_SERVER=dev.lamassu.io:443 \nexport DMS_CRT=your_dms.crt \nexport DMS_KEY=your_dms.key"}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 2</Typography>
                                                Obtain the Root certificate used by the server:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {"openssl s_client -connect $DEVICE_MANAGER_EST_SERVER 2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem"}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 3</Typography>
                                                Obtain the available CA certs:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {
                                                    "curl https://$DEVICE_MANAGER_EST_SERVER/api/devmanager/.well-known/est/cacerts -o cacerts.p7 --cacert root-ca.pem \nopenssl base64 -d -in cacerts.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out cacerts.pem"
                                                }
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px" color="primary">Step 4</Typography>
                                                Select the CA to enroll. Note that the APS variable must contain the Common Name of one of the previously obtained CAs. Also, the DMS credentials used during the enrollment (Step 6) will only be valid for a subset of those CAs. Contact the PKI administrator for more information:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {"export APS=test"}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 5</Typography>
                                                Create a CSR request:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {`openssl req -new -newkey rsa:2048 -nodes -keyout device-${isESTDialogOpen.id}.key -out device-${isESTDialogOpen.id}.csr -subj "/CN=${isESTDialogOpen.id}"`}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 6</Typography>
                                                Request a certificate from the EST server:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {`curl https://$DEVICE_MANAGER_EST_SERVER/api/devmanager/.well-known/est/$APS/simpleenroll --cert $DMS_CRT --key $DMS_KEY -s -o cert.p7 --cacert root-ca.pem  --data-binary @device-${isESTDialogOpen.id}.csr -H "Content-Type: application/pkcs10" \nopenssl base64 -d -in cert.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out cert.pem \nopenssl x509 -text -in cert.pem`}
                                            </SyntaxHighlighter>
                                        </Grid>
                                    )
                                }
                                {
                                    isESTDialogOpen.selectedTab === 1 && (
                                        <Grid item xs={12}>
                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px" color="primary">Step 1</Typography>
                                                Define the Device Manager EST server as well as the device certificate and its private key to be used during the re-enrollment process performed in step 6:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {`export DEVICE_MANAGER_EST_SERVER=dev.lamassu.io:443 \nexport DEVICE_CRT=device-${isESTDialogOpen.id}.crt \nexport DEVICE_KEY=device-${isESTDialogOpen.id}.key`}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 2</Typography>
                                                Obtain the Root certificate used by the server:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {"openssl s_client -connect $DEVICE_MANAGER_EST_SERVER 2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem"}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 2</Typography>
                                                Generate the new device CSR. Note that you can optionally create a new private key:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {`openssl x509 -x509toreq -in $DEVICE_CRT -signkey $DEVICE_KEY |  sed -ne '/-BEGIN CERTIFICATE REQUEST-/,/-END CERTIFICATE REQUEST-/p' > device-${isESTDialogOpen.id}.csr`}
                                            </SyntaxHighlighter>

                                            <Typography>
                                                <Typography variant="button" fontWeight="bold" marginRight="10px">Step 3</Typography>
                                                Re-enroll the device:
                                            </Typography>
                                            <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                {`curl https://$DEVICE_MANAGER_EST_SERVER/api/devmanager/.well-known/est/$APS/simplereenroll --cert $DEVICE_CRT --key $DEVICE_KEY -s -o cert.p7 --cacert root-ca.pem  --data-binary @device-${isESTDialogOpen.id}.csr -H "Content-Type: application/pkcs10" \nopenssl base64 -d -in cert.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out cert.pem \nopenssl x509 -text -in cert.pem`}
                                            </SyntaxHighlighter>
                                        </Grid>
                                    )
                                }
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setIsESTDialogOpen({ open: false, id: "", selectedTab: 0 })} variant="contained">Close</Button>
                        </DialogActions>
                    </Dialog>
                )
            }
            {
                isValidateCertOpen.open && (
                    <Dialog open={isValidateCertOpen.open} onClose={() => setIsValidateCertOpen({ open: false, device: null })} maxWidth={"md"}>
                        <DialogTitle>Validate the device certificate</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Run the following commands to validate the device certificate using the Online Certificate Status Protocol
                            </DialogContentText>
                            <Grid container style={{ marginTop: "10px" }}>
                                <Grid item xs={12}>
                                    <Typography>
                                        <Typography variant="button" fontWeight="bold" marginRight="10px" color="primary">Step 1</Typography>
                                        Define the OCSP server to be used as well as the certificate file to check and its issuer certificate:
                                    </Typography>
                                    <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                        {"export OCSP_SERVER=dev.lamassu.io:443 \nexport CA_CERTIFICATE=issuer_ca.crt \nexport DEVICE_CERTIFICATE=device.crt"}
                                    </SyntaxHighlighter>

                                    <Typography>
                                        <Typography variant="button" fontWeight="bold" marginRight="10px">Step 2</Typography>
                                        Obtain the Root certificate used by the server:
                                    </Typography>
                                    <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                        {"openssl s_client -connect $OCSP_SERVER  2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem"}
                                    </SyntaxHighlighter>

                                    <Typography>
                                        <Typography variant="button" fontWeight="bold" marginRight="10px">Step 3</Typography>
                                        Check the status of the certificate
                                    </Typography>
                                    <SyntaxHighlighter language="markdown" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 11, padding: "10px 20px 10px 20px", borderRadius: 10, width: "calc(100% - 40px)", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                        {"openssl ocsp -issuer ca.crt \\\n   -issuer $CA_CERTIFICATE \\\n   -cert $DEVICE_CERTIFICATE \\\n   -CAfile root-ca.pem \\\n   -VAfile root-ca.pem \\\n   -url https://$OCSP_SERVER/api/ocsp/"}
                                    </SyntaxHighlighter>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setIsValidateCertOpen({ open: false, device: null })} variant="contained">Close</Button>
                        </DialogActions>
                    </Dialog>
                )
            }
        </Box>
    );
};
