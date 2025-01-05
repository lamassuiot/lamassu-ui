import { Box, IconButton, Paper, Tooltip, Typography, lighten, useTheme } from "@mui/material";
import { Certificate, CertificateAuthority, CertificateStatus } from "ducks/features/cas/models";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import moment from "moment";
import Label from "components/Label";
import apicalls from "ducks/apicalls";
import { enqueueSnackbar } from "notistack";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import { ShowCertificateModal } from "./Modals/ShowCertificate";
import { RevokeCertificateModal } from "./Modals/RevokeCertificate";

export type Props = {
    certificate: Certificate,
    issuerCA?: CertificateAuthority,
    actions?: React.ReactNode[]
    clickDisplay?: boolean
    clickRevoke?: boolean
    onRevoke?: () => void
    onReactivate?: () => void
}

export const CertificateViewer: React.FC<Props> = ({ certificate, issuerCA, actions = [], clickDisplay = false, clickRevoke = false, onRevoke = () => {}, onReactivate = () => {} }) => {
    const theme = useTheme();

    const [openShowDialog, setOpenShowDialog] = useState(false);
    const [openRevokeDialog, setOpenRevokeDialog] = useState(false);

    return (
        <Box sx={{ padding: "10px", cursor: "pointer", width: "calc(100% - 20px)" }} >
            <Grid container columnGap={1} alignItems={"center"}>
                <Grid xs container flexDirection={"column"}>
                    <Grid xs>
                        <Typography >{certificate.subject.common_name}</Typography>
                    </Grid>
                    <Grid xs>
                        <Typography sx={{ fontSize: "0.8rem", color: lighten(theme.palette.text.primary, 0.4) }} >{`Serial Number: ${certificate.serial_number}`}</Typography>
                    </Grid>
                    {
                        issuerCA && (
                            <Grid xs>
                                <Typography sx={{ fontSize: "0.8rem", color: lighten(theme.palette.text.primary, 0.4) }}>{`Issued By: ${certificate.issuer_metadata.id} (${issuerCA.certificate.subject.common_name})`}</Typography>
                            </Grid>
                        )
                    }
                    <Grid xs container spacing={1} alignItems={"center"}>
                        {
                            certificate.status === CertificateStatus.Revoked
                                ? (
                                    <Grid xs="auto">
                                        <Label color="error" size="small">{`REVOKED - ${certificate.revocation_reason} · ${moment(certificate.revocation_timestamp).format("DD/MM/YYYY HH:mm")} (${moment.duration(moment(certificate.revocation_timestamp).diff(moment())).humanize(true)})`}</Label>
                                    </Grid>
                                )
                                : (
                                    <Grid xs="auto">
                                        <Typography sx={{ fontSize: "0.8rem", color: lighten(theme.palette.text.primary, 0.4) }} >{`expires ${moment.duration(moment(certificate.valid_to).diff(moment())).humanize(true)}`}</Typography>
                                    </Grid>
                                )
                        }
                    </Grid>
                </Grid>
                {
                    clickDisplay && (
                        <Grid xs="auto">
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setOpenShowDialog(true); }}>
                                <RemoveRedEyeIcon />
                            </IconButton>
                        </Grid>
                    )
                }
                {
                    clickRevoke && (
                        <>
                            {
                                certificate.status !== CertificateStatus.Revoked && (
                                    <Grid xs="auto">
                                        <Tooltip title="Revoke Certificate">
                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.error.light, 0.8), width: 35, height: 35 }}>
                                                <IconButton onClick={() => {
                                                    setOpenRevokeDialog(true);
                                                }}>
                                                    <DeleteIcon fontSize={"small"} sx={{ color: theme.palette.error.main }} />
                                                </IconButton>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                )
                            }
                            {
                                certificate.status === CertificateStatus.Revoked && certificate.revocation_reason === "CertificateHold" && (
                                    <Grid xs="auto">
                                        <Tooltip title="ReActivate certificate">
                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                                <IconButton onClick={() => {
                                                    try {
                                                        apicalls.cas.updateCertificateStatus(certificate.serial_number, CertificateStatus.Active, "");
                                                        onReactivate();
                                                        enqueueSnackbar(`Certificate with Serial Number ${certificate.serial_number} and CN ${certificate.subject.common_name} reactivated`, { variant: "success" });
                                                    } catch (err) {
                                                        enqueueSnackbar(`Error while reactivating Certificate with Serial Number ${certificate.serial_number} and CN ${certificate.subject.common_name}: ${err}`, { variant: "error" });
                                                    }
                                                }}>
                                                    <UnarchiveOutlinedIcon fontSize={"small"} sx={{ color: theme.palette.primary.main }} />
                                                </IconButton>
                                            </Box>
                                        </Tooltip>
                                    </Grid>
                                )
                            }
                        </>
                    )
                }
                {
                    actions.length > 1 && (
                        <Grid xs="auto" container spacing={1}>
                            {
                                actions.map((action, idx) => {
                                    return (
                                        <Grid key={idx}>
                                            {action}
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
                    )
                }
            </Grid>
            {
                openShowDialog && (
                    <ShowCertificateModal certificate={certificate} onClose={() => {
                        setOpenShowDialog(false);
                    }} open={true} />
                )
            }
            {
                openRevokeDialog && (
                    <RevokeCertificateModal certificate={certificate} onClose={() => {
                        setOpenRevokeDialog(false);
                    }} open={true} onRevoke={() => {
                        onRevoke();
                    }} />
                )
            }
        </Box>
    );
};
