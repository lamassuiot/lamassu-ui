import { Alert, Box, Button, Divider, IconButton, Menu, MenuItem, Paper, Skeleton, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import { CASelector } from "components/CAs/CASelector";
import { Certificate, CertificateAuthority, CryptoEngine, ExtendedKeyUsage, KeyUsage } from "ducks/features/cas/models";
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
import AddIcon from "@mui/icons-material/Add";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import apicalls from "ducks/apicalls";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { GrValidate } from "react-icons/gr";
import { CAFetchViewer } from "components/CAs/CAStandardFetchViewer";
import { TbCertificate } from "react-icons/tb";
import { FaWpforms } from "react-icons/fa";
import Label from "components/Label";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import TerminalIcon from "@mui/icons-material/Terminal";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { Modal } from "components/Modal";
import { enqueueSnackbar } from "notistack";
import { Select } from "components/Select";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { MetadataInput } from "components/forms/MetadataInput";
import useCachedEngines from "components/cache/cachedEngines";

export const DMSListView = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const tableRef = React.useRef<FetchHandle>(null);
    const [engines, setEngines] = useState([] as CryptoEngine[]);
    const { getEnginesData } = useCachedEngines();

    useEffect(() => {
        const loadEngines = async () => {
            const fetched = await getEnginesData();
            setEngines(fetched);
        };

        loadEngines();
    }, []);

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
                            <IconButton
                                style={{ background: lighten(theme.palette.primary.main, 0.7) }}
                                onClick={() => { navigate("create"); }}
                            >
                                <AddIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid xs>
                    <FetchViewer
                        fetcher={(_controller) => { return apicalls.dmss.getDMSs({ pageSize: 15, bookmark: "" }); }}
                        renderer={(list: ListResponse<DMS>) => {
                            return (
                                <Grid container spacing={2}>
                                    {
                                        list.list.map((dms) => {
                                            return (
                                                <Grid key={dms.id} md={4} xs={12}>
                                                    <DMSCardRenderer
                                                        dms={dms}
                                                        onDelete={() => {
                                                            tableRef.current?.refresh();
                                                        }}
                                                        engines={engines}
                                                    />
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
    dms: DMS,
    onDelete: () => void
    engines?: CryptoEngine[]
}

const DMSCardRenderer: React.FC<DMSCardRendererProps> = ({ dms, onDelete, engines = [] }) => {
    const theme = useTheme();

    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const [enrollDMSCmds, setEnrollDMSCmds] = useState<{
        open: boolean,
        dmsName: string,
        deviceID: string,
        bootstrapCA: CertificateAuthority | undefined,
        commonNameBootstrap: string,
        insecure: boolean,
    }>({ open: false, dmsName: "", bootstrapCA: undefined, deviceID: "", insecure: false, commonNameBootstrap: "" });

    const [showDelete, setShowDelete] = useState(false);
    const [showMetadata, setShowMetadata] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const splitColors = dms.settings.enrollment_settings.device_provisioning_profile.icon_color.split("-");
    let iconBG = "";
    let iconFG = "";
    if (splitColors.length === 2) {
        iconBG = splitColors[0];
        iconFG = splitColors[1];
    }

    // Variables and Functions should be out of the component //
    const generateDeviceCSR = `openssl req -new -newkey rsa:2048 -nodes -keyout ${enrollDMSCmds.deviceID}.key -out ${enrollDMSCmds.deviceID}.csr -subj "/CN=${enrollDMSCmds.deviceID}"\ncat ${enrollDMSCmds.deviceID}.csr | sed '/-----BEGIN CERTIFICATE REQUEST-----/d'  | sed '/-----END CERTIFICATE REQUEST-----/d'> ${enrollDMSCmds.deviceID}.stripped.csr`;
    const defineDeviceManagerAndCredentias = `export LAMASSU_SERVER=${window.location.host} \nexport VALIDATION_CRT=${enrollDMSCmds.commonNameBootstrap}.crt \nexport VALIDATION_KEY=${enrollDMSCmds.commonNameBootstrap}.key`;
    const obtainRootCertificate = "openssl s_client -showcerts -servername $LAMASSU_SERVER  -connect $LAMASSU_SERVER:443 2>/dev/null </dev/null |  sed -ne '/-BEGIN CERTIFICATE-/,/-END CERTIFICATE-/p'> root-ca.pem";
    const requestCertFromESTServer = `curl https://$LAMASSU_SERVER/api/dmsmanager/.well-known/est/${enrollDMSCmds.dmsName}/simpleenroll --cert $VALIDATION_CRT --key $VALIDATION_KEY -s -o ${enrollDMSCmds.deviceID}.p7 ${enrollDMSCmds.insecure ? "-k" : "--cacert root-ca.pem"}  --data-binary @${enrollDMSCmds.deviceID}.stripped.csr -H "Content-Type: application/pkcs10" \nopenssl base64 -d -in ${enrollDMSCmds.deviceID}.p7 | openssl pkcs7 -inform DER -outform PEM -print_certs -out ${enrollDMSCmds.deviceID}.crt \nopenssl x509 -text -in ${enrollDMSCmds.deviceID}.crt`;

    const handleSelectCA = (ca: CertificateAuthority | CertificateAuthority[] | undefined) => {
        if (!Array.isArray(ca)) {
            setEnrollDMSCmds({ ...enrollDMSCmds, bootstrapCA: ca });
        }
    };

    const handleOnChangeEnroll = (ev: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setEnrollDMSCmds({ ...enrollDMSCmds, deviceID: ev.target.value });
    };

    const enrollDMSCmdsSteps = [
        {
            title: "Define Device to Enroll",
            subtitle: "",
            content: (
                <TextField
                    fullWidth
                    label="Device ID"
                    onChange={(ev) => handleOnChangeEnroll(ev)}
                    value={enrollDMSCmds.deviceID}
                />
            )
        },
        {
            title: "Generate Device CSR",
            subtitle: "",
            content: (
                <CodeCopier code={ generateDeviceCSR } />
            )
        },
        {
            title: "Define Bootstrap Certificate Props",
            subtitle: "",
            content: (
                <Grid container flexDirection={"column"} spacing={2}>
                    <Grid xs>
                        <TextField
                            label="Bootstrap Certificate Common Name"
                            value={enrollDMSCmds.commonNameBootstrap}
                            onChange={(ev) =>
                                setEnrollDMSCmds({ ...enrollDMSCmds, commonNameBootstrap: ev.target.value })}
                        />
                    </Grid>
                    <Grid xs>
                        <CASelector
                            limitSelection={dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas}
                            multiple={false}
                            label="Bootstrap Signer"
                            value={enrollDMSCmds.bootstrapCA}
                            onSelect={handleSelectCA}
                        />
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
                        <KeyValueLabel
                            label="Validate Server (OFF) / Insecure (ON)"
                            value={
                                <IOSSwitch
                                    value={enrollDMSCmds.insecure}
                                    onChange={() => setEnrollDMSCmds({ ...enrollDMSCmds, insecure: !enrollDMSCmds.insecure })}
                                />
                            }
                        />
                    </Grid>

                    <Grid xs>
                        <Typography>
                            Define the Device Manager EST server and the credentials to be used during the enrollment process:
                        </Typography>
                        <CodeCopier code={defineDeviceManagerAndCredentias} />
                    </Grid>

                    {
                        !enrollDMSCmds.insecure && (
                            <Grid xs>
                                <Typography>
                                    Obtain the Root certificate used by the server:
                                </Typography>
                                <CodeCopier code={obtainRootCertificate} />
                            </Grid>
                        )
                    }

                    <Grid xs>
                        <Typography>
                            Request a certificate from the EST server:
                        </Typography>
                        <CodeCopier code={requestCertFromESTServer} />
                    </Grid>
                </Grid>
            )
        }
    ];

    const deleteTypes = [
        {
            value: "SOFT-DELETE",
            render: "Detach Devices"
        },
        {
            value: "CHAINED-DELETE",
            render: "Delete owned Devices"
        },
        {
            value: "TRANSFER",
            render: "Transfer owned Devices to DMS"
        }
    ];

    const handleClickDelete = async () => {
        try {
            await apicalls.dmss.getDMSs();
            enqueueSnackbar(`DMS ${dms.id} deleted successfully`, { variant: "success" });
            setShowDelete(false);
            onDelete();
        } catch (e) {
            enqueueSnackbar(`Error deleting DMS ${dms.id}: ${errorToString(e)}`, { variant: "error" });
        }
    };

    const handleChangeMetadaInput = async (meta: { [key: string]: any }) => {
        try {
            await apicalls.dmss.updateDMS(dms.id, { ...dms, metadata: meta });
            enqueueSnackbar("Metadata updated successfully", { variant: "success" });
        } catch (e) {
            const errMsg = errorToString(e);
            enqueueSnackbar(`Error updating metadata: ${errMsg}`, { variant: "error" });
        }
    };

    const handleClickEnroll = () => {
        handleClose();
        setEnrollDMSCmds({
            open: true,
            dmsName: dms.id,
            insecure: false,
            bootstrapCA: undefined,
            commonNameBootstrap: "ui-generated-bootstrap",
            deviceID: ""
        });
    };

    const handleClickMenuMetada = () => {
        handleClose();
        setShowMetadata(true);
    };

    const handleClickMenuDelete = () => {
        handleClose();
        setShowDelete(true);
    };

    return (
        <>
            <Box component={Paper} elevation={0} sx={{ padding: "20px", borderRadius: "10px" }}>
                <Grid container spacing={1}>
                    <Grid xs={12} container>
                        <Grid xs>
                            <IconInput readonly label="" size={35} value={{ bg: iconBG, fg: iconFG, name: dms.settings.enrollment_settings.device_provisioning_profile.icon }} />
                        </Grid>
                        <Grid xs="auto">
                            <IconButton onClick={handleClick}>
                                <MoreHorizIcon />
                            </IconButton>
                            <Menu
                                id="demo-customized-menu"
                                MenuListProps={{
                                    "aria-labelledby": "demo-customized-button"
                                }}
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => navigate(`${dms.id}/edit`) } disableRipple>
                                    <EditIcon fontSize={"small"} sx={{ color: theme.palette.primary.main, marginRight: "10px" }} />
                                    Edit
                                </MenuItem>

                                <Divider sx={{ my: 0.5 }} />

                                <MenuItem onClick={handleClickEnroll} disableRipple>
                                    <TerminalIcon fontSize={"small"} sx={{ marginRight: "10px" }} />
                                    EST - Enroll: cURL Commands
                                </MenuItem>

                                <MenuItem onClick={() => navigate(`${dms.id}/cacerts`) } disableRipple>
                                    <AccountBalanceOutlinedIcon fontSize={"small"} sx={{ marginRight: "10px" }} />
                                    EST - CACerts
                                </MenuItem>

                                <MenuItem onClick={() => navigate(`/devices?filter=dms_owner[equal]${dms.id}`) } disableRipple>
                                    <RouterOutlinedIcon fontSize={"small"} sx={{ marginRight: "10px" }} />
                                    Go to DMS owned devices
                                </MenuItem>

                                <MenuItem onClick={handleClickMenuMetada} disableRipple>
                                    <MenuBookOutlinedIcon fontSize={"small"} sx={{ marginRight: "10px" }} />
                                    Show Metadata
                                </MenuItem>

                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={() => {
                                    handleClose();
                                    setShowDelete(true);
                                }} disableRipple>
                                    <DeleteIcon fontSize={"small"} sx={{ color: theme.palette.error.main, marginRight: "10px" }} />
                                    Delete
                                </MenuItem>
                            </Menu>
                        </Grid>
                    </Grid>
                    <Grid xs={12}>
                        <Typography variant="h4">
                            {dms.name}
                        </Typography>
                    </Grid>
                    <Grid xs={12}>
                        <Divider />
                    </Grid>
                    <Grid xs={12} container flexDirection={"column"} spacing={0}>
                        <Grid container alignItems={"center"} spacing={"10px"}>
                            <Grid xs={1}>
                                <Tooltip title="Registration Mode">
                                    <div>
                                        <FaWpforms color="#999" size={20} />
                                    </div>
                                </Tooltip>
                            </Grid>
                            <Grid xs={11}>
                                <Label>{dms.settings.enrollment_settings.registration_mode}</Label>
                            </Grid>
                        </Grid>
                        <Grid container alignItems={"start"} spacing={"10px"}>
                            <Grid xs={1}>
                                <Tooltip title="Validation CA">
                                    <div style={{ paddingTop: dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.length > 0 ? "25px" : "0" }}>
                                        <GrValidate color="#999" size={20} />
                                    </div>
                                </Tooltip>
                            </Grid>
                            <Grid xs={11} container spacing={1}>
                                {
                                    dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.length > 0
                                        ? (
                                            dms.settings.enrollment_settings.est_rfc7030_settings.client_certificate_settings.validation_cas.map((caID, idx) => {
                                                return (
                                                    <Grid xs={12} key={idx}>
                                                        <CAFetchViewer elevation={false} id={caID} sx={{ padding: "0px" }} engines={engines} />
                                                    </Grid>
                                                );
                                            })
                                        )
                                        : (
                                            <Grid xs={12}>
                                                <Typography variant="body1" color="textSecondary" fontStyle={"italic"}>No validation CAs defined</Typography>
                                            </Grid>
                                        )
                                }
                            </Grid>
                        </Grid>
                        <Grid container alignItems={"center"} spacing={"10px"}>
                            <Grid xs={1}>
                                <Tooltip title="Enrollment CA">
                                    <div>
                                        <TbCertificate color="#999" size={20} />
                                    </div>
                                </Tooltip>
                            </Grid>
                            <Grid xs={11}>
                                <CAFetchViewer elevation={false} id={dms.settings.enrollment_settings.enrollment_ca} sx={{ padding: "0px" }} engines={engines} />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
            {
                enrollDMSCmds.open && (
                    <StepModal
                        open={enrollDMSCmds.open}
                        onClose={() => setEnrollDMSCmds({ ...enrollDMSCmds, open: false })}
                        onFinish={() => { }}
                        title="EST Enroll"
                        size="lg"
                        steps={enrollDMSCmdsSteps}
                    />
                )
            }
            {
                showDelete && (
                    <Modal
                        isOpen={true}
                        onClose={() => { setShowDelete(false); }}
                        maxWidth="sm"
                        title="Delete DMS"
                        subtitle=""
                        content={(
                            <Grid container spacing={2}>
                                <Grid xs={12}>
                                    <Typography>
                                        You are about to delete the DMS <Label color={"info"}><strong>{dms.name}</strong></Label>. This action is irreversible. Are you sure you want to proceed?
                                    </Typography>
                                </Grid>
                                <Grid xs={12}>
                                    <Select label="Delete Mode" value="SOFT-DELETE" options={[
                                        {
                                            value: "SOFT-DELETE",
                                            render: "Detach Devices"
                                        },
                                        {
                                            value: "CHAINED-DELETE",
                                            render: "Delete owned Devices",
                                            disabled: true
                                        },
                                        {
                                            value: "TRANSFER",
                                            render: "Transfer owned Devices to DMS",
                                            disabled: true
                                        }
                                    ]} />
                                </Grid>
                            </Grid>
                        )}
                        actions={
                            <Grid container spacing={1}>
                                <Grid xs>
                                    <Button fullWidth color="error" variant="contained" onClick={async () => {
                                        try {
                                            await apicalls.dmss.deleteDMS(dms.id);
                                            enqueueSnackbar(`DMS ${dms.id} deleted successfully`, { variant: "success" });
                                            setShowDelete(false);
                                            onDelete();
                                        } catch (e) {
                                            enqueueSnackbar(`Error deleting DMS ${dms.id}: ${errorToString(e)}`, { variant: "error" });
                                        }
                                    }}>Delete</Button>
                                </Grid>
                                <Grid xs="auto">
                                    <Button variant="text" onClick={() => setShowDelete(false)}>Close</Button>
                                </Grid>
                            </Grid>
                        }
                    />
                )
            }
            {
                showMetadata && (
                    <Modal
                        isOpen={true}
                        onClose={() => { setShowMetadata(false); }}
                        maxWidth="lg"
                        title="DMS Metadata"
                        subtitle=""
                        content={(
                            <Grid container spacing={2}>
                                <Grid xs={12}>
                                    <MetadataInput label="" onChange={handleChangeMetadaInput} value={dms.metadata} />
                                </Grid>
                            </Grid>
                        )}
                        actions={
                            <Grid container spacing={1}>
                                <Grid xs="auto">
                                    <Button variant="text" onClick={() => setShowMetadata(false)}>Close</Button>
                                </Grid>
                            </Grid>
                        }
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
        initialize();
    }, []);

    const initialize = async () => {
        try {
            const keyPair = await createPrivateKey("RSA", 2048, "SHA-256");
            const csr = await createCSR(keyPair, "SHA-256", { cn: "ui-generated-bootstrap" }, []);
            const { privateKey } = await keyPairToPEM(keyPair);

            const validity: any = ca.validity;
            if (validity.type === "Time") {
                validity.timme = ca.validity.time.format();
            }

            const cert = await apicalls.cas.signCertificateRequest(ca.id, window.window.btoa(csr), {
                honor_subject: true,
                honor_extensions: true,
                sign_as_ca: false,
                key_usage: [
                    KeyUsage.DigitalSignature
                ],
                extended_key_usage: [
                    ExtendedKeyUsage.ClientAuth
                ],
                validity
            });

            setResult({ loading: false, crt: cert, errMsg: "", privateKey });
        } catch (err: any) {
            setResult({ loading: false, crt: undefined, errMsg: errorToString(err), privateKey: "" });
        }
    };

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
                    <CodeCopier code={`echo "${result.crt.certificate}" |  base64 -d> ${result.crt.subject.common_name}.crt\n echo "${window.window.btoa(result.privateKey)}" |  base64 -d> ${result.crt.subject.common_name}.key`} />
                </Grid>
            </Grid>
        </Grid>
    );
};
