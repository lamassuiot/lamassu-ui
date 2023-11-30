import React, { useEffect, useState } from "react";
import { Alert, Box, Breadcrumbs, Button, Divider, Grid, IconButton, Link, MenuItem, Paper, Skeleton, Slide, Tooltip, Typography, useTheme } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { ListWithDataController, ListWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import moment from "moment";
import * as caApiCalls from "ducks/features/cav3/apicalls";
import { } from "@mui/system";
import deepEqual from "fast-deep-equal/es6";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { CertificateAuthority, Certificate, CertificateStatus, certificateFilters, RevocationReason, getRevocationReasonDescription } from "ducks/features/cav3/models";
import { Select } from "components/LamassuComponents/dui/Select";
import { TextField } from "components/LamassuComponents/dui/TextField";
import CAViewer from "components/LamassuComponents/lamassu/CAViewer";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { MultiKeyValueInput } from "components/LamassuComponents/dui/MultiKeyValueInput";
import { apicalls } from "ducks/apicalls";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import PublishIcon from "@mui/icons-material/Publish";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import CSRInBrowserGenerator from "components/LamassuComponents/composed/CertRequestForm/CSRInBrowserGenerator";
import CSRImporter from "components/LamassuComponents/composed/CertRequestForm/CSRImporter";
import CertificateImporter from "../CaActions/CAImporter";
import { parseCRT } from "components/utils/cryptoUtils/crt";
interface Props {
    caData: CertificateAuthority
}

export const IssuedCertificates: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();
    const containerRef = React.useRef(null);
    const [hoveredItem, setHoveredItem] = useState(-1);
    const [addCertMode, setAddCertMode] = useState(-1);

    const [isLoading, setIsLoading] = useState(true);
    const [certs, setCerts] = useState<Certificate[]>([]);

    const [displayIssueCert, setDisplayIssueCert] = useState(false);
    const [importSignStatus, setImportSignStatus] = useState<{
        loading: boolean,
        errMessage: string,
        response: Certificate | undefined
    }>({ loading: false, errMessage: "", response: undefined });
    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filters: {
                activeFilters: [],
                options: certificateFilters
            },
            sort: {
                enabled: true,
                selectedField: "status",
                selectedMode: "asc"
            },
            pagination: {
                enabled: true,
                options: [50, 75, 100],
                selectedPage: 0,
                selectedItemsPerPage: 50
            }
        }
    );

    const refreshAction = async () => {
        setIsLoading(true);
        try {
            const resp = await caApiCalls.getIssuedCertificatesByCA(
                caData.id,
                {
                    bookmark: "",
                    limit: tableConfig.pagination.selectedItemsPerPage!,
                    sortField: tableConfig.sort.selectedField!,
                    sortMode: tableConfig.sort.selectedMode!,
                    filters: tableConfig.filters.activeFilters.map(filter => { return `${filter.propertyField.key}[${filter.propertyOperator}]${filter.propertyValue}`; })
                }
            );
            setCerts(resp.list);
        } catch (error) {

        }
        setIsLoading(false);
    };

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const resetAddCertificate = () => {
        setAddCertMode(-1);
        setImportSignStatus({ loading: false, errMessage: "", response: undefined });
    };

    const [showCertificate, setShowCertificate] = useState<string | undefined>(undefined);
    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState({ isOpen: false, serialNumber: "" });
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    const certTableColumns = [
        { key: "serialNumber", sortFieldKey: "serial_number", query: "serial_number", title: "Serial Number", align: "start", size: 4 },
        { key: "commonName", title: "Common Name", align: "center", size: 3 },
        { key: "key", title: "Key", align: "center", size: 2 },
        { key: "certificateStatus", sortFieldKey: "status", title: "Certificate Status", align: "center", size: 1 },
        { key: "certificateIssuance", title: "Issued At", align: "center", size: 2 },
        { key: "certificateExpiration", title: "Expires At", align: "center", size: 2 },
        { key: "certificateRevocation", sortFieldKey: "revocation_timestamp", title: "Revoked At", align: "center", size: 3 },
        { key: "revocationReason", title: "Revocation Reason", align: "center", size: 1 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const renderCA = (cert: Certificate) => {
        return {
            serialNumber: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>{cert.serial_number}</Typography>,
            commonName: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, overflowWrap: "break-word", width: "100%", textAlign: "center" }}>{cert.subject.common_name}</Typography>,
            key: (
                <LamassuChip style={{ textAlign: "center" }} label={`${cert.key_metadata.type} ${cert.key_metadata.bits} - ${cert.key_metadata.strength}`} />
            ),
            certificateStatus: (
                <LamassuChip label={cert.status} color={cert.status === CertificateStatus.Active ? "green" : "red"} />
            ),
            certificateIssuance: (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>
                        {moment(cert.valid_from).format("DD-MM-YYYY HH:mm")}
                    </Typography >
                    <Typography style={{ fontWeight: "300", fontSize: 12, color: theme.palette.text.primary }}>
                        {moment.duration(moment(caData.valid_from).diff(moment())).humanize(true)}
                    </Typography >
                </Box>
            ),
            certificateExpiration: (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>
                        {moment(cert.valid_to).format("DD-MM-YYYY HH:mm")}
                    </Typography >
                    <Typography style={{ fontWeight: "300", fontSize: 12, color: theme.palette.text.primary }}>
                        {moment.duration(moment(caData.valid_to).diff(moment())).humanize(true)}
                    </Typography >
                </Box>
            ),
            certificateRevocation: (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {
                        moment(cert.revocation_timestamp).isSameOrAfter(moment("1970-01-01"))
                            ? (
                                <>
                                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>
                                        {moment(cert.revocation_timestamp).format("DD-MM-YYYY HH:mm")}
                                    </Typography >
                                    <Typography style={{ fontWeight: "300", fontSize: 12, color: theme.palette.text.primary }}>
                                        {moment.duration(moment(cert.revocation_timestamp).diff(moment())).humanize(true)}
                                    </Typography >
                                </>
                            )
                            : (
                                <Typography style={{ fontWeight: "300", fontSize: 12, color: theme.palette.text.primary }}>
                                    -
                                </Typography >
                            )
                    }
                </Box>
            ),
            revocationReason: (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    {
                        cert.status === "REVOKED"
                            ? (
                                <LamassuChip label={cert.revocation_reason} />
                            )
                            : (
                                <Typography style={{ fontWeight: "300", fontSize: 12, color: theme.palette.text.primary }}>
                                    -
                                </Typography >
                            )
                    }
                </Box>
            ),
            actions: (
                <Box>
                    <Grid container spacing={1}>
                        <Grid item>
                            <Tooltip title="Show Certificate">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                    <IconButton onClick={() => { setShowCertificate(cert.serial_number); }}>
                                        <VisibilityIcon fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                            <Modal
                                title={`Certificate ${cert.serial_number}`}
                                subtitle=""
                                isOpen={showCertificate === cert.serial_number}
                                maxWidth={false}
                                onClose={() => { setShowCertificate(undefined); }}
                                actions={
                                    <Box>
                                        <Button onClick={() => { setShowCertificate(undefined); }}>Close</Button>
                                    </Box>
                                }
                                content={
                                    <Grid container spacing={4} width={"100%"}>
                                        <Grid item xs="auto">
                                            <CodeCopier code={window.window.atob(cert.certificate)} enableDownload downloadFileName={caData.id + "_" + cert.serial_number + ".crt"} />
                                        </Grid>
                                        <Grid item xs container flexDirection={"column"}>
                                            <MultiKeyValueInput label="Metadata" value={cert.metadata} onChange={(meta) => {
                                                if (!deepEqual(cert.metadata, meta)) {
                                                    apicalls.cas.updateCertificateMetadata(cert.serial_number, meta);
                                                }
                                            }} />
                                        </Grid>
                                    </Grid>
                                }
                            />
                        </Grid>
                        {
                            cert.status !== CertificateStatus.Revoked && (
                                <Grid item>
                                    <Tooltip title="Revoke Certificate">
                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                            <IconButton>
                                                <DeleteIcon fontSize={"small"} onClick={() => { setIsRevokeDialogOpen({ isOpen: true, serialNumber: cert.serial_number }); }} />
                                            </IconButton>
                                        </Box>
                                    </Tooltip>
                                </Grid>
                            )
                        }
                        {
                            cert.status === CertificateStatus.Revoked && (
                                cert.revocation_reason === "CertificateHold" && (
                                    <Grid item>
                                        <Tooltip title="ReActivate certificate">
                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                <IconButton>
                                                    <UnarchiveOutlinedIcon fontSize={"small"} onClick={() => {
                                                        caApiCalls.updateCertificateStatus(cert.serial_number, CertificateStatus.Active);
                                                    }} />
                                                </IconButton>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                )
                            )
                        }
                    </Grid>
                </Box >
            )
        };
    };

    return (
        !displayIssueCert
            ? (
                <>
                    <ListWithDataController
                        listConf={certTableColumns}
                        listRender={{
                            renderFunc: renderCA,
                            enableRowExpand: false
                        }}
                        data={certs}
                        totalDataItems={0}
                        renderDataItem={renderCA}
                        invertContrast={true}
                        isLoading={isLoading}
                        withAdd={() => { setDisplayIssueCert(true); }}
                        config={tableConfig}
                        emptyContentComponent={
                            <Grid container justifyContent={"center"} alignItems={"center"} sx={{ height: "100%" }}>
                                <Grid item xs="auto" container justifyContent={"center"} alignItems={"center"} flexDirection="column">
                                    <img src={process.env.PUBLIC_URL + "/assets/icon-faulttolerance.png"} height={150} style={{ marginBottom: "25px" }} />
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 22, lineHeight: "24px", marginRight: "10px" }}>
                                        Start Issuing certificates
                                    </Typography>

                                    <Typography>To Issue certificates, enroll your devices through your DMS</Typography>
                                </Grid>
                            </Grid>
                        }
                        withRefresh={() => { refreshAction(); }}
                        onChange={(ev: any) => {
                            if (!deepEqual(ev, tableConfig)) {
                                setTableConfig(ev);
                            }
                        }}
                    />
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
                                <Grid item>
                                    <TextField label="Certificate Serial Number" value={isRevokeDialogOpen.serialNumber} disabled />
                                </Grid>
                                <Grid item container flexDirection={"column"} spacing={2}>
                                    <Grid item>
                                        <KeyValueLabel
                                            label="Issuer CA"
                                            value={(
                                                <FetchViewer fetcher={() => caApiCalls.getEngines()} errorPrefix="Could not fetch Crypto Engines" renderer={(engines) => {
                                                    return (
                                                        <CAViewer caData={caData} engine={engines.find(eng => eng.id === caData.engine_id)!} />
                                                    );
                                                }} />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Select label="Select Revocation Reason" value={revokeReason} onChange={(ev: any) => setRevokeReason(ev.target.value!)}>
                                            {
                                                Object.values(RevocationReason).map((rCode, idx) => (
                                                    <MenuItem key={idx} value={rCode} >
                                                        <Grid container spacing={2}>
                                                            <Grid item xs={2}>
                                                                <Typography>{rCode}</Typography>
                                                            </Grid>
                                                            <Grid item xs="auto">
                                                                <Typography fontSize={"12px"}>{getRevocationReasonDescription(rCode)}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    </MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        actions={
                            <Box>
                                <Button onClick={() => { setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" }); }}>Close</Button>
                                <MonoChromaticButton onClick={async () => {
                                    caApiCalls.updateCertificateStatus(isRevokeDialogOpen.serialNumber, CertificateStatus.Revoked, revokeReason);
                                    setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" });
                                }}>Revoke Certificate</MonoChromaticButton>
                            </Box>
                        }
                    />
                </>
            )
            : (
                <Grid item xs xl style={{ height: "100%", overflow: "hidden", background: theme.palette.background.default }} ref={containerRef}>
                    <Slide direction="left" in={displayIssueCert} container={containerRef.current} style={{ height: "100%" }}>
                        <Grid container flexDirection={"column"} spacing={2}>
                            <Grid item>
                                <Breadcrumbs>
                                    <Link underline="hover" color="inherit" onClick={() => { resetAddCertificate(); setDisplayIssueCert(false); }} sx={{ cursor: "pointer" }}>
                                        Issued Certificate List
                                    </Link>

                                    <Link underline="hover" color="inherit" onClick={() => resetAddCertificate()} sx={{ cursor: "pointer" }}>
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
                            <Grid item>
                                <Divider />
                            </Grid>
                            {
                                addCertMode === -1
                                    ? (
                                        <Grid item container spacing={3}>
                                            {
                                                [{
                                                    title: "In Place Generation",
                                                    icon: <AddCircleOutlineIcon fontSize="large" color="primary" />
                                                }, {
                                                    title: "Import And Sign CSR",
                                                    icon: <ArticleOutlinedIcon fontSize="large" color="primary" />
                                                }, {
                                                    title: "Import External Certificate",
                                                    icon: <PublishIcon fontSize="large" color="primary" />
                                                }].map((item, idx) => {
                                                    return (
                                                        <Grid item xs key={idx}>
                                                            <Box onClick={() => setAddCertMode(idx)} {...idx === hoveredItem && { component: Paper, elevation: 20 }} onMouseOver={() => setHoveredItem(idx)} onMouseOut={() => setHoveredItem(-1)} sx={{
                                                                cursor: "pointer",
                                                                borderRadius: "5px",
                                                                border: `2px dashed ${theme.palette.primary.main}`,
                                                                height: "150px",
                                                                ":hover": {
                                                                    border: `2px dashed ${theme.palette.primary.main}`, background: theme.palette.primary.light
                                                                }
                                                            }}>
                                                                <Grid container flexDirection={"column"} alignItems={"center"} justifyContent={"center"} sx={{ height: "100%" }}>
                                                                    <Grid item>
                                                                        <Typography fontFamily={"Roboto"} textTransform={"uppercase"} fontWeight={"500"} sx={{
                                                                            color: theme.palette.primary.main
                                                                        }}>
                                                                            {item.title}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item sx={{ marginTop: "10px" }}>
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
                                        <div style={{ padding: "18px" }}>
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
                                                                            <Grid item xs={12}>
                                                                                <Alert severity="success">
                                                                                    Certificate generated successfully. Certificate Serial Number: {importSignStatus.response.serial_number}
                                                                                </Alert>
                                                                            </Grid>
                                                                            <Grid item xs={12}>
                                                                                <CodeCopier code={window.window.atob(importSignStatus.response.certificate)} />
                                                                            </Grid>
                                                                        </Grid>
                                                                    )
                                                                    : (
                                                                        addCertMode === 0
                                                                            ? (
                                                                                <CSRInBrowserGenerator onCreate={async (key, csr) => {
                                                                                    setImportSignStatus({ loading: true, errMessage: "", response: undefined });
                                                                                    const singResp = await apicalls.cas.signCertificateRequest(caData.id, window.window.btoa(csr));
                                                                                    setImportSignStatus({ loading: false, errMessage: "", response: singResp });
                                                                                }} />
                                                                            )
                                                                            : (
                                                                                addCertMode === 1
                                                                                    ? (
                                                                                        <CSRImporter onCreate={async (csr) => {
                                                                                            setImportSignStatus({ loading: true, errMessage: "", response: undefined });
                                                                                            const singResp = await apicalls.cas.signCertificateRequest(caData.id, window.window.btoa(csr));
                                                                                            setImportSignStatus({ loading: false, errMessage: "", response: singResp });
                                                                                        }} />
                                                                                    )
                                                                                    : (
                                                                                        <CertificateImporterForm caSubjectCN={caData.subject.common_name} caId={caData.id} onCreate={async (crt) => {
                                                                                            setImportSignStatus({ loading: true, errMessage: "", response: undefined });
                                                                                            const singResp = await apicalls.cas.importCertificate(window.window.btoa(crt));
                                                                                            setImportSignStatus({ loading: false, errMessage: "", response: singResp });
                                                                                        }} />
                                                                                    )
                                                                            )
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

                                        </div>

                                    )
                            }
                        </Grid>
                    </Slide >
                </Grid >
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
                console.log(decCrt);
                setShowWarn(decCrt.subject.cn !== caSubjectCN);
            }
        };
        run();
    }, [crt]);

    return (
        <Grid container flexDirection={"column"} spacing={2}>
            <Grid item>
                <CertificateImporter onChange={(crt) => {
                    setCrt(crt);
                }} />
            </Grid>
            {
                crt !== undefined && crt !== "" && (
                    <>
                        {
                            showWarn && (
                                <Grid item>
                                    <Alert severity="warning">
                                        This certificate appears to be signed by another CA. The certificate will be uploaded although it wont be placed under this CA.
                                    </Alert>
                                </Grid>
                            )
                        }
                        <Grid item>
                            <Button variant="contained" onClick={() => onCreate(crt)}>Import Certificate</Button>
                        </Grid>
                    </>
                )
            }
        </Grid>

    );
};
