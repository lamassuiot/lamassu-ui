import { Box, Button, IconButton, Tooltip, Typography, lighten } from "@mui/material";
import { CAMetadata } from "./CAMetadata";
import { CertificateAuthority, CertificateStatus, RevocationReason, getRevocationReasonDescription } from "ducks/features/cas/models";
import { CertificateDecoder } from "components/Certificates/CertificateDecoder";
import { CertificateOverview } from "./CertificateOverview";
import { CertificateView } from "./CertificateView";
import { FetchViewer } from "components/FetchViewer";
import { IssuedCertificates } from "./IssuedCertificates";
import { Modal } from "../../components/Modal";
import { Select } from "components/Select";
import { SignVerifyView } from "./SignVerify";
import { TabsListWithRouter } from "components/TabsListWithRouter";
import { TextField } from "components/TextField";
import { enqueueSnackbar } from "notistack";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useTheme } from "@mui/system";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DeleteIcon from "@mui/icons-material/Delete";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { useEffect, useState } from "react";
import RefreshIcon from "@mui/icons-material/Refresh";
import apicalls from "ducks/apicalls";
import moment from "moment";
import { SingleStatDoughnut } from "components/Charts/SingleStatDouhbnut";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import { LoadingButton } from "@mui/lab";
import download from "utils/downloader";
import { useLoading } from "components/Spinner/LoadingContext";
import { getCA } from "ducks/features/cas/apicalls";
import { ErrorBox } from "components/ErrorBox/ErrorBox";
import { CAOutletContext } from "./CAListView";

export const CAInspector: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const params = useParams();

    const { setLoading } = useLoading();

    const [revokeDialog, setRevokeDialog] = useState<CertificateAuthority | undefined>();
    const [revokeReason, setRevokeReason] = useState("Unspecified");
    const [loadingCRLResp, setLoadingCRLResp] = useState(false);
    const [caData, setCaData] = useState<CertificateAuthority >({} as CertificateAuthority);
    const [fetchError, setFetchError] = useState<string | undefined>();

    const caName = params.caName || "";

    const { engines, shoulUpdateCAs } = useOutletContext<CAOutletContext>();

    useEffect(() => {
        fetchCA(caName);
    }, [caName]);

    const fetchCA = (caName: string) => {
        if (caName === "") {
            return;
        }

        setLoading(true);
        getCA(caName)
            .then((result) => {
                setCaData(result);
            })
            .catch(error => {
                setFetchError(error);
                console.error(error);
            })
            .finally(() => setLoading(false));
    };

    const refreshAction = () => {
        fetchCA(caName);
    };

    const handlePermanentlyDelete = async () => {
        try {
            await apicalls.cas.deleteCA(caData.id);
            shoulUpdateCAs();
            navigate("/cas");
            enqueueSnackbar(`CA with ID ${caData.id} and CN ${caData.certificate.subject.common_name} deleted`, { variant: "success" });
        } catch (e) {
            enqueueSnackbar(`Error while deleting CA with ID ${caData.id} and CN ${caData.certificate.subject.common_name}: ${e}`, { variant: "error" });
        }
    };

    if (fetchError) {
        return <ErrorBox error={fetchError} errorPrefix="Could not fetch CA" />;
    }

    if (caName === "") {
        return <Typography sx={{ fontStyle: "italic" }}>Unspecified</Typography>;
    }

    if (caData === undefined || caData.id === undefined) {
        return <></>;
    }

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
                <CAMetadata caData={caData} onMetadataChange={() => {
                    refreshAction();
                }} />
            </div>
        },
        {
            label: "CA Certificate",
            path: "root",
            goto: "root",
            element: (
                <div style={{ margin: "0 35px" }}>
                    <Grid container padding={"20px 0px"}>
                        <Grid xs={12} md={6}>
                            <CertificateView certificate={caData.certificate} />
                        </Grid>
                        <Grid xs={12} md={6}>
                            <CertificateDecoder crtPem={window.window.atob(caData.certificate.certificate)} />
                        </Grid>
                    </Grid>
                </div>
            )
        }
    ];

    if (caData.certificate.type !== "EXTERNAL") {
        tabs = [...tabs, {
            label: "Issued Certificate",
            path: "certificates",
            goto: "certificates",
            element: <IssuedCertificates caData={caData} />
        },
        {
            label: "Sign & Verify",
            path: "signature",
            goto: "signature",
            element: <div style={{ margin: "0 35px" }}>
                <SignVerifyView caData={caData} />
            </div>
        }
            // {
            //     label: "Cloud Providers",
            //     path: "cloud/*",
            //     goto: "cloud",
            //     element: <div style={{ margin: "0 35px" }}>
            //         <CloudProviders caData={caData} />
            //     </div>
            // }
        ];
    }

    const handleRevokeCertificate = async () => {
        try {
            apicalls.cas.updateCAStatus(revokeDialog!.id, CertificateStatus.Revoked, revokeReason);
            refreshAction();
            enqueueSnackbar(`CA with ID ${revokeDialog?.id} and CN ${revokeDialog?.certificate.subject.common_name} revoked`, { variant: "success" });
            setRevokeDialog(undefined);
            shoulUpdateCAs();
        } catch (err) {
            enqueueSnackbar(`Error while revoking CA with ID ${revokeDialog?.id} and CN ${revokeDialog?.certificate.subject.common_name}: ${err}`, { variant: "error" });
        }
    };

    return (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Box style={{ padding: "30px 40px 0 40px" }}>
                <Grid container spacing={2}>
                    <Grid xs container>
                        <Grid xs="auto" container spacing={1} flex={"auto"}>
                            {
                                <Grid xs="auto">
                                    <Label color={"primary"}>{caData.certificate.type}</Label>
                                </Grid>
                            }
                            <Grid xs="auto">
                                <Label color={caData.certificate.status !== CertificateStatus.Active ? "error" : "grey"}>{caData.certificate.status}</Label>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid xs="auto" container>
                        <Grid xs="auto">
                            <Tooltip title="Reload CA data">
                                <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={ refreshAction }>
                                    <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                </IconButton>
                            </Tooltip >
                        </Grid>

                        <Grid xs="auto">
                            <Tooltip title="Download CRL">
                                <LoadingButton loading={loadingCRLResp} onClick={async () => {
                                    setLoadingCRLResp(true);
                                    try {
                                        const crl = await apicalls.va.getCRL(caData.certificate.subject_key_id);
                                        download(`${caData.certificate.subject.common_name}.crl`, crl);
                                    } catch (e) {
                                        enqueueSnackbar(`Error while downloading CRL for CA with ID ${caData.id} and CN ${caData.certificate.subject.common_name}: ${e}`, { variant: "error" });
                                    }
                                    setLoadingCRLResp(false);
                                }} style={{ background: lighten(theme.palette.primary.main, 0.7) }} endIcon={<FileDownloadRoundedIcon fontSize={"small"} />}>
                                    CRL
                                </LoadingButton>
                            </Tooltip >
                        </Grid>

                        {
                            (caData.certificate.type !== "EXTERNAL" && caData.certificate.status === CertificateStatus.Active) && (
                                <Grid xs="auto">
                                    <Tooltip title="Revoke CA">
                                        <IconButton onClick={() => setRevokeDialog(caData)} style={{ background: lighten(theme.palette.error.main, 0.7) }}>
                                            <DeleteIcon style={{ color: theme.palette.error.main }} />
                                        </IconButton>
                                    </Tooltip >
                                </Grid>
                            )
                        }
                        {
                            (
                                (caData.certificate.type === "EXTERNAL" || caData.certificate.status !== CertificateStatus.Active)) && (
                                <Grid xs="auto">
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={handlePermanentlyDelete}
                                    >
                                        Permanently Delete
                                    </Button>
                                </Grid>
                            )
                        }
                    </Grid>
                </Grid>
                <Grid container spacing={2} style={{ marginTop: 0 }}>
                    <Grid xs="auto">
                        <Grid xs={12}>
                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px", marginBottom: "5px" }}>{caData.certificate.subject.common_name}</Typography>
                            <Label>{caData.id}</Label>
                        </Grid>
                        <Grid style={{ paddingTop: 0 }}>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 13 }}>{`${caData.certificate.key_metadata.type} ${caData.certificate.key_metadata.bits} - ${caData.certificate.key_metadata.strength}`}</Typography>
                        </Grid>
                        <Grid style={{ paddingTop: 0 }}>
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                <AccessTimeIcon style={{ color: theme.palette.text.secondary, fontSize: 15, marginRight: 5 }} />
                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13 }}>{`Expiration date: ${moment(caData.certificate.valid_to).format("DD/MM/YYYY")}`}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid xs="auto">
                        {
                            caData.certificate.type !== "EXTERNAL" && (
                                <FetchViewer
                                    key={caData.id}
                                    fetcher={() => apicalls.cas.getStatsByCA(caName)}
                                    renderer={(caStats) => {
                                        const statsActive = caStats[CertificateStatus.Active] ?? 0;
                                        const statsRevoked = caStats[CertificateStatus.Revoked] ?? 0;
                                        const statsExpired = caStats[CertificateStatus.Expired] ?? 0;

                                        const totalCerts = statsActive + statsExpired + statsRevoked;
                                        if (totalCerts === 0) {
                                            return <></>;
                                        }

                                        return (
                                            <Grid xs="auto" container spacing={2}>
                                                <Grid xs="auto">
                                                    <SingleStatDoughnut statNumber={statsActive} total={totalCerts} color="green" label="Active" />
                                                </Grid>
                                                <Grid xs="auto">
                                                    <SingleStatDoughnut statNumber={statsExpired} total={totalCerts} color="orange" label="Expired" />
                                                </Grid>
                                                <Grid xs="auto">
                                                    <SingleStatDoughnut statNumber={statsRevoked} total={totalCerts} color="red" label="Revoked" />
                                                </Grid>
                                            </Grid>
                                        );
                                    }}
                                />
                            )
                        }
                    </Grid>
                </Grid>
            </Box>
            <div style={{ height: "1px", flex: 1 }}>
                <TabsListWithRouter
                    headerStyle={{ margin: "10px 20px 0 20px", padding: "10px 0 0 0" }}
                    contentStyle={{
                        padding: "10px"
                    }}
                    useParamsKey="*"
                    tabs={tabs}
                />
            </div>
            <Modal
                title={"Revoke CA Certificate"}
                subtitle={""}
                isOpen={revokeDialog !== undefined}
                onClose={function (): void {
                    setRevokeDialog(undefined);
                }}
                maxWidth={"md"}
                content={
                    revokeDialog
                        ? (
                            <Grid container flexDirection={"column"} spacing={4}>
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid>
                                        <TextField label="CA ID" value={revokeDialog!.id} disabled />
                                    </Grid>
                                    <Grid>
                                        <TextField label="CA Certificate Serial Number" value={revokeDialog!.certificate.serial_number} disabled />
                                    </Grid>
                                    <Grid>
                                        <TextField label="CA Common Name" value={revokeDialog!.certificate.subject.common_name} disabled />
                                    </Grid>
                                </Grid>
                                <Grid container flexDirection={"column"} spacing={2}>
                                    <Grid>
                                        <Select label="Select Revocation Reason" value={revokeReason} onChange={(ev: any) => setRevokeReason(ev.target.value!)} options={
                                            Object.values(RevocationReason).map((rCode, idx) => {
                                                return {
                                                    value: rCode,
                                                    render: () => (
                                                        <Grid container spacing={1}>
                                                            <Grid xs={12}>
                                                                <Typography variant="body1" fontWeight={"bold"}>{rCode}</Typography>
                                                            </Grid>
                                                            <Grid xs={12}>
                                                                <Typography variant="body2">{getRevocationReasonDescription(rCode)}</Typography>
                                                            </Grid>
                                                        </Grid>
                                                    )
                                                };
                                            })
                                        } />
                                    </Grid>
                                </Grid>
                            </Grid>
                        )
                        : (
                            <></>
                        )
                }
                actions={
                    < Grid container spacing={2} >
                        <Grid xs md="auto">
                            <Button fullWidth variant="contained" onClick={handleRevokeCertificate}>Revoke Certificate</Button>
                        </Grid>
                        <Grid xs="auto" md="auto">
                            <Button variant="text" onClick={() => { setRevokeDialog(undefined); }}>Close</Button>
                        </Grid>
                    </Grid >
                }
            />
        </Box >
    );
};
