// @ts-nocheck
import { Alert, Button, Divider, LinearProgress, Typography } from "@mui/material";
import { CSRViewer } from "./CSRViewer";
import { CodeCopier } from "./CodeCopier";
import { createCSR, createPrivateKey, keyPairToPEM } from "utils/crypto/csr";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import X509Form, { X509Value } from "./x509Form";
import { Profile } from "ducks/features/cas/models";
import { IssuanceProfile } from "./IssuanceProfile";

interface CSRInBrowserGeneratorProps {
    onCreate: (privKey: string, csr: string, profile: Profile) => void
}

const CSRInBrowserGenerator: React.FC<CSRInBrowserGeneratorProps> = ({ onCreate }) => {
    const [step, setStep] = useState(0);
    const [csr, setCsr] = useState<string | undefined>();
    const [privKey, setPrivKey] = useState<string | undefined>();

    const [profile, setProfile] = useState<Profile | undefined>();

    return (
        <Grid container spacing={2} flexDirection={"column"}>
            {
                step === 0 && (
                    <>
                        <Grid xs={12}>
                            <CSRFormGenerator onCreate={(privKey, csr) => {
                                setCsr(csr);
                                setPrivKey(privKey);
                                setStep(step + 1);
                            }} />
                        </Grid>
                    </>
                )
            }
            {
                step === 1 && (
                    <Grid container spacing={1}>
                        <Grid xs={12} container spacing={2}>
                            <Grid xs container direction={"column"} spacing={1}>
                                <Grid>
                                    <Typography variant="h4">Private Key</Typography>
                                </Grid>
                                <Grid>
                                    <CodeCopier code={privKey!} />
                                </Grid>
                            </Grid>
                            <Grid xs container direction={"column"} spacing={1}>
                                <Grid>
                                    <Typography variant="h4">Certificate Request</Typography>
                                </Grid>
                                <Grid>
                                    <CSRViewer csr={csr!} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid xs={12}>
                            <Divider />
                        </Grid>
                        <Grid xs={12} container spacing={2}>
                            <Grid xs>
                                <Button onClick={() => setStep(step - 1)}>Back</Button>
                            </Grid>
                            <Grid xs="auto">
                                <Button variant="contained" onClick={() => setStep(step + 1)}>Next</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                )
            }
            {
                step === 2 && (
                    <Grid container spacing={1}>
                        <Grid xs={12} container spacing={2} padding={2}>
                            <IssuanceProfile onChange={(profile) => setProfile(profile)} />
                        </Grid>
                        <Grid xs={12}>
                            <Divider />
                        </Grid>
                        <Grid xs={12} container spacing={2}>
                            <Grid xs>
                                <Button onClick={() => setStep(step - 1)}>Back</Button>
                            </Grid>
                            <Grid xs="auto">
                                <Button variant="contained" onClick={() => {
                                    onCreate(privKey!, csr!, profile!);
                                }}>Confirm</Button>
                            </Grid>
                        </Grid>
                    </Grid>
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
        san: []
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
                        console.log(x509FromValue.san);

                        setLoadingCryptoMaterial(true);
                        const keyPair = await createPrivateKey(x509FromValue.keyMetadata.type, x509FromValue.keyMetadata.size, "SHA-256");
                        const csr = await createCSR(keyPair, "SHA-256", x509FromValue.subject, x509FromValue.san);
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
