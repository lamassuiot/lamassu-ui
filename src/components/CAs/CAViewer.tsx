import { Box, Dialog, DialogContent, DialogTitle, IconButton, Paper, SxProps, Typography, useTheme } from "@mui/material";
import { CertificateAuthority, CertificateStatus, CryptoEngine } from "ducks/features/cas/models";
import { CertificateDecoder } from "components/Certificates/CertificateDecoder";
import { CodeCopier } from "components/CodeCopier";
import { CryptoEngineViewer } from "components/CryptoEngines/CryptoEngineViewer";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React from "react";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import moment from "moment";

export type Props = {
    caData: CertificateAuthority,
    engine: CryptoEngine
    actions?: React.ReactNode[]
    elevation?: boolean
    clickDisplay?: boolean
    sx?: SxProps
}

const CAViewer: React.FC<Props> = ({ caData, engine, actions = [], elevation = true, clickDisplay = false, sx = {} }) => {
    const theme = useTheme();
    const [displayCA, setDisplayCA] = React.useState<CertificateAuthority | undefined>(undefined);

    return (
        <Box {...elevation && { component: Paper }} sx={{ padding: "10px", background: elevation ? theme.palette.background.paper : "none", cursor: "pointer", width: "calc(100% - 20px)", ...sx }} >
            <Grid container columnGap={2} alignItems={"center"}>
                {
                    caData.certificate.type !== "EXTERNAL" && (
                        <Grid xs="auto">
                            <CryptoEngineViewer engine={engine} simple />
                        </Grid>
                    )
                }

                <Grid xs container flexDirection={"column"}>
                    <Grid xs>
                        <Typography sx={{ wordBreak: "break-word" }}>{caData.certificate.subject.common_name}</Typography>
                    </Grid>
                    <Grid xs>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 12 }}>{`CA ID: ${caData.id}`}</Typography>
                    </Grid>
                    <Grid xs>
                        {
                            caData.certificate.status === CertificateStatus.Revoked
                                ? (
                                    <Label color={"error"}>{`${caData.certificate.status} ·  ${moment.duration(moment(caData.certificate.revocation_timestamp).diff(moment())).humanize(true)}`}</Label>
                                )
                                : (
                                    <Label color="grey">{`${caData.certificate.status} ·  ${moment.duration(moment(caData.certificate.valid_to).diff(moment())).humanize(true)}`}</Label>
                                )
                        }
                    </Grid>
                </Grid>
                {
                    caData.certificate.type !== "MANAGED" && (
                        <Label color="primary">{caData.certificate.type}</Label>
                    )
                }
                {
                    clickDisplay && (
                        <Grid xs="auto">
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setDisplayCA(caData); }}>
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
                displayCA && (
                    <Dialog open={true} onClose={() => setDisplayCA(undefined)} maxWidth={"md"}>
                        <DialogTitle>
                            <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>{displayCA.id}</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} flexDirection={"column"}>
                                <Grid>
                                    <CodeCopier code={atob(displayCA.certificate.certificate)} />
                                </Grid>
                                <Grid>
                                    <CertificateDecoder crtPem={atob(displayCA.certificate.certificate)} />
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>
                )
            }
        </Box>
    );
};

export default CAViewer;
