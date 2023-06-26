import React, { useEffect, useState } from "react";

import { Button, FormControl, Grid, InputAdornment, InputLabel, MenuItem, Select, TextField, Typography, useTheme } from "@mui/material";
import { RiShieldKeyholeLine } from "react-icons/ri";
import LoadingButton from "@mui/lab/LoadingButton";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import SyntaxHighlighter from "react-syntax-highlighter";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import downloadFile from "components/utils/FileDownloader";
import { useAppSelector } from "ducks/hooks";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import * as dmsAction from "ducks/features/dms-enroller/actions";
import { ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { useDispatch } from "react-redux";
import * as caSelector from "ducks/features/cas/reducer";
import { BootstrapDMS } from "./Bootstrap";
import { LamassuSwitch } from "components/LamassuComponents/Switch";

export const CreateDms = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => dmsSelector.getRequestStatus(state)!);
    const privateKey = useAppSelector((state) => dmsSelector.getLastCreatedDMSPrivateKey(state)!);

    const rsaOptions = [
        {
            label: "2048",
            value: 2048,
            color: theme.palette.warning.main
        },
        {
            label: "3072",
            value: 3072,
            color: theme.palette.success.main
        },
        {
            label: "7680",
            value: 7680,
            color: theme.palette.success.main
        }
    ];

    const ecOptions = [
        {
            label: "224",
            value: 224,
            color: theme.palette.warning.main
        },
        {
            label: "256",
            value: 256,
            color: theme.palette.success.main
        },
        {
            label: "384",
            value: 384,
            color: theme.palette.success.main
        }
    ];

    const [displayPrivKeyView, setDisplayPrivKeyView] = useState(false);
    const caList = useAppSelector((state) => caSelector.getCAs(state));
    const totalCAs = useAppSelector((state) => caSelector.getTotalCAs(state));

    useEffect(() => {
        if (requestStatus.status === ORequestStatus.Success && requestStatus.type === ORequestType.Create) {
            setDisplayPrivKeyView(true);
        }
    }, [requestStatus]);

    const handleCreateDms = () => {
        dispatch(dmsAction.createDMSWithFormAction.request({
            form: {
                subject: {
                    common_name: cn,
                    country: country,
                    locality: city,
                    organization: org,
                    organization_unit: orgUnit,
                    state: state
                },
                key_metadata: {
                    bits: keyBits.value,
                    type: keyType
                },
                host_cloud_dms: hostCloudDMS,
                bootstrap_cas: selectedBootstrapCAs
            }
        }));
    };

    const [hostCloudDMS, setHostCloudDMS] = useState(false);
    const [selectedBootstrapCAs, setSelectedBootstrapCAs] = useState<Array<string>>([]);
    const [dmsName, setDmsName] = useState("");
    const [country, setCountry] = useState("");
    const [state, setState] = useState("");
    const [city, setCity] = useState("");
    const [org, setOrg] = useState("");
    const [orgUnit, setOrgUnit] = useState("");
    const [cn, setCN] = useState("");
    const [keyType, setKeyType] = useState<"RSA" | "ECDSA">("RSA");
    const [keyBits, setKeyBits] = useState(rsaOptions[1]);
    const handleChangeBootstrap = (event: React.ChangeEvent<HTMLInputElement>) => {
        setHostCloudDMS(event.target.checked);
    };

    const updateSelectedBootstrapCAs = (bootstrap_cas: any) => {
        setSelectedBootstrapCAs(bootstrap_cas);
    };

    useEffect(() => {
        setCN(dmsName);
    }, [dmsName]);

    useEffect(() => {
        if (keyType === "RSA") {
            setKeyBits(rsaOptions[1]);
        } else {
            setKeyBits(ecOptions[1]);
        }
    }, [keyType]);

    const keyBitsOptions = keyType === "RSA" ? rsaOptions : ecOptions;
    const disabledCreateDmsButton = cn === "" || dmsName === "" || (hostCloudDMS && selectedBootstrapCAs.length === 0);

    return (
        displayPrivKeyView === false
            ? (
                <Grid container spacing={2} justifyContent="center" alignItems="center">
                    <Grid item xs={12}>
                        <TextField variant="standard" fullWidth label="Device Manufacturing System Name" required value={dmsName} onChange={(ev) => { setDmsName(ev.target.value); } } />
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel id="pk-type-simple-select-label">Private Key Type</InputLabel>
                            <Select
                                labelId="pk-type-simple-select-label"
                                id="pk-type-simple-select"
                                label="Private Key Type"
                                value={keyType}
                                onChange={(ev: any) => setKeyType(ev.target.value)}
                            >
                                <MenuItem value="RSA">RSA</MenuItem>
                                <MenuItem value="ECDSA">ECDSA</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl variant="standard" fullWidth>
                            <InputLabel id="pk-length-simple-select-label">Private Key Length</InputLabel>
                            <Select
                                labelId="pk-length-simple-select-label"
                                id="pk-length-simple-select"
                                label="Private Key Length"
                                value={keyBits.value}
                                onChange={(ev) => {
                                    setKeyBits(keyBitsOptions.filter(option => option.value === ev.target.value)[0]);
                                }}
                                endAdornment={
                                    <InputAdornment position="end" style={{ marginRight: "25px" }}>
                                        <RiShieldKeyholeLine color={keyBits ? keyBits.color : ""} />
                                    </InputAdornment>
                                }
                                sx={{ color: keyBits ? keyBits.color : "" }}
                            >
                                {
                                    keyBitsOptions.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)
                                }
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={4}>
                        <TextField variant="standard" fullWidth label="Country" value={country} onChange={(ev) => setCountry(ev.target.value)} />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField variant="standard" fullWidth label="State/Province" value={state} onChange={(ev) => setState(ev.target.value)} />
                    </Grid>
                    <Grid item xs={4}>
                        <TextField variant="standard" fullWidth label="Locality" value={city} onChange={(ev) => setCity(ev.target.value)} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField variant="standard" fullWidth label="Organization" value={org} onChange={(ev) => setOrg(ev.target.value)} />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField variant="standard" fullWidth label="Organization Unit" value={orgUnit} onChange={(ev) => setOrgUnit(ev.target.value)} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField variant="standard" fullWidth label="Common Name" required value={cn} onChange={(ev) => setCN(ev.target.value)} disabled />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>Lamassu Hosted DMS - Use Bootstrap CAs</Typography>
                        <LamassuSwitch checked={hostCloudDMS} onChange={handleChangeBootstrap} />
                    </Grid>
                    { hostCloudDMS && (
                        <Grid item xs={12}>
                            <Typography>Assign multiple Bootstrap CAs to authenticate a device when enrolling.</Typography>
                            <BootstrapDMS onClose={() => { setHostCloudDMS(false); }} childToParent={updateSelectedBootstrapCAs}/>
                        </Grid>
                    )}

                    <Grid item xs={12} spacing={4} container>
                        <Grid item container alignItems="center" spacing={4}>
                            <Grid item container>
                                <LoadingButton
                                    variant="contained"
                                    endIcon={<AddIcon />}
                                    onClick={() => { handleCreateDms(); }}
                                    loading={requestStatus.status === ORequestStatus.Pending && requestStatus.type === ORequestType.Create}
                                    loadingPosition="end"
                                    disabled={disabledCreateDmsButton}
                                >
                                Create DMS
                                </LoadingButton>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            )
            : (
                <Grid item container>

                    <Grid item xs={6} spacing={2} container flexDirection="column" >
                        <Grid item>
                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>Save the Private Key</Typography>
                        </Grid>
                        <Grid item>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>Once you exit this window, you will no longer be able to obtain the private key. Save the private key first</Typography>
                        </Grid>
                        <Grid item container sx={{ width: "100%" }} spacing={2}>
                            <Grid item >
                                <Button variant="outlined" onClick={() => { downloadFile("dms-" + dmsName + ".key", window.atob(privateKey)); }}>Download Private Key</Button>
                            </Grid>
                            <Grid item>
                                <Button variant="contained" onClick={() => { navigate("/dms"); }}>Go Back</Button>
                            </Grid>
                        </Grid>
                        <Grid item container sx={{ width: "100%" }} spacing={1}>
                            <SyntaxHighlighter language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                {privateKey !== undefined ? window.atob(privateKey) : ""}
                            </SyntaxHighlighter>
                        </Grid>
                    </Grid>
                </Grid>
            )

    );
};
