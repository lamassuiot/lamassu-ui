import React from "react";
import { Box, Dialog, DialogContent, DialogTitle, Grid, IconButton, Paper, Typography, useTheme } from "@mui/material";
import Label from "../dui/typographies/Label";
import moment from "moment";
import { CodeCopier } from "../dui/CodeCopier";
import { LamassuChip } from "../Chip";
import CertificateDecoder from "../composed/Certificates/CertificateDecoder";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cav3/apicalls";
import { CryptoEngineViewer } from "./CryptoEngineViewer";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";

export type Props = {
    caData: CertificateAuthority,
    engine: CryptoEngine
    actions?: React.ReactNode[]
    elevation?: boolean
    clickDisplay?: boolean
    size?: "small"
}

const CAViewer: React.FC<Props> = ({ caData, engine, actions = [], elevation = true, clickDisplay = false, size }) => {
    const theme = useTheme();
    const [displayCA, setDisplayCA] = React.useState<CertificateAuthority | undefined>(undefined);

    return (
        <Box {...elevation && { component: Paper }} sx={{ padding: "10px", background: elevation ? theme.palette.textField.background : "none", cursor: "pointer", width: "calc(100% - 20px)" }} >
            <Grid container columnGap={2} alignItems={"center"}>
                {
                    caData.type !== "EXTERNAL" && (
                        <Grid item xs="auto">
                            <CryptoEngineViewer engine={engine} simple />
                        </Grid>
                    )
                }

                <Grid item xs container flexDirection={"column"}>
                    <Grid item xs>
                        <Typography {...size === "small" && { fontSize: "0.8rem" }}>{caData.subject.common_name}</Typography>
                    </Grid>
                    <Grid item xs>
                        <Label {...size === "small" && { fontSize: "0.8rem" }}>{`CA ID: ${caData.id}`}</Label>
                    </Grid>
                    <Grid item xs>
                        <Label>{`expires ${moment.duration(moment(caData.valid_to).diff(moment())).humanize(true)}`}</Label>
                    </Grid>
                </Grid>
                {
                    caData.type !== "MANAGED" && (
                        <LamassuChip label={caData.type} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                    )
                }
                {
                    clickDisplay && (
                        <Grid item xs="auto">
                            <IconButton onClick={(ev) => { ev.stopPropagation(); ev.preventDefault(); setDisplayCA(caData); }}>
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
                displayCA && (
                    <Dialog open={true} onClose={() => setDisplayCA(undefined)} maxWidth={"md"}>
                        <DialogTitle>
                            <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>{displayCA.id}</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} flexDirection={"column"}>
                                <Grid item>
                                    <CodeCopier code={atob(displayCA.certificate)} />
                                </Grid>
                                <Grid item>
                                    <CertificateDecoder crtPem={atob(displayCA.certificate)} />
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
