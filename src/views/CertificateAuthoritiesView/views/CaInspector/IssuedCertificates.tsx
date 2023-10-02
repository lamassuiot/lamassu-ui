import React, { useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, MenuItem, Paper, Tooltip, Typography } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { ListWithDataController, ListWithDataControllerConfigProps, OperandTypes } from "components/LamassuComponents/Table";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import * as caApiCalls from "ducks/features/cav3/apicalls";
import { useTheme } from "@mui/system";
import deepEqual from "fast-deep-equal/es6";
import { IssueCert } from "../CaActions/IssueCertificate";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import { CertificateAuthority, Certificate } from "ducks/features/cav3/apicalls";
import { Select } from "components/LamassuComponents/dui/Select";
import { TextField } from "components/LamassuComponents/dui/TextField";
import CAViewer from "components/LamassuComponents/lamassu/CAViewer";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";

const revokeCodes = [
    ["AACompromise", "It is known, or suspected, that aspects of the Attribute Authority (AA) validated in the attribute certificate have been compromised."],
    ["AffiliationChanged", "The subject's name, or other validated information in the certificate, has changed without anything being compromised."],
    ["CACompromise", "The private key, or another validated portion of a Certificate Authority (CA) certificate, is suspected to have been compromised."],
    ["CertificateHold", "The certificate is temporarily suspended, and may either return to service or become permanently revoked in the future."],
    ["CessationOfOperation", "The certificate is no longer needed, but nothing is suspected to be compromised."],
    ["KeyCompromise", "The private key, or another validated portion of an end-entity certificate, is suspected to have been compromised."],
    ["PrivilegeWithdrawn", "A privilege contained within the certificate has been withdrawn."],
    ["RemoveFromCrl", "The certificate was revoked with CertificateHold on a base Certificate Revocation List (CRL) and is being returned to service on a delta CRL."],
    ["Superseded", "The certificate has been superseded, but without anything being compromised."],
    ["Unspecified", "Revocation occurred for a reason that has no more specific value."],
    ["WeakAlgorithmOrKey", "The certificate key uses a weak cryptographic algorithm, or the key is too short, or the key was generated in an unsafe manner."]
];

interface Props {
    caData: CertificateAuthority
}

export const IssuedCertificates: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [certs, setCerts] = useState<Certificate[]>([]);

    const [displayIssueCert, setDisplayIssueCert] = useState(false);
    const [tableConfig, setTableConfig] = useState<ListWithDataControllerConfigProps>(
        {
            filter: {
                enabled: false,
                filters: []
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
        try {
            const resp = await caApiCalls.getIssuedCertificatesByCA(
                caData.id
                // tableConfig.pagination.selectedItemsPerPage!,
                // tableConfig.pagination.selectedPage! * tableConfig.pagination.selectedItemsPerPage!,
                // tableConfig.sort.selectedMode!,
                // tableConfig.sort.selectedField!,
                // tableConfig.filter.filters!.map((f: any) => { return f.propertyKey + "[" + f.propertyOperator + "]=" + f.propertyValue; })
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

    const [showCertificate, setShowCertificate] = useState<string | undefined>(undefined);
    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState({ isOpen: false, serialNumber: "" });
    const [revokeReason, setRevokeReason] = useState("Unspecified");

    const certTableColumns = [
        { key: "serialNumber", dataKey: "serial_number", query: true, title: "Serial Number", type: OperandTypes.string, align: "start", size: 4 },
        { key: "commonName", dataKey: "subject.common_name", query: true, title: "Common Name", type: OperandTypes.string, align: "center", size: 3 },
        { key: "key", dataKey: "", title: "Key", type: OperandTypes.string, align: "center", size: 2 },
        { key: "certificateStatus", dataKey: "status", title: "Certificate Status", type: OperandTypes.enum, align: "center", size: 1 },
        { key: "certificateIssuance", dataKey: "valid_to", title: "Issued At", type: OperandTypes.date, align: "center", size: 2 },
        { key: "certificateExpiration", dataKey: "valid_to", title: "Expires At", type: OperandTypes.date, align: "center", size: 2 },
        { key: "certificateRevocation", dataKey: "revocation_timestamp", title: "Revoked At", type: OperandTypes.date, align: "center", size: 3 },
        { key: "revocationReason", dataKey: "revocation_reason", title: "Revocation Reason", type: OperandTypes.enum, align: "center", size: 1 },
        { key: "actions", title: "", align: "end", size: 2 }
    ];

    const renderCA = (cert: Certificate) => {
        return {
            serialNumber: <Typography style={{ fontWeight: "500", fontSize: 13, color: theme.palette.text.primary }}>#{cert.serial_number}</Typography>,
            commonName: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, overflowWrap: "break-word", width: "100%", textAlign: "center" }}>{cert.subject.common_name}</Typography>,
            key: (
                <LamassuChip label={`${cert.key_metadata.type}-${cert.key_metadata.bits} ${cert.key_metadata.strength}`} />
            ),
            certificateStatus: (
                <LamassuChip label={cert.status} color={cert.status === caApiCalls.CertificateStatus.Active ? "green" : "red" } />
            ),
            certificateIssuance: (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
                        {moment(cert.valid_from).format("DD-MM-YYYY HH:mm")}
                    </Typography >
                    <Typography style={{ fontWeight: "300", fontSize: 12, color: theme.palette.text.primary }}>
                        {moment.duration(moment(caData.valid_from).diff(moment())).humanize(true)}
                    </Typography >
                </Box>
            ),
            certificateExpiration: (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
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
                                    <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary }}>
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
                                title=""
                                isOpen={showCertificate === cert.serial_number}
                                onClose={() => { setShowCertificate(undefined); }}
                                subtitle=""
                                actions={
                                    <Box>
                                        <Button onClick={() => { setShowCertificate(undefined); }}>Close</Button>
                                    </Box>
                                }
                                content={
                                    <CodeCopier code={window.window.atob(cert.certificate)} enableDownload downloadFileName={caData.id + "_" + cert.serial_number + ".crt"} />
                                }
                            />
                        </Grid>
                        {
                            cert.status !== caApiCalls.CertificateStatus.Revoked && (
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
                            cert.status === caApiCalls.CertificateStatus.Revoked && (
                                cert.revocation_reason === "CertificateHold" && (
                                    <Grid item>
                                        <Tooltip title="ReActivate certificate">
                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                <IconButton>
                                                    <UnarchiveOutlinedIcon fontSize={"small"} onClick={() => {
                                                        caApiCalls.updateCertificateStatus(cert.serial_number, caApiCalls.CertificateStatus.Active);
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
                        setTableConfig(prev => ({ ...prev, ...ev }));
                    }
                }}
            />
            {
                displayIssueCert && (
                    <IssueCert caName={caData.id} isOpen={displayIssueCert} onClose={() => { setDisplayIssueCert(false); refreshAction(); }} />
                )
            }
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
                                        revokeCodes.map((rCode, idx) => (
                                            <MenuItem key={idx} value={rCode[0]} >
                                                <Grid container spacing={2}>
                                                    <Grid item xs={2}>
                                                        <Typography>{rCode[0]}</Typography>
                                                    </Grid>
                                                    <Grid item xs="auto">
                                                        <Typography fontSize={"12px"}>{rCode[1]}</Typography>
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
                            caApiCalls.updateCertificateStatus(isRevokeDialogOpen.serialNumber, caApiCalls.CertificateStatus.Revoked, revokeReason);
                            setIsRevokeDialogOpen({ isOpen: false, serialNumber: "" });
                        }}>Revoke Certificate</MonoChromaticButton>
                    </Box>
                }
            />

        </>
    );
};
