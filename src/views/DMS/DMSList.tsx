import { Alert, Box, Collapse, IconButton, Paper, Skeleton, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import { CAFetchViewer } from "components/CAs/CAStandardFetchViewer";
import { CASelector } from "components/CAs/CASelector";
import { Certificate, CertificateAuthority } from "ducks/features/cas/models";
import { CodeCopier } from "components/CodeCopier";
import { DMS } from "ducks/features/dmss/models";
import { FetchHandle } from "components/TableFetcherView";
import { FetchViewer } from "components/FetchViewer";
import { IOSSwitch } from "components/Switch";
import { IconInput } from "components/IconInput";
import { KeyValueLabel } from "components/KeyValue";
import { ListResponse, errorToString } from "ducks/services/api-client";
import { StepModal } from "components/StepModal";
import { TextField } from "components/TextField";
import { createCSR, createPrivateKey, keyPairToPEM } from "utils/crypto/csr";
import { useNavigate } from "react-router-dom";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import TerminalIcon from "@mui/icons-material/Terminal";
import apicalls from "ducks/apicalls";

export const DMSListView = () => {
    const theme = useTheme();
    const [query, setQuery] = useState({ field: "id", value: "" });
    const navigate = useNavigate();

    const tableRef = React.useRef<FetchHandle>(null);

    return (
        <Box padding={"30px 30px"}>
            <Grid container flexDirection={"column"} spacing={"20px"}>
                <Grid container spacing={1}>
                    <Grid xs="auto">
                        <Tooltip title="Reload DMS List">
                            <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => {
                                tableRef.current?.refresh();
                            }}>
                                <RefreshIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid xs="auto">
                        <Tooltip title="Add New DMS">
                            <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => { navigate("create"); }}>
                                <AddIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid xs>
                    <FetchViewer
                        fetcher={(controller) => { return apicalls.dmss.getDMSs({ pageSize: 15, bookmark: "" }); }}
                        renderer={(list: ListResponse<DMS>) => {
                            return (
                                <Grid container spacing={2}>
                                    {
                                        list.list.map((dms) => {
                                            return (
                                                <Grid key={dms.id} xs={12} >
                                                    <DMSCardRenderer dms={dms} />
                                                </Grid>
                                            );
                                        })
                                    }
                                </Grid>
                            );
                        }}
                        ref={tableRef}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

interface DMSCardRendererProps {
    dms: DMS
}

const DMSCardRenderer: React.FC<DMSCardRendererProps> = ({ dms }) => {
    const theme = useTheme();

    const navigate = useNavigate();

    const [enrollDMSCmds, setEnrollDMSCmds] = useState<{
        open: boolean,
        dmsName: string,
        deviceID: string,
        bootstrapCA: CertificateAuthority | undefined,
        commonNameBootstrap: string,
        insecure: boolean,
    }>({ open: false, dmsName: "", bootstrapCA: undefined, deviceID: "", insecure: false, commonNameBootstrap: "" });

    const [expanded, setExpanded] = useState(false);

    const splitColors = dms.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-");
    let iconBG = "";
    let iconFG = "";
    if (splitColors.length === 2) {
        iconBG = splitColors[0];
        iconFG = splitColors[1];
    }

    return (
        <>
            <Box component={Paper} padding={"10px"}>
                <Grid container flexDirection={"column"} spacing={1}>
                    <Grid container spacing={1} flexDirection={"column"}>
                        <Grid container spacing={1}>
                            <Grid xs container spacing={1}>
                                <Grid>
                                    <IconInput readonly label="" size={35} value={{ bg: iconBG, fg: iconFG, name: dms.settings.enrollment_settings.device_provisioning_profile.icon }} />
                                </Grid>
                                <Grid xs container flexDirection={"column"}>
                                    <Grid>
                                        <Typography>{dms.name}</Typography>
                                        <Label color={"grey"}>{dms.id}</Label>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid xs="auto" container spacing={"20px"}>
                                <Grid xs="auto" container spacing={1}>
                                    <Grid xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <Tooltip title="Watch DMS Devices">
                                                <IconButton onClick={(ev) => { navigate(`/devices?filter=dms_owner[equal]${dms.id}`); }}>
                                                    <RouterOutlinedIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid xs="auto" container spacing={1}>
                                    <Grid xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <Tooltip title="CA Certificates">
                                                <IconButton onClick={(ev) => { navigate(`${dms.id}/cacerts`); }}>
                                                    <AccountBalanceOutlinedIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    <Grid xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <Tooltip title="cURL enrollment commands">
                                                <IconButton onClick={(ev) => { setEnrollDMSCmds({ open: true, dmsName: dms.id, insecure: false, bootstrapCA: undefined, commonNameBootstrap: `bootstrap-for-dms-${dms.id}`, deviceID: "" }); }}>
                                                    <TerminalIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid xs="auto" container spacing={1}>
                                    <Grid xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                            <Tooltip title="Edit">
                                                <IconButton onClick={(ev) => { navigate(`${dms.id}/edit`); }}>
                                                    <EditIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid>
                                    {/* <Grid xs="auto">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <Tooltip title="Delete">
                                                <IconButton onClick={(ev) => { navigate(`${dms.id}/edit`); }}>
                                                    <DeleteIcon fontSize={"small"} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </Grid> */}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container spacing={1} flexDirection={"column"}>
                            <Grid>
                                <Box onClick={() => {
                                    setExpanded(!expanded);
                                }} sx={{ cursor: "pointer", background: theme.palette.mode === "dark" ? "#30444f" : "#ddd", borderRadius: "3px" }}>
                                    <Typography fontSize={"12px"} textAlign={"center"}>
                                        {">> Click to see more options <<"}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Box sx={{ padding: "10px" }}>
                                <Collapse in={expanded}>
                                    <Grid container spacing={1} flexDirection={"column"}>
                                        <Grid>
                                            <Label color={"primary"}>Enrollment Settings</Label>
                                        </Grid>

                                        <Grid>
                                            <KeyValueLabel
                                                label="EST Enrollment Endpoint"
                                                value={
                                                    <Typography style={{ color: theme.palette.text.primary, fontSize: 12 }}>{"https://" + window.location.hostname + "/api/dmsmanager/.well-known/est/" + dms.id + "/simpleenroll"}</Typography>
                                                }
                                            />
                                        </Grid>
                                        <Grid>
                                            <KeyValueLabel
                                                label="Enrollment CA"
                                                value={
                                                    <CAFetchViewer id={dms.settings.enrollment_settings.enrollment_ca} />
                                                }
                                            />
                                        </Grid>
                                        <Grid>
                                            <KeyValueLabel
                                                label="Validation CAs"
                                                value={
                                                    <Grid container flexDirection={"column"} spacing={1}>
                                                        {
                                                            dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.map((caID, idx) => {
                                                                return (
                                                                    <Grid xs key={idx}>
                                                                        <CAFetchViewer id={caID} />
                                                                    </Grid>
                                                                );
                                                            })
                                                        }
                                                    </Grid>
                                                }
                                            />
                                        </Grid>

                                        <Grid container spacing={2}>
                                            <Grid xs={6} md>
                                                <KeyValueLabel
                                                    label="Authentication Mode"
                                                    value={
                                                        <Label color={"grey"}>{dms.settings.enrollment_settings.est_rfc7030_settings.auth_mode}</Label>
                                                    }
                                                />
                                            </Grid>

                                            <Grid xs={6} md>
                                                <KeyValueLabel
                                                    label="Registration Mode"
                                                    value={
                                                        <Label color={"grey"}>{dms.settings.enrollment_settings.registration_mode}</Label>
                                                    }
                                                />
                                            </Grid>

                                            <Grid xs={6} md>
                                                <KeyValueLabel
                                                    label="Allow Override Enrollment"
                                                    value={
                                                        dms.settings.enrollment_settings.enable_replaceable_enrollment
                                                            ? (
                                                                <Box sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    borderRadius: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    background: lighten(theme.palette.info.light, 0.5)
                                                                }}>
                                                                    <CheckIcon sx={{ color: theme.palette.info.light, fontSize: "12px" }} />
                                                                </Box>
                                                            )
                                                            : (
                                                                <CloseIcon sx={{ color: theme.palette.grey[500] }} />
                                                            )
                                                    }
                                                />
                                            </Grid>

                                            <Grid xs={6} md>
                                                <KeyValueLabel
                                                    label="Chain Validation"
                                                    value={
                                                        <Label>{`${dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.chain_level_validation} LEVELS`} </Label>
                                                    }
                                                />
                                            </Grid>

                                        </Grid>

                                        <Grid container spacing={1} flexDirection={"column"}>
                                            <Grid>
                                                <Label color={"primary"}>Re-Enrollment Settings</Label>
                                            </Grid>

                                            <Grid>
                                                <KeyValueLabel
                                                    label="EST ReEnrollment Endpoint"
                                                    value={
                                                        <Typography style={{ color: theme.palette.text.primary, fontSize: 12 }}>{"https://" + window.location.hostname + "/api/dmsmanager/.well-known/est/" + dms.id + "/simplereenroll"}</Typography>
                                                    }
                                                />
                                            </Grid>

                                        </Grid>
                                        <Grid>
                                            <KeyValueLabel
                                                label="Additional Validation CAs"
                                                value={
                                                    <Grid container flexDirection={"column"} spacing={1}>
                                                        {
                                                            dms.settings.reenrollment_settings.additional_validation_cas.map((caID, idx) => {
                                                                return (
                                                                    <Grid xs key={idx}>
                                                                        <CAFetchViewer id={caID} />
                                                                    </Grid>
                                                                );
                                                            })
                                                        }
                                                    </Grid>
                                                }
                                            />
                                        </Grid>

                                        <Grid container spacing={2}>
                                            <Grid xs>
                                                <KeyValueLabel
                                                    label="Allowed Renewal Delta"
                                                    value={
                                                        <Label color={"grey"}>{dms.settings.reenrollment_settings.reenrollment_delta} </Label>
                                                    }
                                                />
                                            </Grid>

                                            <Grid xs>
                                                <KeyValueLabel
                                                    label="Allow Expired Renewal"
                                                    value={
                                                        dms.settings.reenrollment_settings.enable_expired_renewal
                                                            ? (
                                                                <Box sx={{
                                                                    width: "30px",
                                                                    height: "30px",
                                                                    borderRadius: "100%",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    background: lighten(theme.palette.info.light, 0.5)
                                                                }}>
                                                                    <CheckIcon sx={{ color: theme.palette.info.light, fontSize: "12px" }} />
                                                                </Box>
                                                            )
                                                            : (
                                                                <CloseIcon sx={{ color: theme.palette.grey[500] }} />
                                                            )
                                                    }
                                                />
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Collapse>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            {
                enrollDMSCmds.open && (
                    <StepModal
                        open={enrollDMSCmds.open}
                        onClose={() => setEnrollDMSCmds({ ...enrollDMSCmds, open: false })}
                        title="EST Enroll"
                        size="lg"
                        steps={[
                            {
                                title: "Define Device to Enroll",
                                subtitle: "",
                                content: (
                                    <TextField fullWidth label="Device ID" onChange={(ev) => setEnrollDMSCmds({ ...enrollDMSCmds, deviceID: ev.target.value })} />
                                )
                            },
                            {
                                title: "Generate Device CSR",
                                subtitle: "",
                                content: (
                                    <CodeCopier code={
                                        `openssl req -new -newkey rsa:2048 -nodes -keyout ${enrollDMSCmds.deviceID}.key -out ${enrollDMSCmds.deviceID}.csr -subj "/CN=${enrollDMSCmds.deviceID}"\ncat ${enrollDMSCmds.deviceID}.csr | sed '/-----BEGIN CERTIFICATE REQUEST-----/d'  | sed '/-----END CERTIFICATE REQUEST-----/d' > ${enrollDMSCmds.deviceID}.stripped.csr`
                                    } />
                                )
                            },
                            {
                                title: "Define Bootstrap Certificate Props",
                                subtitle: "",
                                content: (
                                    <Grid container flexDirection={"column"} spacing={2}>
                                        <Grid xs>
                                            <TextField label="Bootstrap Certificate Common Name" value={enrollDMSCmds.commonNameBootstrap} onChange={(ev) => setEnrollDMSCmds({ ...enrollDMSCmds, commonNameBootstrap: ev.target.value })} />
                                        </Grid>
                                        <Grid xs>
                                            <CASelector limitSelection={dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas} multiple={false} label="Bootstrap Signer" value={enrollDMSCmds.bootstrapCA} onSelect={(ca) => {
                                                if (!Array.isArray(ca)) {
                                                    setEnrollDMSCmds({ ...enrollDMSCmds, bootstrapCA: ca });
                                                }
                                            }} />
                                        </Grid>
                                    </Grid>
                                )
                            },
                            {
                                title: "Bootstrap Certificate & Key",
                                subtitle: "",
                                content: (
                                    <BootstrapGenerator ca={enrollDMSCmds.bootstrapCA!} cn={enrollDMSCmds.commonNameBootstrap} />
                                )
                            },
                            {
                                title: "Enroll commands",
                                subtitle: "",
                                content: (
                                    <Grid container flexDirection={"column"} spacing={2}>
                                        <Grid xs>
                                            <Typography>
                                                In order to enroll, the client must decide wether to validate the server or skip the TLS verification:
                                            </Typography>
                                            <KeyValueLabel label="Validate Server (OFF) / Insecure (ON)" value={
                                                <IOSSwitch value={enrollDMSCmds.insecure} onChange={() => setEnrollDMSCmds({ ...enrollDMSCmds, insecure: !enrollDMSCmds.insecure })} />
                                            } />
                                        </Grid>

                                        <Grid xs>
                                            <Typography>
                                                Define the Device Manager EST server and the credentials to be used during the enrollment process:
                                            </Typography>
                                            <CodeCopier code={
                                                `export LAMASSU_SERVER=${window.location.host} \nexport VALIDATION_CRT=${enrollDMSCmds.commonNameBootstrap}.crt \nexport VALIDATION_KEY=${enrollDMSCmds.commonNameBootstrap}.key`
                                            } />
                                        </Grid>

                                        {
                                            !enrollDMSCmds.insecure && (
                                                <Grid xs>
                                                    <Typography>
                                                        Obtain the Root certificate used by the server:
                                                    </Typography>
                                                    <CodeCopier code={
                                                        "openssl s_client -showcerts -servername $LAMASSU_SERVER  -connect $LAMASSU_SERVER:443 2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p' > root-ca.pem"
                                                    } />
                                                </Grid>
                                            )
                                        }

                                        <Grid xs>
                                            <Typography>
                                                Request a certificate from the EST server:
                                            </Typography>
                                            <CodeCopier code={
                                                `curl https://$LAMASSU_SERVER/api/dmsmanager/.well-known/est/${enrollDMSCmds.dmsName}/simpleenroll --cert $VALIDATION_CRT --key $VALIDATION_KEY -s -o ${enrollDMSCmds.deviceID}.p7 ${enrollDMSCmds.insecure ? "-k" : "--cacert root-ca.pem"}  --data-binary @${enrollDMSCmds.deviceID}.stripped.csr -H "Content-Type: application/pkcs10" \nopenssl base64 -d -in ${enrollDMSCmds.deviceID}.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out ${enrollDMSCmds.deviceID}.crt \nopenssl x509 -text -in ${enrollDMSCmds.deviceID}.crt`
                                            } />
                                        </Grid>
                                    </Grid>
                                )
                            }
                        ]}
                    />
                )
            }
        </>
    );
};

interface BootstrapGeneratorProps {
    cn: string
    ca: CertificateAuthority
}

const BootstrapGenerator: React.FC<BootstrapGeneratorProps> = ({ cn, ca }) => {
    const [result, setResult] = useState<{
        loading: boolean
        errMsg: string
        crt: Certificate | undefined
        privateKey: string
    }>({ loading: true, crt: undefined, privateKey: "", errMsg: "" });
    useEffect(() => {
        const run = async () => {
            try {
                const keyPair = await createPrivateKey("RSA", 2048, "SHA-256");
                const csr = await createCSR(keyPair, "SHA-256", { cn }, { dnss: undefined });
                const { privateKey } = await keyPairToPEM(keyPair);

                const cert = await apicalls.cas.signCertificateRequest(ca.id, window.window.btoa(csr));

                setResult({ loading: false, crt: cert, errMsg: "", privateKey });
            } catch (err: any) {
                setResult({ loading: false, crt: undefined, errMsg: errorToString(err), privateKey: "" });
            }
        };

        run();
    }, []);

    if (result.loading) {
        return <Box sx={{ width: "100%", marginBottom: "20px" }}>
            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
        </Box>;
    }

    if (result.crt === undefined) {
        return (
            <Alert severity="error">
                Got unexpected error: {result.errMsg}
            </Alert>
        );
    }

    return (
        <Grid container spacing={2}>
            <Grid xs>
                <KeyValueLabel label="Bootstrap Private Key" value={
                    <CodeCopier code={result.privateKey} enableDownload downloadFileName={result.crt.subject.common_name + ".key"} />
                } />
            </Grid>
            <Grid xs>
                <KeyValueLabel label="Bootstrap Certificate" value={
                    <CodeCopier code={window.window.atob(result.crt.certificate)} enableDownload downloadFileName={result.crt.subject.common_name + ".crt"} />
                } />
            </Grid>
            <Grid xs={12} container flexDirection={"column"} spacing={1}>
                <Grid>
                    <Alert severity="info">
                        Make sure to copy the command below!
                    </Alert>
                </Grid>
                <Grid>
                    <CodeCopier code={`echo "${result.crt.certificate}" |  base64 -d > ${result.crt.subject.common_name}.crt\n echo "${window.window.btoa(result.privateKey)}" |  base64 -d > ${result.crt.subject.common_name}.key`} />
                </Grid>
            </Grid>
        </Grid>
    );
};
