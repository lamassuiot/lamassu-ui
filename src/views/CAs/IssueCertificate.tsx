import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import apicalls from "ducks/apicalls";
import { ExtendedKeyUsage, KeyUsage } from "ducks/features/cas/models";

interface Props {
    caName: string,
    isOpen: boolean,
    onClose: any
}

export const IssueCert: React.FC<Props> = ({ caName, isOpen, onClose = () => { } }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;

    const [rawCrt, setRawCrt] = useState<undefined | string>(undefined);
    const [loading, setLoading] = useState<boolean | Error>(false);

    const [step, setStep] = useState(0);

    const [csr, setCSR] = useState<undefined | string>(undefined);

    useEffect(() => {
        const run = async () => {
            if (step === 1) {
                setLoading(true);
                try {
                    const resp = await apicalls.cas.signCertificateRequest(caName!, window.btoa(csr!), {
                        honor_subject: true,
                        honor_extensions: true,
                        sign_as_ca: false,
                        key_usage: [
                            KeyUsage.DigitalSignature
                        ],
                        extended_key_usage: [
                            ExtendedKeyUsage.ClientAuth
                        ],
                        validity: {
                            type: "Duration",
                            duration: "1h"
                        }
                    });
                    setRawCrt(resp.certificate);
                    setLoading(false);
                    setStep(step + 1);
                } catch (error: any) {
                    setLoading(new Error(error));
                }
            } else if (step === 3) {
                onClose();
            }
        };
        run();
    }, [step]);

    const disableNextBtn = step === 0;

    return (
        <Dialog open={isOpen} maxWidth={"xl"}>
            <DialogTitle>Issuing Certificate for CA: {caName}</DialogTitle>
            <DialogContent>
                <Grid xs={12} container sx={{ marginTop: "20px" }}>
                    <Grid xs>
                        <Box sx={{ borderRadius: "5px", border: "2px solid blue", padding: "5px" }}>
                            <Grid container>
                                <Grid>

                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid xs></Grid>
                    <Grid xs></Grid>
                    {/* {
                        step === 0 && (
                            <CertRequestForm onCreate={csr => {
                                setCSR(csr);
                                setStep(step + 1);
                            }} />
                        )
                    }
                    {
                        step === 1 && (
                            <Grid xs={12} container>
                                <Typography>Generating Private Key & CSR in-browser</Typography>
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                            </Grid>
                        )
                    }
                    {
                        step === 2 && (
                            <Grid container spacing={2}>
                                {
                                    parsedSignedCert === undefined
                                        ? (
                                            <Grid xs={12} container>
                                                <Typography>Generating Private Key & CSR in-browser</Typography>
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                            </Grid>
                                        )
                                        : (
                                            <>
                                                {
                                                    loading === false
                                                        ? (
                                                            <>
                                                                {
                                                                    <>
                                                                        <Grid xs={12}>
                                                                            <Alert severity="success">
                                                                                Certificate generated successfully. Certificate Serial Number: {chunk(parsedSignedCert.serialNumber, 2).join("-")}
                                                                            </Alert>
                                                                        </Grid>
                                                                    </>
                                                                }
                                                            </>
                                                        )
                                                        : (
                                                            <Grid xs={12}>
                                                                <Box sx={{ background: theme.palette.error.light, padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                                                                    <Typography sx={{ color: theme.palette.error.main, fontSize: "0.85rem" }}>Certificate generation went wrong</Typography>
                                                                </Box>
                                                            </Grid>

                                                        )
                                                }
                                                {
                                                    rawCrt !== undefined && (
                                                        <>
                                                            <Grid xs={6} justifyContent={"center"} spacing={1}>
                                                                <CodeCopier code={window.atob(rawCrt)} enableDownload downloadFileName={caName + "_" + parsedSignedCert.subject.commonName + "crt"} />
                                                            </Grid>
                                                            <Grid xs={6} justifyContent={"center"} spacing={1}>
                                                                <CertificateDecoder crtPem={window.atob(rawCrt)} />
                                                            </Grid>
                                                        </>
                                                    )
                                                }
                                            </>
                                        )
                                }
                            </Grid>
                        )
                    } */}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Grid container>
                    <Grid xs>
                        <Button onClick={() => onClose()}>Cancel</Button>
                    </Grid>
                    <Grid xs="auto" container spacing={2}>
                        <Grid xs="auto">
                            <Button onClick={() => setStep(step - 1)} disabled={step === 0 || step === 2}>Back</Button>
                        </Grid>
                        <Grid xs="auto">
                            <Button disabled={disableNextBtn} onClick={() => {
                                setStep(step + 1);
                            }} variant="contained">{step === 2 ? "Finish" : "Next"}</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog >
    );
};

function chunk (str: string, n: number) {
    const ret = [];
    let i;
    let len;

    for (i = 0, len = str.length; i < len; i += n) {
        ret.push(str.substr(i, n));
    }

    return ret;
};
