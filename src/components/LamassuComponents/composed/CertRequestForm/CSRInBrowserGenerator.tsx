import { Alert, Button, Divider, Grid, LinearProgress } from "@mui/material";
import { MonoChromaticButton } from "components/LamassuComponents/dui/MonoChromaticButton";
import React, { useState } from "react";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { createCSR, createPrivateKey, keyPairToPEM } from "components/utils/cryptoUtils/csr";
import CSRViewer from "./CSRViewer";
import { CodeCopier } from "components/LamassuComponents/dui/CodeCopier";
import X509Form, { X509Value } from "../X509Form";

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
                    <Grid item>
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
                        <Grid item container spacing={2}>
                            <Grid item xs container direction={"column"} spacing={1}>
                                <Grid item>
                                    <SubsectionTitle>Private Key</SubsectionTitle>
                                </Grid>
                                <Grid item>
                                    <CodeCopier code={privKey!} />
                                </Grid>
                            </Grid>
                            <Grid item xs container direction={"column"} spacing={1}>
                                <Grid item>
                                    <SubsectionTitle>Certificate Request</SubsectionTitle>
                                </Grid>
                                <Grid item>
                                    <CSRViewer csr={csr!} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Divider />
                        </Grid>
                        <Grid item container spacing={2}>
                            <Grid item xs>
                                <Button onClick={() => setStep(step - 1)}>Back</Button>
                            </Grid>
                            <Grid item xs="auto">
                                <MonoChromaticButton onClick={() => onCreate(privKey!, csr!)}>Confirm</MonoChromaticButton>
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
            <Grid item>
                <X509Form value={x509FromValue} onChange={newVal => setX509FromValue(newVal)} />
            </Grid>

            <Grid item>
                <Divider />
            </Grid>

            <Grid item container flexDirection={"column"} spacing={2}>
                <Grid item>
                    <Alert severity="info">
                        The private key will be generated in the browser. No information is exchanged with the server.
                    </Alert>
                </Grid>
                <Grid item>
                    {
                        loadingCryptoMaterial && (
                            <LinearProgress />
                        )
                    }
                </Grid>
                <Grid item >
                    <MonoChromaticButton disabled={validateCSRGenInputs || loadingCryptoMaterial} onClick={async () => {
                        setLoadingCryptoMaterial(true);
                        const keyPair = await createPrivateKey(x509FromValue.keyMetadata.type, x509FromValue.keyMetadata.size, "SHA-256");
                        const csr = await createCSR(keyPair, "SHA-256", x509FromValue.subject, { dnss: x509FromValue.sanDNSs });
                        const { privateKey } = await keyPairToPEM(keyPair, x509FromValue.keyMetadata.type);
                        onCreate(privateKey, csr);
                        setLoadingCryptoMaterial(false);
                    }}>Generate Private Key and CSR</MonoChromaticButton>
                </Grid>
            </Grid>
        </Grid >
    );
};

export default CSRInBrowserGenerator;
