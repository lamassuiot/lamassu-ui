import React from "react";
import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import Label from "../dui/typographies/Label";
import moment from "moment";
import { CodeCopier } from "../dui/CodeCopier";
import CertificateDecoder from "../composed/Certificates/CertificateDecoder";
import { Certificate } from "ducks/features/cav3/models";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

export type Props = {
    certificate: Certificate,
    actions?: React.ReactNode[]
    elevation?: boolean
    clickDisplay?: boolean
    size?: "small"
}

const CertificateViewer: React.FC<Props> = ({ certificate, actions = [], elevation = true, clickDisplay = false, size }) => {
    const theme = useTheme();
    const [displayCertificate, setDisplayCertificate] = React.useState<Certificate | undefined>(undefined);

    return (
        <Box {...elevation && { component: Paper }} sx={{ padding: "10px", background: elevation ? theme.palette.textField.background : "none", cursor: "pointer", width: "calc(100% - 20px)" }} >
            <Grid container columnGap={2} alignItems={"center"}>

                <Grid item xs container flexDirection={"column"}>
                    <Grid item xs>
                        <Typography {...size === "small" && { fontSize: "0.8rem" }}>{certificate.subject.common_name}</Typography>
                    </Grid>
                    <Grid item xs>
                        <Label {...size === "small" && { fontSize: "0.8rem" }}>{`Serial Number: ${certificate.serial_number}`}</Label>
                    </Grid>
                    <Grid item xs>
                        <Label>{`expires ${moment.duration(moment(certificate.valid_to).diff(moment())).humanize(true)}`}</Label>
                    </Grid>
                </Grid>
                {
                    clickDisplay && (
                        <Grid item xs="auto">
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setDisplayCertificate(certificate); }}>
                                <RemoveRedEyeIcon />
                            </IconButton>
                        </Grid>
                    )
                }
                {
                    actions.length > 1 && (
                        <Grid item xs="auto" container spacing={1}>
                            {
                                actions.map((action, idx) => {
                                    return (
                                        <Grid item key={idx}>
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
                                <Grid item>
                                    <CodeCopier code={atob(displayCertificate.certificate)} />
                                </Grid>
                                <Grid item>
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

export default CertificateViewer;
