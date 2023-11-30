import React, { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import * as caApicalls from "ducks/features/cav3/apicalls";
import { Certificate } from "@fidm/x509";

interface Props {
    caName: string,
    isOpen: boolean,
    onClose: any
}

export const IssueCert: React.FC<Props> = ({ caName, isOpen, onClose = () => { } }) => {
    const theme = useTheme();
    const themeMode = theme.palette.mode;
    const dispatch = useDispatch();

    const [parsedSignedCert, setParsedSignedCert] = useState<undefined | Certificate>(undefined);
    const [rawCrt, setRawCrt] = useState<undefined | string>(undefined);
    const [loading, setLoading] = useState<boolean | Error>(false);

    const [step, setStep] = useState(0);

    const [csr, setCSR] = useState<undefined | string>(undefined);

    useEffect(() => {
        const run = async () => {
            if (step === 1) {
                setLoading(true);
                try {
                    const resp = await caApicalls.signCertificateRequest(caName!, window.btoa(csr!));
                    setRawCrt(resp.certificate);
                    setParsedSignedCert(Certificate.fromPEM(Buffer.from(window.atob(resp.certificate), "utf8")));
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
                <Grid item xs={12} container sx={{ marginTop: "20px" }}>
                    <Grid xs>
                        <Box sx={{ borderRadius: "5px", border: "2px solid blue", padding: "5px" }}>
                            <Grid container>
                                <Grid item>

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
                            <Grid item xs={12} container>
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
                                            <Grid item xs={12} container>
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
                                                                        <Grid item xs={12}>
                                                                            <Alert severity="success">
                                                                                Certificate generated successfully. Certificate Serial Number: {chunk(parsedSignedCert.serialNumber, 2).join("-")}
                                                                            </Alert>
                                                                        </Grid>
                                                                    </>
                                                                }
                                                            </>
                                                        )
                                                        : (
                                                            <Grid item xs={12}>
                                                                <Box sx={{ background: theme.palette.error.light, padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                                                                    <Typography sx={{ color: theme.palette.error.main, fontSize: "0.85rem" }}>Certificate generation went wrong</Typography>
                                                                </Box>
                                                            </Grid>

                                                        )
                                                }
                                                {
                                                    rawCrt !== undefined && (
                                                        <>
                                                            <Grid item xs={6} justifyContent={"center"} spacing={1}>
                                                                <CodeCopier code={window.atob(rawCrt)} enableDownload downloadFileName={caName + "_" + parsedSignedCert.subject.commonName + "crt"} />
                                                            </Grid>
                                                            <Grid item xs={6} justifyContent={"center"} spacing={1}>
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
                    <Grid item xs>
                        <Button onClick={() => onClose()}>Cancel</Button>
                    </Grid>
                    <Grid item xs="auto" container spacing={2}>
                        <Grid item xs="auto">
                            <Button onClick={() => setStep(step - 1)} disabled={step === 0 || step === 2}>Back</Button>
                        </Grid>
                        <Grid item xs="auto">
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
