import { Alert, Button, Divider, LinearProgress, Typography } from "@mui/material";
import { CSRViewer } from "./CSRViewer";
import { CodeCopier } from "./CodeCopier";
import { createCSR, createPrivateKey, keyPairToPEM } from "utils/crypto/csr";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import X509Form, { X509Value } from "./x509Form";

interface CSRInBrowserGeneratorProps {
    onCreate: (privKey: string, csr: string) => void
}

const CSRInBrowserGenerator: React.FC<CSRInBrowserGeneratorProps> = ({ onCreate }) => {
    const [step, setStep] = useState(0);
    const [csr, setCsr] = useState<string | undefined>();
    const [privKey, setPrivKey] = useState<string | undefined>();

    return (
        <Grid container spacing={2} flexDirection={"column"}>
            {
                step === 0 && (
                    <Grid>
                        <CSRFormGenerator onCreate={(privKey, csr) => {
                            setCsr(csr);
                            setPrivKey(privKey);
                            setStep(step + 1);
                        }} />
                    </Grid>
                )
            }
            {
                step === 1 && (
                    <>
                        <Grid container spacing={2}>
                            <Grid xs container direction={"column"} spacing={1}>
                                <Grid>
                                    <Typography>Private Key</Typography>
                                </Grid>
                                <Grid>
                                    <CodeCopier code={privKey!} />
                                </Grid>
                            </Grid>
                            <Grid xs container direction={"column"} spacing={1}>
                                <Grid>
                                    <Typography>Certificate Request</Typography>
                                </Grid>
                                <Grid>
                                    <CSRViewer csr={csr!} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid>
                            <Divider />
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid xs>
                                <Button onClick={() => setStep(step - 1)}>Back</Button>
                            </Grid>
                            <Grid xs="auto">
                                <Button variant="contained" onClick={() => onCreate(privKey!, csr!)}>Confirm</Button>
                            </Grid>
                        </Grid>
                    </>
                )
            }
        </Grid>
    );
};

interface CSRFormGeneratorProps {
    onCreate: (privKey: string, csr: string) => void
}

const CSRFormGenerator: React.FC<CSRFormGeneratorProps> = ({ onCreate }) => {
    const [loadingCryptoMaterial, setLoadingCryptoMaterial] = useState(false);
    const [x509FromValue, setX509FromValue] = useState<X509Value>({
        keyMetadata: {
            size: 4096,
            type: "RSA"
        },
        subject: {
            cn: "",
            country: "",
            state: "",
            locality: "",
            o: "",
            ou: ""
        },
        sanDNSs: []
    });

    const validateCSRGenInputs = false;

    return (
        <Grid container spacing={3} flexDirection={"column"}>
            <Grid>
                <X509Form value={x509FromValue} onChange={newVal => setX509FromValue(newVal)} />
            </Grid>

            <Grid>
                <Divider />
            </Grid>

            <Grid container flexDirection={"column"} spacing={2}>
                <Grid>
                    <Alert severity="info">
                        The private key will be generated in the browser. No information is exchanged with the server.
                    </Alert>
                </Grid>
                <Grid>
                    {
                        loadingCryptoMaterial && (
                            <LinearProgress />
                        )
                    }
                </Grid>
                <Grid >
                    <Button variant="contained" disabled={validateCSRGenInputs || loadingCryptoMaterial} onClick={async () => {
                        setLoadingCryptoMaterial(true);
                        const keyPair = await createPrivateKey(x509FromValue.keyMetadata.type, x509FromValue.keyMetadata.size, "SHA-256");
                        const csr = await createCSR(keyPair, "SHA-256", x509FromValue.subject, { dnss: x509FromValue.sanDNSs });
                        const { privateKey } = await keyPairToPEM(keyPair);
                        onCreate(privateKey, csr);
                        setLoadingCryptoMaterial(false);
                    }}>Generate Private Key and CSR</Button>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default CSRInBrowserGenerator;
