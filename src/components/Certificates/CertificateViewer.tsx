import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography, lighten, useTheme } from "@mui/material";
import { Certificate, CertificateAuthority } from "ducks/features/cas/models";
import { CertificateDecoder } from "./CertificateDecoder";
import { CodeCopier } from "components/CodeCopier";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import moment from "moment";

export type Props = {
    certificate: Certificate,
    issuerCA: CertificateAuthority,
    actions?: React.ReactNode[]
    clickDisplay?: boolean
}

export const CertificateViewer: React.FC<Props> = ({ certificate, issuerCA, actions = [], clickDisplay = false }) => {
    const theme = useTheme();
    const [displayCertificate, setDisplayCertificate] = React.useState<Certificate | undefined>(undefined);

    return (
        <Box sx={{ padding: "10px", cursor: "pointer", width: "calc(100% - 20px)" }} >
            <Grid container columnGap={2} alignItems={"center"}>
                <Grid xs container flexDirection={"column"}>
                    <Grid xs>
                        <Typography >{certificate.subject.common_name}</Typography>
                    </Grid>
                    <Grid xs>
                        <Typography sx={{ fontSize: "0.8rem", color: lighten(theme.palette.text.primary, 0.4) }} >{`Serial Number: ${certificate.serial_number}`}</Typography>
                    </Grid>
                    <Grid xs>
                        <Typography sx={{ fontSize: "0.8rem", color: lighten(theme.palette.text.primary, 0.4) }}>{`Issued By: ${certificate.issuer_metadata.id} (${issuerCA.subject.common_name})`}</Typography>
                    </Grid>
                    <Grid xs>
                        <Typography sx={{ fontSize: "0.8rem", color: lighten(theme.palette.text.primary, 0.4) }} >{`expires ${moment.duration(moment(certificate.valid_to).diff(moment())).humanize(true)}`}</Typography>
                    </Grid>
                </Grid>
                {
                    clickDisplay && (
                        <Grid xs="auto">
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setDisplayCertificate(certificate); }}>
                                <RemoveRedEyeIcon />
                            </IconButton>
                        </Grid>
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
                displayCertificate && (
                    <Dialog open={true} onClose={() => setDisplayCertificate(undefined)} maxWidth={"md"}>
                        <DialogTitle>
                            <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>{displayCertificate.serial_number}</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} flexDirection={"column"}>
                                <Grid>
                                    <CodeCopier code={atob(displayCertificate.certificate)} />
                                </Grid>
                                <Grid>
                                    <CertificateDecoder crtPem={atob(displayCertificate.certificate)} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>
                )
            }
        </Box>
    );
};
