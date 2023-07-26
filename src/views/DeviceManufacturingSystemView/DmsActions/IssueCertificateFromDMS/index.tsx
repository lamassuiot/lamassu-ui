import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, Paper, DialogContent, DialogTitle, Grid, Tooltip, Typography, useTheme, IconButton } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import * as caSelector from "ducks/features/cas/reducer";
import * as caActions from "ducks/features/cas/actions";
import * as dmsApiCalls from "ducks/features/dms-enroller/apicalls";
import { CertificateAuthority } from "ducks/features/cas/models";
import { ListWithDataController, ListWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import deepEqual from "fast-deep-equal/es6";
import Radio from "@mui/material/Radio";
import Stepper from "@mui/material/Stepper/Stepper";
import Step from "@mui/material/Step/Step";
import StepLabel from "@mui/material/StepLabel/StepLabel";
import { createPKCS10 } from "components/utils/Crypto";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import { RiShieldKeyholeLine } from "react-icons/ri";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";
import { Skeleton } from "@mui/lab";
import Box from "@mui/material/Box/Box";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import downloadFile from "components/utils/FileDownloader";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { Certificate } from "@fidm/x509";
import { DMS } from "ducks/features/dms-enroller/models";

interface Props {
    dmsName: string,
    isOpen: boolean,
    onClose: any,
    defaultCN?: string,
    onCreate?: (
        certSN: string,
        caName: string,
        certPEM: string,
    ) => void
}

export const IssueCertificateFromDMS: React.FC<Props> = ({ dmsName, defaultCN = "bootstrap", isOpen, onClose = () => { }, onCreate = () => { } }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;
    const dispatch = useDispatch();

    const caRequestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const caList = useAppSelector((state) => caSelector.getCAs(state));
    const totalCAs = useAppSelector((state) => caSelector.getTotalCAs(state));

    const signedCert = useAppSelector((state) => caSelector.getSignedCertificate(state));
    const [parsedSignedCert, setParsedSignedCert] = useState<undefined | Certificate>(undefined);

    const [dms, setDMS] = useState<undefined | DMS>();
    const [step, setStep] = useState(0);

    const [selectedCA, setSelectedCA] = useState<string | undefined>(undefined);

    const [country, setCountry] = useState<string | undefined>(undefined);
    const [state, setState] = useState<string | undefined>(undefined);
    const [city, setCity] = useState<string | undefined>(undefined);
    const [org, setOrg] = useState<string | undefined>(undefined);
    const [orgUnit, setOrgUnit] = useState<string | undefined>(undefined);
    const [cn, setCN] = useState<string>(defaultCN);

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
            label: "4096",
            value: 4096,
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

    const [keyType, setKeyType] = useState<"RSA" | "ECDSA">("RSA");
    const [keyBits, setKeyBits] = useState(rsaOptions[1]);

    const [privKeyAndCSR, setPrivKeyAndCSR] = useState<undefined | any>(undefined);

    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filter: {
                enabled: false,
                filters: []
            },
            sort: {
                enabled: true,
                selectedField: "name",
                selectedMode: "asc"
            },
            pagination: {
                enabled: true,
                options: [10, 25, 50],
                selectedItemsPerPage: 10,
                selectedPage: 0
            }
        }
    );

    const refreshAction = async () => {
        const dmsList = await dmsApiCalls.getDMSList(20, 0, "asc", "", []);
        const filteredDMSList = dmsList.dmss.filter((dms: any) => dms.name === dmsName);
        if (filteredDMSList.length === 1) {
            setDMS(filteredDMSList[0]);
            dispatch(caActions.getCAsAction.request({
                offset: tableConfig.pagination.selectedPage! * tableConfig.pagination.selectedItemsPerPage!,
                limit: tableConfig.pagination.selectedItemsPerPage!,
                sortField: tableConfig.sort.selectedField!,
                sortMode: tableConfig.sort.selectedMode!,
                filterQuery: tableConfig.filter.filters!.map((f: any) => { return f.propertyKey + "[" + f.propertyOperator + "]=" + f.propertyValue; })
            }));
        }
    };

    useEffect(() => {
        const run = async () => {
            if (step === 2) {
                const pkCsr = await createPKCS10(keyType, keyBits.value, cn, {
                    city: city,
                    country: country,
                    state: state,
                    organization: org,
                    organizationUnit: orgUnit
                });
                setPrivKeyAndCSR(pkCsr);
            } else if (step === 3) {
                dispatch(caActions.signCertAction.request({ caName: selectedCA!, csr: privKeyAndCSR.csr }));
            }
        };
        run();
    }, [step]);

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        if (signedCert !== undefined) {
            setParsedSignedCert(Certificate.fromPEM(Buffer.from(window.window.atob(signedCert), "utf8")));
        }
    }, [signedCert]);

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const casTableColumns = [
        { key: "actions", title: "", align: "start", size: 1 },
        { key: "name", title: "Name", dataKey: "ca_name", align: "center", query: true, type: "string", size: 2 },
        { key: "serialnumber", title: "Serial Number", align: "center", size: 3 },
        { key: "status", title: "Status", align: "center", size: 1 },
        { key: "keystrength", title: "Key Strength", align: "center", size: 1 },
        { key: "keyprops", title: "Key Properties", align: "center", size: 1 }
    ];

    const casRender = (ca: CertificateAuthority) => {
        return {
            actions: <Radio onClick={() => setSelectedCA(ca.name)} checked={ca.name === selectedCA} />,
            name: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{ca.name}</Typography>,
            serialnumber: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{ca.serial_number}</Typography>,
            status: <LamassuChip label={ca.status} color={ca.status_color} />,
            keystrength: <LamassuChip label={ca.key_metadata.strength} color={ca.key_metadata.strength_color} />,
            keyprops: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{`${ca.key_metadata.type} ${ca.key_metadata.bits}`}</Typography>
        };
    };

    const keyBitsOptions = keyType === "RSA" ? rsaOptions : ecOptions;

    const disableNextBtn = (step === 0 && selectedCA === undefined) || (step === 1 && cn === "");

    return (
        <Dialog open={isOpen} onClose={() => onClose()} maxWidth={"xl"}>
            <DialogTitle>Certificate Issuance</DialogTitle>
            <DialogContent>
                <Grid container style={{ marginTop: "20px" }}>
                    <Grid item xs={12}>
                        <Stepper activeStep={step} alternativeLabel>
                            {["Select CA", "Private Key & Certificate Metadata", "Issue Bootstrap Certificate", "Process completion"].map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid>
                </Grid>
                <Grid item xs={12} container sx={{ marginTop: "20px" }}>
                    {
                        step === 0 && (
                            dms === undefined
                                ? (
                                    <></>
                                )
                                : (
                                    <ListWithDataController
                                        data={caList.filter(ca => dms.identity_profile.enrollment_settings.bootstrap_cas.includes(ca.name) || dms.identity_profile.enrollment_settings.authorized_ca === ca.name)}
                                        invertContrast={true}
                                        totalDataItems={totalCAs}
                                        listConf={casTableColumns}
                                        listRender={{
                                            renderFunc: casRender,
                                            enableRowExpand: false
                                        }}
                                        isLoading={caRequestStatus.isLoading}
                                        emptyContentComponent={
                                            <Typography>No CAs</Typography>
                                        }
                                        config={tableConfig}
                                        onChange={(ev: any) => {
                                            if (!deepEqual(ev, tableConfig)) {
                                                setTableConfig(prev => ({ ...prev, ...ev }));
                                                // refreshAction();
                                            }
                                        }}
                                    />
                                )
                        )
                    }
                    {
                        step === 1 && (
                            <Grid container spacing={3} justifyContent="center" alignItems="center" >
                                <Grid item xs={6}>
                                    <FormControl variant="standard" fullWidth>
                                        <InputLabel id="pk-type-simple-select-label">Private Key Type</InputLabel>
                                        <Select
                                            labelId="pk-type-simple-select-label"
                                            id="pk-type-simple-select"
                                            label="Private Key Type"
                                            value={keyType}
                                            onChange={(ev) => {
                                                if (ev.target.value === "RSA") {
                                                    setKeyType("RSA");
                                                } else {
                                                    setKeyType("ECDSA");
                                                }
                                            }}
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
                                <Grid item xs={12}>
                                    <TextField variant="standard" fullWidth label="Common Name" value={cn} onChange={(ev) => setCN(ev.target.value)} />
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
                            </Grid>
                        )
                    }
                    {
                        step === 2 && (
                            <Grid container spacing={2} flexDirection="column">
                                {
                                    privKeyAndCSR === undefined
                                        ? (
                                            <Grid item xs={12} container>
                                                <Typography>Generating Private Key & CSR in-browser</Typography>
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                            </Grid>
                                        )
                                        : (
                                            <>
                                                {/* <Grid item xs>
                                                    <Box sx={{ background: theme.palette.primary.light, padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                                                        <Typography sx={{ color: theme.palette.primary.main, fontSize: "0.85rem" }}>The private key was generated in the browser and will not be sent nor stored in any server</Typography>
                                                    </Box>
                                                </Grid> */}

                                                <Grid item xs container spacing={2}>
                                                    <Grid item xs={6} container justifyContent={"center"} spacing={1}>
                                                        <Grid item xs="auto">
                                                            <SyntaxHighlighter language="json" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                                {privKeyAndCSR.privateKey}
                                                            </SyntaxHighlighter>
                                                        </Grid>
                                                        <Grid item xs="auto" container flexDirection={"column"} spacing={1}>
                                                            <Grid item xs="auto">
                                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                    <Tooltip title="Copy to Clipboard">
                                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText(privKeyAndCSR.privateKey); }}>
                                                                            <ContentPasteIcon fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item xs="auto">
                                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                    <Tooltip title="Download Bootstrap Certificate">
                                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile("bootstrap-" + selectedCA + ".key", privKeyAndCSR.privateKey); }}>
                                                                            <FileDownloadRoundedIcon fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>

                                                    <Grid item xs={6} container justifyContent={"center"} spacing={1}>
                                                        <Grid item xs="auto">
                                                            <SyntaxHighlighter language="json" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                                {privKeyAndCSR.csr}
                                                            </SyntaxHighlighter>
                                                        </Grid>
                                                        <Grid item xs="auto" container flexDirection={"column"} spacing={1}>
                                                            <Grid item>
                                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                    <Tooltip title="Copy to Clipboard">
                                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText(privKeyAndCSR.csr); }}>
                                                                            <ContentPasteIcon fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Grid>
                                                            <Grid item>
                                                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                    <Tooltip title="Download Bootstrap CSR">
                                                                        <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile("bootstrap-" + selectedCA + ".csr", privKeyAndCSR.csr); }}>
                                                                            <FileDownloadRoundedIcon fontSize={"small"} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Box>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </>
                                        )
                                }
                            </Grid>
                        )
                    }
                    {
                        step === 3 && (
                            <Grid container spacing={2}>
                                {
                                    parsedSignedCert === undefined
                                        ? (
                                            <Grid item xs={12} container>
                                                <Typography>Generating Private Key & CSR in-browser</Typography>
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                            </Grid>
                                        )
                                        : (
                                            <>
                                                {
                                                    caRequestStatus.type === ORequestType.Create && (
                                                        <>
                                                            {
                                                                caRequestStatus.status === ORequestStatus.Success && (
                                                                    <>
                                                                        <Grid item xs={12}>
                                                                            <Box sx={{ background: theme.palette.success.light, padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                                                                                <Typography sx={{ color: theme.palette.success.main, fontSize: "0.85rem" }}>Certificate generated successfully</Typography>
                                                                                <Typography sx={{ color: theme.palette.success.main, fontSize: "0.85rem" }}>CA: <b>{selectedCA}</b></Typography>
                                                                                <Typography sx={{ color: theme.palette.success.main, fontSize: "0.85rem" }}>Serial Number: <b>{chunk(parsedSignedCert.serialNumber, 2).join("-")}</b></Typography>
                                                                            </Box>
                                                                        </Grid>
                                                                    </>
                                                                )
                                                            }
                                                            {
                                                                caRequestStatus.status === ORequestStatus.Failed && (
                                                                    <Grid item xs={12}>
                                                                        <Box sx={{ background: theme.palette.error.light, padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                                                                            <Typography sx={{ color: theme.palette.error.main, fontSize: "0.85rem" }}>Certificate generation went wrong</Typography>
                                                                        </Box>
                                                                    </Grid>
                                                                )
                                                            }
                                                        </>
                                                    )
                                                }
                                                <Grid item xs={6} container justifyContent={"center"} spacing={1}>
                                                    <Grid item xs="auto">
                                                        <SyntaxHighlighter language="json" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                            {privKeyAndCSR.privateKey}
                                                        </SyntaxHighlighter>
                                                    </Grid>
                                                    <Grid item xs="auto" container flexDirection={"column"} spacing={1}>
                                                        <Grid item>
                                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                <Tooltip title="Copy to Clipboard">
                                                                    <IconButton onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText(privKeyAndCSR.privateKey); }}>
                                                                        <ContentPasteIcon fontSize={"small"} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </Grid>
                                                        <Grid item>
                                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                <Tooltip title="Download Bootstrap Certificate">
                                                                    <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile("bootstrap-" + selectedCA + ".key", privKeyAndCSR.privateKey); }}>
                                                                        <FileDownloadRoundedIcon fontSize={"small"} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={6} container justifyContent={"center"} spacing={1}>
                                                    {
                                                        signedCert !== undefined && (
                                                            <>
                                                                <Grid item xs="auto">
                                                                    <SyntaxHighlighter language="json" style={themeMode === "light" ? materialLight : materialOceanic} customStyle={{ fontSize: 10, padding: 20, borderRadius: 10, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                                        {window.window.atob(signedCert)}
                                                                    </SyntaxHighlighter>
                                                                </Grid>
                                                                <Grid item xs="auto" container flexDirection={"column"} spacing={1}>
                                                                    <Grid item>
                                                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                            <Tooltip title="Copy to Clipboard">
                                                                                <IconButton onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText(window.window.atob(signedCert)); }}>
                                                                                    <ContentPasteIcon fontSize={"small"} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                            <Tooltip title="Download Bootstrap CRT">
                                                                                <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile("bootstrap-" + selectedCA + ".crt", window.window.atob(signedCert)); }}>
                                                                                    <FileDownloadRoundedIcon fontSize={"small"} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </>
                                                        )
                                                    }
                                                </Grid>
                                            </>
                                        )
                                }
                            </Grid>
                        )
                    }
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container>
                    <Grid item xs>
                        <Button onClick={() => onClose()}>Cancel</Button>
                    </Grid>
                    <Grid item xs="auto" container spacing={2}>
                        <Grid item xs="auto">
                            <Button onClick={() => setStep(step - 1)} disabled={step === 0 || step === 3}>Back</Button>
                        </Grid>
                        <Grid item xs="auto">
                            <Button disabled={disableNextBtn} onClick={() => {
                                if (step < 3) {
                                    setStep(step + 1);
                                } else {
                                    onCreate(
                                        chunk(parsedSignedCert!.serialNumber, 2).join("-"),
                                        selectedCA!,
                                        signedCert!
                                    );
                                    onClose();
                                }
                            }} variant="contained">{step === 3 ? "Finish" : "Next"}</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

function chunk (str: string, n: number) {
    const ret = [];
    let i;
    let len;

    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
    }

    return ret;
};
