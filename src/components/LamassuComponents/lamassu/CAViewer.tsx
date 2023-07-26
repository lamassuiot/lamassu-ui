import React from "react";
import { Box, Dialog, DialogContent, DialogTitle, Grid, Paper, Typography, useTheme } from "@mui/material";
import { CertificateAuthority } from "ducks/features/cas/models";
import Label from "../dui/typographies/Label";
import moment from "moment";
import CertificateDecoder from "../composed/Certificates/CertificateDecoder";
import { CodeCopier } from "../dui/CodeCopier";

export interface Props {
    caData: CertificateAuthority,
    style?: React.CSSProperties
    size?: "small"
}

const CAViewer: React.FC<Props> = ({ caData, size, style }) => {
    const theme = useTheme();
    const [displayCA, setDisplayCA] = React.useState<CertificateAuthority | undefined>(undefined);

    return (
        <Box component={Paper} sx={{ padding: "5px", background: theme.palette.textField.background, cursor: "pointer", ...{ style } }} onClick={() => setDisplayCA(caData)}>
            <Grid container columnGap={2} alignItems={"center"}>
                <Grid item xs={"auto"} height={"40px"}>
                    <img src={process.env.PUBLIC_URL + "/assets/AWS-SM.png"} height={"40px"} width={"40px"} />
                </Grid>
                <Grid item xs container flexDirection={"column"}>
                    <Grid item xs>
                        <Typography fontSize={size === "small" ? "0.85rem" : "1rem"}>{caData.name}</Typography>
                    </Grid>
                    <Grid item xs>
                        <Label>{moment.duration(moment(caData.valid_to).diff(moment())).humanize(true)}</Label>
                    </Grid>
                </Grid>
            </Grid>
            {
                displayCA && (
                    <Dialog open={true} onClose={() => setDisplayCA(undefined)} maxWidth={"md"}>
                        <DialogTitle>
                            <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>{displayCA.name}</Typography>
                        </DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2} flexDirection={"column"}>
                                <Grid item>
                                    <CodeCopier code={window.atob(displayCA.certificate)} />
                                </Grid>
                                <Grid item>
                                    <CertificateDecoder crtPem={window.atob(displayCA.certificate)} />
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
