import { Alert, Box, Breadcrumbs, Button, Divider, IconButton, Link, Paper, Skeleton, Slide, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import { Certificate, CertificateAuthority, CertificateStatus, RevocationReason, getRevocationReasonDescription } from "ducks/features/cas/models";
import { CertificatesTable } from "components/Certificates/CertificatesTable";
import { CodeCopier } from "components/CodeCopier";
import { FetchHandle } from "components/TableFetcherView";
import { FetchViewer } from "components/FetchViewer";
import { KeyValueLabel } from "components/KeyValue";
import { Modal } from "components/Modal";
import { QuerySearchbarInput } from "components/QuerySearchbarInput";
import { Select } from "components/Select";
import { TextField } from "components/TextField";
import { parseCRT } from "utils/crypto/crt";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import AddIcon from "@mui/icons-material/Add";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CAViewer from "components/CAs/CAViewer";
import CSRImporter from "components/CSRImporter";
import CSRInBrowserGenerator from "components/CSRGenerator";
import CertificateImporter from "components/CRTImporter";
import Grid from "@mui/material/Unstable_Grid2";
import PublishIcon from "@mui/icons-material/Publish";
import React, { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import apicalls from "ducks/apicalls";

const queryableFields = [
    { key: "subject.common_name", title: "Common Name", operator: "contains" },
    { key: "serial_number", title: "Serial Number", operator: "contains" }
];

interface Props {
    caData: CertificateAuthority
}

export const IssuedCertificates: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();
    const containerRef = React.useRef(null);
    const tableRef = React.useRef<FetchHandle>(null);

    const [hoveredItem, setHoveredItem] = useState(-1);
    const [addCertMode, setAddCertMode] = useState(-1);

    const [displayIssueCert, setDisplayIssueCert] = useState(false);
    const [importSignStatus, setImportSignStatus] = useState<{
        loading: boolean,
        errMessage: string,
        response: Certificate | undefined
    }>({ loading: false, errMessage: "", response: undefined });

    const resetAddCertificate = () => {
        setAddCertMode(-1);
        setImportSignStatus({ loading: false, errMessage: "", response: undefined });
    };

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState({ isOpen: false, serialNumber: "" });
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    const [query, setQuery] = React.useState<{ value: string, field: string, operator: string }>({ value: "", field: "", operator: "" });

    const tabs = [{
        title: "In Place Generation",
        disabled: caData.certificate.status !== "ACTIVE",
        icon: <AddCircleOutlineIcon fontSize="large" color="primary" />,
        component: (
            <CSRInBrowserGenerator onCreate={async (key, csr) => {
                setImportSignStatus({ loading: true, errMessage: "", response: undefined });
                const singResp = await apicalls.cas.signCertificateRequest(caData.id, window.window.btoa(csr));
                setImportSignStatus({ loading: false, errMessage: "", response: singResp });
            }} />
        )
    }, {
        title: "Import And Sign CSR",
        disabled: caData.certificate.status !== "ACTIVE",
        icon: <ArticleOutlinedIcon fontSize="large" color="primary" />,
        component: (
            <CSRImporter onCreate={async (csr) => {
                setImportSignStatus({ loading: true, errMessage: "", response: undefined });
                const singResp = await apicalls.cas.signCertificateRequest(caData.id, window.window.btoa(csr));
                setImportSignStatus({ loading: false, errMessage: "", response: singResp });
            }} />
        )
    }, {
        title: "Import External Certificate",
        disabled: false,
        icon: <PublishIcon fontSize="large" color="primary" />,
        component: (
            <CertificateImporterForm caSubjectCN={caData.certificate.subject.common_name} caId={caData.id} onCreate={async (crt) => {
                setImportSignStatus({ loading: true, errMessage: "", response: undefined });
                const singResp = await apicalls.cas.importCertificate(window.window.btoa(crt));
                setImportSignStatus({ loading: false, errMessage: "", response: singResp });
            }} />
        )
    }];

    return (
        !displayIssueCert
            ? (
                <>
                    <Grid container flexDirection={"column"} spacing={2} padding={"20px"}>
                        <Grid container>
                            <Grid xs>
                                <QuerySearchbarInput onChange={({ query, field }) => {
                                    setQuery({ value: query, field, operator: queryableFields.find((f) => f.key === field)!.operator || "contains" });
                                }}
                                fieldSelector={queryableFields}
                                />
                            </Grid>
                            <Grid xs="auto" container>
                                <Grid xs="auto">
                                    <Tooltip title="Reload Certificates">
                                        <IconButton onClick={() => { tableRef.current?.refresh(); }} style={{ background: lighten(theme.palette.primary.main, 0.7) }}>
                                            <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid xs="auto">
                                    <Tooltip title="Add Certificate">
                                        <IconButton onClick={() => { setDisplayIssueCert(true); }} style={{ background: lighten(theme.palette.primary.main, 0.7) }}>
                                            <AddIcon style={{ color: theme.palette.primary.main }} />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid>
                            <CertificatesTable ref={tableRef} caID={caData.id} query={query} />
                        </Grid>
                    </Grid>
                    {/* {
                displayIssueCert && (
                    <IssueCert caName={caData.id} isOpen={displayIssueCert} onClose={() => { setDisplayIssueCert(false); refreshAction(); }} />
                )
            } */}
                    <Modal
                        title={"Revoke Certificate"}
                        subtitle={""}
                        isOpen={isRevokeDialogOpen.isOpen}
                        onClose={function (): void {
                            setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" });
                        }}
                        content={(
                            <Grid container flexDirection={"column"} spacing={4} width={"1500px"}>
                                <Grid>
                                    <TextField label="Certificate Serial Number" value={isRevokeDialogOpen.serialNumber} disabled />
                                </Grid>
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid>
                                        <KeyValueLabel
                                            label="Issuer CA"
                                            value={(
                                                <FetchViewer fetcher={() => apicalls.cas.getEngines()} errorPrefix="Could not fetch Crypto Engines" renderer={(engines) => {
                                                    return (
                                                        <CAViewer caData={caData} engine={engines.find(eng => eng.id === caData.certificate.engine_id)!} />
                                                    );
                                                }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid>
                                        <Select label="Select Revocation Reason" value={revokeReason} onChange={(ev: any) => setRevokeReason(ev.target.value!)} options={
                                            Object.values(RevocationReason).map((rCode, idx) => {
                                                return {
                                                    value: rCode as string,
                                                    render: () => (
                                                        <Grid container spacing={2}>
                                                            <Grid xs={2}>
                                                                <Typography>{rCode}</Typography>
                                                            </Grid>
                                                            <Grid xs="auto">
                                                                <Typography fontSize={"12px"}>{getRevocationReasonDescription(rCode)}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    )
                                                };
                                            })
                                        } />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        actions={
                            <Grid container spacing={2}>
                                <Grid xs md="auto">
                                    <Button fullWidth onClick={async () => {
                                        apicalls.cas.updateCertificateStatus(isRevokeDialogOpen.serialNumber, CertificateStatus.Revoked, revokeReason);
                                        setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" });
                                    }}>Revoke Certificate</Button>
                                </Grid>
                                <Grid xs="auto" md="auto">
                                    <Button onClick={() => { setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" }); }}>Close</Button>
                                </Grid>
                            </Grid >
                        }
                    />
                </>
            )
            : (
                <Box style={{ height: "100%" }} ref={containerRef} padding={"20px"}>
                    <Slide direction="left" in={displayIssueCert} container={containerRef.current} style={{ height: "100%" }}>
                        <Grid container flexDirection={"column"} spacing={2} wrap="nowrap">
                            <Grid>
                                <Breadcrumbs>
                                    <Link underline="hover" color="inherit" variant="h5" onClick={() => { resetAddCertificate(); setDisplayIssueCert(false); }} sx={{ cursor: "pointer" }}>
                                        Issued Certificate List
                                    </Link>

                                    <Link underline="hover" color="inherit" variant="h5" onClick={() => resetAddCertificate()} sx={{ cursor: "pointer" }}>
                                        Add Certificate
                                    </Link>

                                    {
                                        addCertMode !== -1 && (
                                            <Typography color="text.primary">
                                                {
                                                    addCertMode === 0
                                                        ? (
                                                            "In Place Generation"
                                                        )
                                                        : (
                                                            addCertMode === 1
                                                                ? (
                                                                    "Import And Sign CSR"
                                                                )
                                                                : (
                                                                    "Import External Certificate"
                                                                )
                                                        )
                                                }
                                            </Typography>
                                        )
                                    }

                                </Breadcrumbs>
                            </Grid>
                            <Grid>
                                <Divider />
                            </Grid>
                            {
                                addCertMode === -1
                                    ? (
                                        <Grid container spacing={3}>
                                            {
                                                caData.certificate.status !== "ACTIVE" && (
                                                    <Grid xs={12}>
                                                        <Alert severity="warning">
                                                            The CA is not active. Certificates cannot be issued (Only Import External Certificate is allowed)
                                                        </Alert>
                                                    </Grid>
                                                )
                                            }

                                            {
                                                tabs.filter(item => !item.disabled).map((item, idx) => {
                                                    return (
                                                        <Grid xs key={idx}>
                                                            <Box onClick={() => setAddCertMode(idx)} {...idx === hoveredItem && { component: Paper, elevation: 20 }} onMouseOver={() => setHoveredItem(idx)} onMouseOut={() => setHoveredItem(-1)} sx={{
                                                                cursor: "pointer",
                                                                borderRadius: "5px",
                                                                border: `2px dashed ${theme.palette.primary.main}`,
                                                                height: "150px",
                                                                ":hover": {
                                                                    border: `2px dashed ${theme.palette.primary.main}`,
                                                                    background: lighten(theme.palette.primary.main, 0.6)
                                                                }
                                                            }}>
                                                                <Grid container flexDirection={"column"} alignItems={"center"} justifyContent={"center"} sx={{ height: "100%" }}>
                                                                    <Grid>
                                                                        <Typography variant="h4" sx={{
                                                                            color: theme.palette.primary.main
                                                                        }}>
                                                                            {item.title}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid sx={{ marginTop: "10px" }}>
                                                                        {item.icon}
                                                                    </Grid>
                                                                </Grid>
                                                            </Box>
                                                        </Grid>
                                                    );
                                                })
                                            }
                                        </Grid>
                                    )
                                    : (
                                        <Grid container flexDirection={"column"} padding={"20px"}>
                                            {
                                                importSignStatus.loading === false
                                                    ? (
                                                        importSignStatus.errMessage !== ""
                                                            ? (
                                                                <>{importSignStatus.errMessage}</>
                                                            )
                                                            : (
                                                                importSignStatus.response !== undefined
                                                                    ? (
                                                                        <Grid container spacing={2}>
                                                                            <Grid xs={12}>
                                                                                <Alert severity="success" action={
                                                                                    <Button variant="contained" color="success" size="small" onClick={() => { resetAddCertificate(); setDisplayIssueCert(false); }}>
                                                                                        Go Back
                                                                                    </Button>
                                                                                }>
                                                                                    Certificate generated successfully. Certificate Serial Number: {importSignStatus.response.serial_number}
                                                                                </Alert>
                                                                            </Grid>
                                                                            <Grid xs={12}>
                                                                                <CodeCopier code={window.window.atob(importSignStatus.response.certificate)} />
                                                                            </Grid>
                                                                        </Grid>
                                                                    )
                                                                    : (
                                                                        <Grid>
                                                                            {
                                                                                tabs.filter((_, idx) => idx === addCertMode)[0].component
                                                                            }
                                                                        </Grid>
                                                                    )
                                                            )
                                                    )
                                                    : (
                                                        <Box sx={{ width: "100%", marginBottom: "20px" }}>
                                                            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                            <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                        </Box>

                                                    )
                                            }

                                        </Grid>
                                    )
                            }
                        </Grid>
                    </Slide>
                </Box>
            )
    );
};

interface CertificateImporterFormProps {
    caId: string
    caSubjectCN: any
    onCreate: (crt: string) => void
}

const CertificateImporterForm: React.FC<CertificateImporterFormProps> = ({ onCreate, caId, caSubjectCN }) => {
    const [crt, setCrt] = useState<undefined | string>();
    const [showWarn, setShowWarn] = useState(false);

    useEffect(() => {
        const run = async () => {
            if (crt) {
                const decCrt = await parseCRT(crt);
                setShowWarn(decCrt.subject.cn !== caSubjectCN);
            }
        };
        run();
    }, [crt]);

    return (
        <Grid container flexDirection={"column"} spacing={2}>
            <Grid>
                <CertificateImporter onChange={(crt) => {
                    setCrt(crt);
                }} />
            </Grid>
            {
                crt !== undefined && crt !== "" && (
                    <>
                        {
                            showWarn && (
                                <Grid>
                                    <Alert severity="warning">
                                        This certificate appears to be signed by another CA. The certificate will be uploaded although it wont be placed under this CA.
                                    </Alert>
                                </Grid>
                            )
                        }
                        <Grid>
                            <Button variant="contained" onClick={() => onCreate(crt)}>Import Certificate</Button>
                        </Grid>
                    </>
                )
            }
        </Grid>

    );
};
