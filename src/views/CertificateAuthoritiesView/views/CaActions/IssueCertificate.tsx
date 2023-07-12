import React, { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, Paper, DialogContent, DialogTitle, Grid, Tooltip, Typography, useTheme, IconButton } from "@mui/material";
import { useDispatch } from "react-redux";
import * as caApicalls from "ducks/features/cas/apicalls";
import Stepper from "@mui/material/Stepper/Stepper";
import Step from "@mui/material/Step/Step";
import StepLabel from "@mui/material/StepLabel/StepLabel";
import { Skeleton } from "@mui/lab";
import Box from "@mui/material/Box/Box";
import FileDownloadRoundedIcon from "@mui/icons-material/FileDownloadRounded";
import downloadFile from "components/utils/FileDownloader";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { Certificate } from "@fidm/x509";
import CertRequestForm from "components/LamassuComponents/composed/CertRequestForm";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";

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
                    const resp = await caApicalls.signCertificate(caName!, csr!);
                    console.log(resp);
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
                <Grid container style={{ marginTop: "20px" }}>
                    <Grid item xs={12}>
                        <Stepper activeStep={step} alternativeLabel>
                            {["Create CSR", "Issue Certificate", "Process completion"].map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Grid>
                </Grid>
                <Grid item xs={12} container sx={{ marginTop: "20px" }}>
                    {
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
                                                                            <Box sx={{ background: theme.palette.success.light, padding: "10px", borderRadius: "5px", width: "fit-content" }}>
                                                                                <Typography sx={{ color: theme.palette.success.main, fontSize: "0.85rem" }}>Certificate generated successfully</Typography>
                                                                            </Box>
                                                                        </Grid>
                                                                        <Grid item xs={12} container>
                                                                            <Grid item xs={4}>
                                                                                <Typography>{chunk(parsedSignedCert.serialNumber, 2).join("-")}</Typography>
                                                                            </Grid>
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
                                                <Grid item xs={6} container justifyContent={"center"} spacing={1}>
                                                    {
                                                        rawCrt !== undefined && (
                                                            <>
                                                                <Grid item xs="auto">
                                                                    <CodeCopier code={rawCrt} />
                                                                </Grid>
                                                                <Grid item xs="auto" container flexDirection={"column"} spacing={1}>
                                                                    <Grid item>
                                                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                            <Tooltip title="Copy to Clipboard">
                                                                                <IconButton onClick={(ev) => { ev.stopPropagation(); navigator.clipboard.writeText(window.atob(rawCrt)); }}>
                                                                                    <ContentPasteIcon fontSize={"small"} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: theme.palette.background.lightContrast, width: 35, height: 35 }}>
                                                                            <Tooltip title="Download Bootstrap CRT">
                                                                                <IconButton onClick={(ev) => { ev.stopPropagation(); downloadFile(caName + "issued-cert.crt", window.atob(rawCrt)); }}>
                                                                                    <FileDownloadRoundedIcon fontSize={"small"} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </Box>
                                                                    </Grid>
                                                                </Grid>
                                                            </>
                                                        )
                                                    }
                                                </Grid>
                                            </>
                                        )
                                }
                            </Grid>
                        )
                    }
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
        </Dialog>
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
