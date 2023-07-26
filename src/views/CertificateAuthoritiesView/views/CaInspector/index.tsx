import React, { useEffect, useState } from "react";

import { Routes, Route, Link, Outlet, useLocation } from "react-router-dom";
import { Divider, Grid, IconButton, Tab, Tabs, Button, Typography, DialogContent, DialogContentText, Dialog, DialogActions, DialogTitle, Box, Skeleton } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import * as caActions from "ducks/features/cas/actions";
import * as caSelector from "ducks/features/cas/reducer";
import { useAppSelector } from "ducks/hooks";
import { useTheme } from "@mui/system";
import { CertificateView } from "./CertificateView";
import { IssuedCertificates } from "./IssuedCertificates";
import { CloudProviders } from "./CloudProviders";
import { CerificateOverview } from "./CertificateOverview";
import { useDispatch } from "react-redux";
import { SignVerifyView } from "./SignVerify";

interface CaInspectorProps {
    caName: string | undefined
}
export const CaInspector: React.FC<CaInspectorProps> = ({ caName }) => {
    return (
        <Routes>
            <Route path="/" element={<RoutedCaInspectorHeader caName={caName} />}>
                <Route path="cert" element={<CertificateView caName={caName!} />} />
                <Route path="issued" element={<IssuedCertificates caName={caName!} />} />
                <Route path="signverify" element={<SignVerifyWrapper caName={caName!} />} />
                <Route path="cloud-providers/*" element={<CloudProviders caName={caName!} />} />
                <Route index element={<CerificateOverview caName={caName!} />} />
            </Route>
        </Routes>
    );
};

interface RoutedCaInspectorHeaderProps {
    caName: string | undefined
}
const RoutedCaInspectorHeader: React.FC<RoutedCaInspectorHeaderProps> = ({ caName }) => {
    const location = useLocation();
    let selectedTab = 0;
    if (location.pathname.includes("cert")) {
        selectedTab = 1;
    } else if (location.pathname.includes("issued")) {
        selectedTab = 2;
    } else if (location.pathname.includes("signverify")) {
        selectedTab = 3;
    } else if (location.pathname.includes("cloud-providers")) {
        selectedTab = 4;
    }
    return (
        <CaInspectorHeader preSelectedTabIndex={selectedTab} caName={caName} />
    );
};

interface Props {
    caName: string | undefined
    preSelectedTabIndex: number | undefined
}

const CaInspectorHeader: React.FC<Props> = ({ caName, preSelectedTabIndex }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const caData = useAppSelector((state) => caSelector.getCA(state, caName!));

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState(preSelectedTabIndex !== undefined ? preSelectedTabIndex : 0);

    useEffect(() => {
        if (preSelectedTabIndex !== undefined) {
            setSelectedTab(preSelectedTabIndex);
        }
    }, [preSelectedTabIndex]);

    return (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {
                caData !== undefined
                    ? (
                        <>
                            <Box style={{ padding: "40px 40px 0 40px" }}>
                                <Grid item container spacing={2} justifyContent="flex-start">
                                    <Grid item xs={9}>
                                        <Box style={{ display: "flex", alignItems: "center" }}>
                                            {
                                                requestStatus.isLoading
                                                    ? (
                                                        <Skeleton variant="rectangular" width={350} height={22} sx={{ borderRadius: "5px" }} />
                                                    )
                                                    : (
                                                        <Grid container spacing={2}>
                                                            <Grid item xs="auto">
                                                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{caData.name}</Typography>
                                                            </Grid>
                                                            <Grid item xs="auto">
                                                                {
                                                                    !caData.with_private_key && (
                                                                        <LamassuChip label={"READ-ONLY CA"} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                                                                    )
                                                                }
                                                            </Grid>
                                                            <Grid item xs="auto" container spacing={"5px"}>
                                                                <Grid item xs="auto">
                                                                    <LamassuChip color={caData.key_metadata.strength_color} label={caData.key_metadata.strength} rounded />
                                                                </Grid>
                                                                <Grid item xs="auto">
                                                                    <LamassuChip color={caData.status_color} label={caData.status} rounded style={{ marginLeft: "5px" }} />
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    )
                                            }
                                        </Box>
                                    </Grid>
                                    <Grid item xs={3} container justifyContent="flex-end">
                                        <Grid item>
                                            {
                                                !requestStatus.isLoading && (
                                                    <IconButton onClick={() => setIsRevokeDialogOpen(true)} style={{ background: theme.palette.error.light }}>
                                                        <DeleteIcon style={{ color: theme.palette.error.main }} />
                                                    </IconButton>
                                                )
                                            }
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item container spacing={2} justifyContent="flex-start" style={{ marginTop: 0 }}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Grid item sx={{ marginTop: "0px" }}>
                                                    <Skeleton variant="rectangular" width={175} height={20} sx={{ borderRadius: "5px" }} />
                                                </Grid>
                                            )
                                            : (
                                                <>
                                                    <Grid item style={{ paddingTop: 0 }}>
                                                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>#{`${caData.key_metadata.type} ${caData.key_metadata.bits}`}</Typography>
                                                    </Grid>
                                                    <Grid item style={{ paddingTop: 0 }}>
                                                        <Box style={{ display: "flex", alignItems: "center" }}>
                                                            <AccessTimeIcon style={{ color: theme.palette.text.secondary, fontSize: 15, marginRight: 5 }} />
                                                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`Expiration date: ${moment(caData.valid_to).format("DD/MM/YYYY")}`}</Typography>
                                                        </Box>
                                                    </Grid>
                                                </>
                                            )
                                    }
                                </Grid>
                                <Box style={{ marginTop: 15, position: "relative", left: "-15px" }}>
                                    {
                                        !requestStatus.isLoading && (
                                            <Tabs value={selectedTab}>
                                                <Tab component={Link} to={""} label="Overview" />
                                                <Tab component={Link} to={"cert"} label="Root Certificate" />
                                                <Tab component={Link} to={"issued"} label="Issued Certificates" />
                                                <Tab component={Link} to={"signverify"} label="Sign & Verify" />
                                                <Tab component={Link} to={"cloud-providers"} label="Cloud Providers" />
                                            </Tabs>
                                        )
                                    }
                                </Box>
                            </Box>
                            <Divider />
                            <Box style={{ padding: 40, flexGrow: 1, overflowY: "auto", height: "500px" }}>
                                {
                                    !requestStatus.isLoading && (
                                        <Outlet />
                                    )
                                }
                            </Box>
                            {
                                !requestStatus.isLoading && (
                                    <Dialog open={isRevokeDialogOpen} onClose={() => setIsRevokeDialogOpen(false)}>
                                        <DialogTitle>Revoke CA: {caData.name}</DialogTitle>
                                        <DialogContent>
                                            <DialogContentText>
                                                You are about to revoke a CA. By revoing the certificate, you will also revoke al issued certificates.
                                            </DialogContentText>
                                            <Grid container style={{ marginTop: "10px" }}>
                                                <Grid item xs={12}>
                                                    <Typography variant="button">CA Name: </Typography>
                                                    <Typography variant="button" style={{ background: theme.palette.mode === "light" ? "#efefef" : "#666", padding: 5, fontSize: 12 }}>{caData.name}</Typography>
                                                </Grid>
                                                <Grid item xs={12}>
                                                    <Typography variant="button">CA Serial Number: </Typography>
                                                    <Typography variant="button" style={{ background: theme.palette.mode === "light" ? "#efefef" : "#666", padding: 5, fontSize: 12 }}>{caData.serial_number}</Typography>
                                                </Grid>
                                            </Grid>
                                        </DialogContent>
                                        <DialogActions>
                                            <Button onClick={() => setIsRevokeDialogOpen(false)} variant="outlined">Cancel</Button>
                                            <Button onClick={() => { dispatch(caActions.revokeCAAction.request({ caName: caData.name })); setIsRevokeDialogOpen(false); }} variant="contained">Revoke</Button>
                                        </DialogActions>
                                    </Dialog>
                                )
                            }
                        </>
                    )
                    : (
                        <Box sx={{ fontStyle: "italic" }}>CA not found</Box>
                    )
            }

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
