import React, { useEffect, useState, useRef } from "react";
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField, useTheme, Button, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import * as caSelector from "ducks/features/cas/reducer";
import * as caActions from "ducks/features/cas/actions";
import { useAppSelector } from "ducks/hooks";
import { useDispatch } from "react-redux";
import * as cloudProxyActions from "ducks/features/cloud-proxy/actions";
import * as cloudProxySelector from "ducks/features/cloud-proxy/reducer";
import { CloudProviderIcon } from "components/CloudProviderIcons";
import { LamassuStatusChip } from "components/LamassuComponents/Chip";
import { LamassuSwitch } from "components/LamassuComponents/Switch";
import { CloudConnector } from "ducks/features/cloud-proxy/models";
import { LamassuTable } from "components/LamassuComponents/Table";
import { Certificate, PrivateKey } from "@fidm/x509";
import { TransitionGroup } from "react-transition-group";

export const ImportCA = () => {
    const containerRef = React.useRef(null);

    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const cloudProxyRequestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const caRequestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const cloudConnectors = useAppSelector((state) => cloudProxySelector.getCloudConnectors(state)!);

    useEffect(() => {
        dispatch(cloudProxyActions.getConnectorsAction.request());
    }, []);

    const [selectedCloudConnectors, setSelectedCloudConnectors] = useState<Array<string>>([]);

    const [caName, setCaName] = useState("");
    const [ttlValue, setTtlValue] = useState(365);
    const [ttlUnit, setTtlUnit] = useState(24);// 24 = days | 24*365 = years
    const [caCertPem, setCaCertPem] = useState("");
    const [caCert, setCaCert] = useState<Certificate>();
    const [validCrt, setValidCrt] = useState(false);
    const [caKey, setcaKey] = useState("");
    const [validKey, setValidKey] = useState(false);

    const inputFileRef = useRef<any>();
    const inputFileRef2 = useRef<any>();

    const onFileChange = (e: any, setter: any) => {
        /* Selected files data can be collected here. */
        const files = e.target.files;
        if (files.length > 0) {
            const reader = new FileReader();
            reader.readAsText(files[0], "UTF-8");
            reader.onload = (evt) => {
                if (evt !== null && evt.target !== null) {
                    const content = evt.target.result;
                    setter(content);
                }
            };
        } else {
            console.log("Nofile");
        }
        inputFileRef.current.value = "";
    };

    const cloudConnectorsColumnConf = [
        { key: "settings", title: "", align: "start", size: 1 },
        { key: "connectorId", title: "Connector ID", align: "center", size: 2 },
        { key: "connectorStatus", title: "Status", align: "center", size: 2 },
        { key: "connectorAlias", title: "Connector Name", align: "center", size: 2 },
        { key: "connectorAttached", title: "Attached", align: "center", size: 1 }
    ];

    useEffect(() => {
        try {
            const crt = Certificate.fromPEM(Buffer.from(caCertPem, "utf8"));
            setCaName(crt.subject.commonName);
            setValidCrt(true);
            setCaCert(crt);
        } catch (error) {
            setCaName("");
            setValidCrt(true);
            setCaCert(undefined);
        }
    }, [caCertPem]);

    useEffect(() => {
        try {
            const key = PrivateKey.fromPEM(Buffer.from(caCertPem, "utf8"));
            setValidKey(true);
        } catch (error) {
            console.log(error);
        }
    }, [caKey]);

    const cloudConnectorRender = (cloudConnector: CloudConnector) => {
        return {
            settings: (
                <LamassuSwitch value={selectedCloudConnectors.includes(cloudConnector.id)} onChange={() => {
                    setSelectedCloudConnectors(prev => {
                        if (prev.includes(cloudConnector.id)) {
                            prev.splice(prev.indexOf(cloudConnector.id), 1);
                        } else {
                            prev.push(cloudConnector.id);
                        }
                        return prev;
                    });
                }} />
            ),
            connectorId: <Typography style={{ fontWeight: "700", fontSize: 14, color: theme.palette.text.primary }}>#{cloudConnector.id}</Typography>,
            connectorStatus: (
                <LamassuStatusChip label={cloudConnector.status} color={cloudConnector.status_color} />
            ),
            connectorAlias: (
                <Box>
                    <Grid container spacing={1} alignItems="center">
                        <Grid item>
                            <CloudProviderIcon cloudProvider={cloudConnector.cloud_provider} />
                        </Grid>
                        <Grid item>
                            <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>{cloudConnector.name}</Typography>
                        </Grid>
                    </Grid>
                </Box>
            ),
            connectorAttached: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{"-"}</Typography>
        };
    };

    return (

        <Grid container spacing={3} ref={containerRef} >
            <Grid item xs={6}>
                <TextField disabled variant="standard" id="caName" label="CA Name" fullWidth value={caName} onChange={(ev) => { setCaName(ev.target.value); }} />
            </Grid>
            <Grid item xs={6} container spacing={2}>
                <Grid item xs={6} container>
                    <TextField variant="standard" id="ttl" label="Issuance expiration time" type="number" fullWidth value={ttlValue} onChange={ev => { setTtlValue(parseInt(ev.target.value)); }} />
                </Grid>
                <Grid item xs={6} container>
                    <FormControl fullWidth variant="standard">
                        <InputLabel id="key-type-label" >Issuance expiration time units</InputLabel>
                        <Select
                            labelId="ttl-unit-label"
                            value={ttlUnit}
                            onChange={ev => { setTtlUnit(parseInt(ev.target.value + "")); }}
                        >
                            <MenuItem value={1}>Hours</MenuItem>
                            <MenuItem value={24}>Days</MenuItem>
                            <MenuItem value={24 * 365}>Years</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Grid item xs={6} container justifyContent={"center"} alignItems="center" spacing={4}>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => { inputFileRef2.current.click(); }}
                    >
                        Select Certificate
                    </Button>
                    <input
                        type="file"
                        ref={inputFileRef2}
                        hidden
                        onChange={(ev) => onFileChange(ev, setCaCertPem)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="Certificate content"
                        multiline
                        rows={15}
                        inputProps={{ style: { fontSize: 12, fontFamily: "monospace" } }}
                        variant="outlined"
                        fullWidth
                        value={caCertPem}
                        onChange={(ev) => { setCaCertPem(ev.target.value); }}
                    />
                </Grid>

            </Grid>
            <Grid item xs={6} container justifyContent={"center"} alignItems="center" spacing={4}>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => { inputFileRef.current.click(); }}
                    >
                        Select Private key
                    </Button>
                    <input
                        type="file"
                        ref={inputFileRef}
                        hidden
                        onChange={(ev) => onFileChange(ev, setcaKey)}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        id="standard-multiline-flexible"
                        label="Private key content"
                        multiline
                        rows={15}
                        inputProps={{ style: { fontSize: 12, fontFamily: "monospace" } }}
                        variant="outlined"
                        fullWidth
                        value={caKey}
                        onChange={(ev) => { setcaKey(ev.target.value); }}
                    />
                </Grid>
            </Grid>
            <Grid item xs={6} >
                <TransitionGroup direction="up" in={caCert !== undefined} container={containerRef.current} style={{ width: "100%" }}>
                    {
                        caCert && (
                            <Box sx={{ background: theme.palette.mode === "light" ? "#F2f2f2" : "#263238", padding: "20px", borderRadius: "10px" }} >
                                <Box sx={{ marginBottom: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Country (C)</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{caCert.subject.countryName}</Typography>
                                </Box>
                                <Box sx={{ marginBottom: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>State (ST)</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{caCert ? caCert!.subject.attributes.find(attr => attr.shortName === "ST")?.value : "-"}</Typography>
                                </Box>
                                <Box sx={{ marginBottom: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Locality (L)</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{caCert.subject.localityName}</Typography>
                                </Box>
                                <Box sx={{ marginBottom: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Organization (O)</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{caCert.subject.organizationName}</Typography>
                                </Box>
                                <Box sx={{ marginBottom: "15px" }}>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>organizational Unit (OU)</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{caCert.subject.organizationalUnitName}</Typography>
                                </Box>
                                <Box >
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Common Name (CN)</Typography>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{caCert.subject.commonName}</Typography>
                                </Box>
                            </Box>
                        )
                    }
                </TransitionGroup>
            </Grid>

            <Grid item container>
                <LamassuTable columnConf={cloudConnectorsColumnConf} data={cloudConnectors} renderDataItem={cloudConnectorRender} />
            </Grid>
            <Grid item container>
                <Button variant="contained" disabled={!validCrt || /*! validKey || */ caName === ""} onClick={() => {
                    dispatch(caActions.importCAAction.request({
                        caName: caName,
                        certificateB64: window.btoa(caCertPem),
                        privatekeyB64: window.btoa(caKey),
                        enroller_ttl: ttlValue * ttlUnit,
                        selectedConnectorIDs: selectedCloudConnectors
                    }));
                }}>Import CA</Button>
            </Grid>
        </Grid>

    );
};
