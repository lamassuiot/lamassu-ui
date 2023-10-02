import React, { useEffect, useState } from "react";

import { Grid, IconButton, Button, Typography, Box, Alert, Paper, Skeleton, MenuItem } from "@mui/material";
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
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import CAViewer from "components/LamassuComponents/lamassu/CAViewer";
import * as caApiCalls from "ducks/features/cav3/apicalls";
import { Select } from "components/LamassuComponents/dui/Select";

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
    caName: string
    engines: CryptoEngine[]
}

export const CAInspector: React.FC<Props> = ({ caName, engines }) => {
    const theme = useTheme();

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

    const [caData, setCAData] = React.useState<CertificateAuthority | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);
    const [revokeReason, setRevokeReason] = useState("Unspecified");

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
                                    <LamassuChip label={caData.status} color={caData.status !== caApiCalls.CertificateStatus.Active ? "red" : "gray"} rounded style={{ marginLeft: "5px" }} />
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
                <Modal
                    title={"Revoke CA Certificate"}
                    subtitle={""}
                    isOpen={isRevokeDialogOpen}
                    onClose={function (): void {
                        setIsRevokeDialogOpen(false);
                    }}
                    content={(
                        <Grid container flexDirection={"column"} spacing={4} width={"1500px"}>
                            <Grid item>
                                <TextField label="CA ID" value={caData.id} disabled />
                            </Grid>
                            <Grid item>
                                <TextField label="Certificate Serial Number" value={caData.serial_number} disabled />
                            </Grid>
                            <Grid item container flexDirection={"column"} spacing={2}>
                                <Grid item>
                                    <KeyValueLabel
                                        label=""
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
                            <Button onClick={() => { setIsRevokeDialogOpen(false); }}>Close</Button>
                            <MonoChromaticButton onClick={async () => {
                                caApiCalls.updateCAStatus(caData.id, caApiCalls.CertificateStatus.Revoked, revokeReason);
                                setIsRevokeDialogOpen(false);
                            }}>Revoke CA Certificate</MonoChromaticButton>
                        </Box>
                    }
                />
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
