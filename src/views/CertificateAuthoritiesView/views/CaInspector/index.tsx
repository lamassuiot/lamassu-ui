import React, { useEffect, useState } from "react";

import { Grid, IconButton, Button, Typography, DialogContent, DialogContentText, Dialog, DialogActions, DialogTitle, Box, Alert, Paper, Skeleton } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTheme } from "@mui/system";
import { CertificateAuthority, CryptoEngine, getCA } from "ducks/features/cav3/apicalls";
import { CertificateOverview } from "./CertificateOverview";
import { CAMetadata } from "./CAMetadata";
import { CertificateView } from "./CertificateView";
import CertificateDecoder from "components/LamassuComponents/composed/Certificates/CertificateDecoder";
import { IssuedCertificates } from "./IssuedCertificates";
import { SignVerifyView } from "./SignVerify";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { CloudProviders } from "./CloudProviders";
import { TabsListWithRouter } from "components/LamassuComponents/dui/TabsListWithRouter";
import { errorToString } from "ducks/services/api";

interface Props {
    caName: string
    engines: CryptoEngine[]
}

export const CAInspector: React.FC<Props> = ({ caName, engines }) => {
    const theme = useTheme();

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

    const [caData, setCAData] = React.useState<CertificateAuthority | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const resp = await getCA(caName);
            setCAData(resp);
        } catch (err: any) {
            setError(errorToString(err));
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        fetchData();
    }, [caName]);

    if (isLoading) {
        return (
            <Box padding={"30px"}>
                <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </Box>
        );
    } else if (caData !== undefined) {
        return (

            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "40px 40px 0 40px" }}>
                    <Grid item container spacing={2} justifyContent="flex-start">
                        <Grid item xs container spacing={"10px"}>
                            <Grid item xs="auto">
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{caData.metadata["lamassu.io/name"]}</Typography>
                                <Label sx={{ marginTop: "5px", color: theme.palette.text.secondary }}>{caData.id}</Label>
                            </Grid>
                            {
                                <Grid item xs="auto">
                                    <LamassuChip label={caData.type} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                                </Grid>
                            }
                            <Grid item xs="auto" container>
                                <Grid item xs="auto">
                                    <LamassuChip label={caData.key_metadata.strength} rounded />
                                </Grid>
                                <Grid item xs="auto">
                                    <LamassuChip label={caData.status} rounded style={{ marginLeft: "5px" }} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs="auto" container justifyContent="flex-end">
                            <Grid item>
                                <IconButton onClick={() => setIsRevokeDialogOpen(true)} style={{ background: theme.palette.error.light }}>
                                    <DeleteIcon style={{ color: theme.palette.error.main }} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container spacing={2} justifyContent="flex-start" style={{ marginTop: 0 }}>
                        <Grid item style={{ paddingTop: 0 }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>#{`${caData.key_metadata.type} ${caData.key_metadata.bits}`}</Typography>
                        </Grid>
                        <Grid item style={{ paddingTop: 0 }}>
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                <AccessTimeIcon style={{ color: theme.palette.text.secondary, fontSize: 15, marginRight: 5 }} />
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`Expiration date: ${moment(caData.valid_to).format("DD/MM/YYYY")}`}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <TabsListWithRouter
                    headerStyle={{ margin: "0 25px" }}
                    contentStyle={{ margin: "0 35px" }}
                    useParamsKey="*"
                    tabs={[
                        {
                            label: "Overview",
                            path: "",
                            element: <CertificateOverview caData={caData} engines={engines} />
                        },
                        {
                            label: "Metadata",
                            path: "metadata",
                            element: <CAMetadata caData={caData} />
                        },
                        {
                            label: "CA Certificate",
                            path: "root",
                            element: (
                                <Grid container padding={"20px 0px"}>
                                    <Grid item xs={6}>
                                        <CertificateView certificate={caData} />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <CertificateDecoder crtPem={window.window.atob(caData.certificate)} />
                                    </Grid>
                                </Grid>
                            )
                        },
                        {
                            label: "Issued Certificate",
                            path: "certificates",
                            element: <IssuedCertificates caData={caData} />
                        },
                        {
                            label: "Sign & Verify",
                            path: "signature",
                            element: <SignVerifyView caData={caData} />
                        },
                        {
                            label: "Cloud Providers",
                            path: "cloud",
                            element: <CloudProviders caData={caData} />
                        }
                    ]}
                />
                <Dialog open={isRevokeDialogOpen} onClose={() => setIsRevokeDialogOpen(false)}>
                    <DialogTitle>Revoke CA: {caData.id}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            You are about to revoke a CA. By revoing the certificate, you will also revoke al issued certificates.
                        </DialogContentText>
                        <Grid container style={{ marginTop: "10px" }}>
                            <Grid item xs={12}>
                                <Typography variant="button">CA Name: </Typography>
                                <Typography variant="button" style={{ background: theme.palette.mode === "light" ? "#efefef" : "#666", padding: 5, fontSize: 12 }}>{caData.id}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="button">CA Serial Number: </Typography>
                                <Typography variant="button" style={{ background: theme.palette.mode === "light" ? "#efefef" : "#666", padding: 5, fontSize: 12 }}>{caData.serial_number}</Typography>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsRevokeDialogOpen(false)} variant="outlined">Cancel</Button>
                        <Button onClick={() => { setIsRevokeDialogOpen(false); }} variant="contained">Revoke</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    return (
        <Box component={Paper}>
            <Alert severity="error">
                {
                    "Could not fetch CA"
                }
                {
                    typeof error === "string" && error.length > 1 && (
                        <>: {error}</>
                    )
                }

            </Alert>
        </Box>
    );
};
