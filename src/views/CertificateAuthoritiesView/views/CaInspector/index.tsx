import React, { useEffect, useState } from "react";

import { Grid, IconButton, Button, Typography, Box, Alert, Paper, Skeleton, MenuItem } from "@mui/material";
import { LamassuChip } from "components/LamassuComponents/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import moment from "moment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useTheme } from "@mui/system";
import { CertificateOverview } from "./CertificateOverview";
import { CAMetadata } from "./CAMetadata";
import { CertificateView } from "./CertificateView";
import CertificateDecoder from "components/LamassuComponents/composed/Certificates/CertificateDecoder";
import { IssuedCertificates } from "./IssuedCertificates";
import { SignVerifyView } from "./SignVerify";
import Label from "components/LamassuComponents/dui/typographies/Label";
import { CloudProviders } from "./CloudProviders";
import { TabsListWithRouter } from "components/LamassuComponents/dui/TabsListWithRouter";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import { Modal } from "components/LamassuComponents/dui/Modal";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { KeyValueLabel } from "components/LamassuComponents/dui/KeyValueLabel";
import { FetchViewer } from "components/LamassuComponents/lamassu/FetchViewer";
import CAViewer from "components/LamassuComponents/lamassu/CAViewer";
import * as caApiCalls from "ducks/features/cav3/apicalls";
import { Select } from "components/LamassuComponents/dui/Select";
import { CAStatsByCA, CertificateStatus, CryptoEngine } from "ducks/features/cav3/models";
import { useDispatch } from "react-redux";
import { actions } from "ducks/actions";
import { useAppSelector } from "ducks/hooks";
import { selectors } from "ducks/reducers";
import RefreshIcon from "@mui/icons-material/Refresh";
import { apicalls } from "ducks/apicalls";
import { SingleStatDoughnut } from "components/Charts/SingleStatDoughnut";

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
    const dispatch = useDispatch();

    const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);

    const caData = useAppSelector(state => selectors.cas.getCA(state, caName));
    const requestState = useAppSelector(state => selectors.cas.getCAItemRequestStatus(state));
    const [caStats, setCAStats] = useState<CAStatsByCA>({});

    const [revokeReason, setRevokeReason] = useState("Unspecified");

    const refreshAction = async () => {
        const run = async () => {
            dispatch(actions.caActionsV3.getCAByID.request(caName));
            const stats = await apicalls.cas.getStatsByCA(caName);
            setCAStats(stats);
        };
        run();
    };

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        refreshAction();
    }, [caName]);

    const statsActive = caStats[CertificateStatus.Active] ? caStats[CertificateStatus.Active] : 0;
    const statsRevoked = caStats[CertificateStatus.Revoked] ? caStats[CertificateStatus.Revoked] : 0;
    const statsExpired = caStats[CertificateStatus.Expired] ? caStats[CertificateStatus.Expired] : 0;

    const totalCerts = statsActive + statsExpired + statsRevoked;

    let percentageActive = 0;
    if (statsActive > 0) {
        percentageActive = Math.round(statsActive * 100 / totalCerts);
    }

    if (requestState.isLoading) {
        return (
            <Box padding={"30px"}>
                <Skeleton variant="rectangular" width={"100%"} height={75} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </Box>
        );
    } else if (caData !== undefined) {
        let tabs = [
            {
                label: "Overview",
                path: "",
                goto: "",
                element: <div style={{ margin: "0 35px" }}>
                    <CertificateOverview caData={caData} engines={engines} />
                </div>
            },
            {
                label: "Metadata",
                path: "metadata",
                goto: "metadata",
                element: <div style={{ margin: "0 35px" }}>
                    <CAMetadata caData={caData} />
                </div>
            },
            {
                label: "CA Certificate",
                path: "root",
                goto: "root",
                element: (
                    <div style={{ margin: "0 35px" }}>
                        <Grid container padding={"20px 0px"}>
                            <Grid item xs={6}>
                                <CertificateView certificate={caData} />
                            </Grid>
                            <Grid item xs={6}>
                                <CertificateDecoder crtPem={window.window.atob(caData.certificate)} />
                            </Grid>
                        </Grid>
                    </div>
                )
            }
        ];

        if (caData.type !== "EXTERNAL") {
            tabs = [...tabs, {
                label: "Issued Certificate",
                path: "certificates",
                goto: "certificates",
                element: <div style={{ margin: "0 35px" }}>
                    <IssuedCertificates caData={caData} />
                </div>
            },
            {
                label: "Sign & Verify",
                path: "signature",
                goto: "signature",
                element: <div style={{ margin: "0 35px" }}>
                    <SignVerifyView caData={caData} />
                </div>
            },
            {
                label: "Cloud Providers",
                path: "cloud/*",
                goto: "cloud",
                element: <div style={{ margin: "0 35px" }}>
                    <CloudProviders caData={caData} />
                </div>
            }];
        }

        return (
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "30px 40px 0 40px" }}>
                    <Grid container spacing={2} justifyContent="flex-start">
                        <Grid item xs container spacing={"100px"}>
                            <Grid item xs="auto">
                                <Grid item xs="auto" container spacing={1}>
                                    {
                                        <Grid item xs="auto">
                                            <LamassuChip label={caData.type} color={[theme.palette.primary.main, theme.palette.primary.light]} />
                                        </Grid>
                                    }
                                    <Grid item xs="auto">
                                        <LamassuChip label={`Key Strength: ${caData.key_metadata.strength}`} rounded />
                                    </Grid>
                                    <Grid item xs="auto">
                                        <LamassuChip label={caData.status} color={caData.status !== CertificateStatus.Active ? "red" : "gray"} rounded style={{ marginLeft: "5px" }} />
                                    </Grid>
                                </Grid>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px", marginTop: "10px" }}>{caData.subject.common_name}</Typography>
                                <Label sx={{ marginTop: "5px", color: theme.palette.text.secondary }}>{caData.id}</Label>
                            </Grid>
                            {
                                caData.type !== "EXTERNAL" && totalCerts > 0 && (
                                    <Grid item xs="auto" container spacing={2}>
                                        <Grid item xs="auto">
                                            <SingleStatDoughnut statNumber={statsActive} total={totalCerts} color="green" label="Active" />
                                        </Grid>
                                        <Grid item xs="auto">
                                            <SingleStatDoughnut statNumber={statsExpired} total={totalCerts} color="orange" label="Expired" />
                                        </Grid>
                                        <Grid item xs="auto">
                                            <SingleStatDoughnut statNumber={statsRevoked} total={totalCerts} color="red" label="Revoked" />
                                        </Grid>
                                    </Grid>
                                )
                            }
                        </Grid>
                        <Grid item xs="auto" container justifyContent="flex-end" spacing={2}>
                            <Grid item>
                                <IconButton style={{ background: theme.palette.primary.light }} onClick={() => { refreshAction(); }}>
                                    <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                </IconButton>
                            </Grid>
                            <Grid item>
                                <IconButton onClick={() => setIsRevokeDialogOpen(true)} style={{ background: theme.palette.error.light }}>
                                    <DeleteIcon style={{ color: theme.palette.error.main }} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container spacing={2} justifyContent="flex-start" style={{ marginTop: 0 }}>
                        <Grid item style={{ paddingTop: 0 }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>{`${caData.key_metadata.type} ${caData.key_metadata.bits} - ${caData.key_metadata.strength}`}</Typography>
                        </Grid>
                        <Grid item style={{ paddingTop: 0 }}>
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                <AccessTimeIcon style={{ color: theme.palette.text.secondary, fontSize: 15, marginRight: 5 }} />
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`Expiration date: ${moment(caData.valid_to).format("DD/MM/YYYY")}`}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <div style={{ height: "1px", flex: 1 }}>
                    <TabsListWithRouter
                        headerStyle={{ margin: "0 25px" }}
                        contentStyle={{}}
                        useParamsKey="*"
                        tabs={tabs}
                    />
                </div>
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
                                await caApiCalls.updateCAStatus(caData.id, CertificateStatus.Revoked, revokeReason);
                                dispatch(actions.caActionsV3.revokeCA(caData.id));
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
                    typeof requestState.err === "string" && requestState.err.length > 1 && (
                        <>: {requestState.err}</>
                    )
                }

            </Alert>
        </Box>
    );
};
