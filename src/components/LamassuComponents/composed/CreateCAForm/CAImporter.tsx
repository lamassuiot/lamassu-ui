import { Grid, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useState } from "react";
import CertificateImporter from "./CertificateImporter";

const keyPlaceHolder = `-----BEGIN CERTIFICATE REQUEST-----
MIIBNzCB3QIBADBTMVEwCQYDVQQLEwJJVDAUBgNVBAoTDUxLUyAtIElrZXJsYW4w
CQYDVQQGEwJFUzAPBgNVBAgTCEdpcHV6a29hMBIGA1UEAxMLTGFtYXNzdSBJb1Qw
WTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAT9GpFufUkIQ0JBFVhN55diPm/UWamx
YwDMAxw/TmgX6aBFzbsJOc8GIqyIzUxUWSdAo32OGrfnCfQza6DHmy2JoCgwJgYJ
KoZIhvcNAQkOMRkwFzAVBgNVHREEDjAMggpsYW1hc3N1LmlvMAoGCCqGSM49BAMC
A0kAMEYCIQCrBQ/UOec1aHPeKE962EvIvzqZitQAeSf6yCzElTZ9IAIhALUMuz+0
C3Rzdw39eIksMyCphq82zihsSZpa8pZPWz6v
-----END CERTIFICATE REQUEST-----`;

interface CAImporterProps {
    onCreate: (crt: string) => void
}

const CAImporter: React.FC<CAImporterProps> = ({ onCreate }) => {
    const theme = useTheme();

    const [crt, setCrt] = useState<string | undefined>();
    const [privKey, setPrivKey] = useState<string | undefined>();

    // const validateCertWithKey = () => {
    //     if (!crt || !privKey) {
    //         return false;
    //     }

    //     const certificate = pkijs.Certificate.fromBER(fromPEM(crt));
    //     const privateKey = pkijs.PrivateKeyInfo.fromBER(fromPEM(privKey));

    //     // Get the public key values from the private key and certificate
    //     const privateKeyPublicValue = privateKey.publicKey;
    //     const certificatePublicValue = certificate.subjectPublicKeyInfo.subjectPublicKey;

    //     // Compare the public key values to check if they match
    //     const privateKeyMatchesCertificate = privateKeyPublicValue.isEqual(certificatePublicValue);
    // };

    return (
        <Grid container spacing={2}>
            <Grid item xs container spacing={1}>
                <CertificateImporter onCreate={(crt) => { setCrt(crt); }} />
            </Grid>

            <Grid item xs container>
                <Grid item xs={12}>
                    <TextField label="Private Key" value={privKey} onChange={(ev) => setPrivKey(ev.target.value)} multiline placeholder={keyPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", width: "400px" }} />
                </Grid>
                {/* {
                    privKey && crt && (
                        <Grid item xs={12}>
                            <Box sx={{ background: theme.palette.primary.light, padding: "5px 10px", borderRadius: "5px" }}>
                                <Typography fontSize="0.8rem">Decoded Certificate</Typography>
                            </Box>
                        </Grid>
                    )
                } */}
            </Grid>
        </Grid>
    );
};

export default CertificateImporter;
