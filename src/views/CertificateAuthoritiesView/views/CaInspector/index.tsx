import React, { useEffect, useState } from "react";

import { Routes, Route, useLocation } from "react-router-dom";
import { Grid, IconButton, Button, Typography, DialogContent, DialogContentText, Dialog, DialogActions, DialogTitle, Box } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import * as caActions from "ducks/features/cas/actions";
import { useTheme } from "@mui/system";
import { useDispatch } from "react-redux";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import { getCA } from "ducks/features/cav3/apicalls";
import { TabsList } from "components/LamassuComponents/dui/TabsList";
import { CertificateOverview } from "./CertificateOverview";
import { CAMetadata } from "./CAMetadata";
import { CertificateView } from "./CertificateView";
import CertificateDecoder from "components/LamassuComponents/composed/Certificates/CertificateDecoder";
import { IssuedCertificates } from "./IssuedCertificates";
import { SignVerifyView } from "./SignVerify";

interface CaInspectorProps {
    caName: string
}
export const CaInspector: React.FC<CaInspectorProps> = ({ caName }) => {
    return (
        <Routes>
            <Route path="/" element={<RoutedCaInspectorHeader caName={caName} />} />
        </Routes>
    );
};

interface RoutedCaInspectorHeaderProps {
    caName: string
}
const RoutedCaInspectorHeader: React.FC<RoutedCaInspectorHeaderProps> = ({ caName }) => {
    const location = useLocation();
    let selectedTab = 0;
    if (location.pathname.includes("cert")) {
        selectedTab = 1;
    } else if (location.pathname.includes("issued")) {
        selectedTab = 2;
    } else if (location.pathname.includes("sign-verify")) {
        selectedTab = 3;
    } else if (location.pathname.includes("cloud-providers")) {
        selectedTab = 4;
    }
    return (
        <CaInspectorHeader preSelectedTabIndex={selectedTab} caName={caName} />
        <CaInspectorHeader preSelectedTabIndex={selectedTab} caName={caName} />
    );
};

interface Props {
    caName: string
    preSelectedTabIndex: number | undefined
}

const CaInspectorHeader: React.FC<Props> = ({ caName, preSelectedTabIndex }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState(preSelectedTabIndex !== undefined ? preSelectedTabIndex : 0);

    useEffect(() => {
        if (preSelectedTabIndex !== undefined) {
            setSelectedTab(preSelectedTabIndex);
        }
    }, [preSelectedTabIndex]);

    return (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <FetchViewer fetcher={() => getCA(caName)} renderer={(caData) => (

                <>
                    <Box style={{ padding: "40px 40px 0 40px" }}>
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={9}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{caData.id}</Typography>
                                    <LamassuChip label={caData.key_metadata.strength} rounded />
                                    <LamassuChip label={caData.status} rounded style={{ marginLeft: "5px" }} />
                                </Box>
                            </Grid>
                            <Grid item xs={3} container justifyContent="flex-end">
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
                    <TabsList
                        headerStyle={{ margin: "0 25px" }}
                        contentStyle={{ margin: "0 35px" }}
                        tabs={[
                            {
                                label: "Overview",
                                element: <CertificateOverview caData={caData} />
                            },
                            {
                                label: "Metadata",
                                element: <CAMetadata caData={caData} />
                            },
                            {
                                label: "CA Certificate",
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
                                element: <IssuedCertificates caData={caData} />
                            },
                            {
                                label: "Sign & Verify",
                                element: <SignVerifyView caData={caData} />
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
                            <Button onClick={() => { dispatch(caActions.revokeCAAction.request({ caName: caData.id })); setIsRevokeDialogOpen(false); }} variant="contained">Revoke</Button>
                        </DialogActions>
                    </Dialog>
                </>
            )
            } />

        </Box>
    );
};

interface SignVerifyWrapperProps {
    caName: string | undefined
}

const SignVerifyWrapper: React.FC<SignVerifyWrapperProps> = ({ caName }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const caData = useAppSelector((state) => caSelector.getCA(state, caName!));

    if (!caData) {
        return <></>;
    }

    return <SignVerifyView caData={caData} />;
};
