import { Grid, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useState } from "react";
import CertificateImporter from "./CertificateImporter";

const keyPlaceHolder = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIOUXa254YMYXWksCADpHFdJ+ly+nrQFsa0ozEuTZXmP5oAoGCCqGSM49
AwEHoUQDQgAEuLp+SvdUZJTXqCHivs3BpwfkKSAZl9ug9590zn7Hec2dLZj1tPG6
uywNx1FjrBpX2j6DBnyp1owBUY0Y1RVWpw==
-----END EC PRIVATE KEY-----
`;

interface CAImporterProps {
    onCreate: (crt: string, key: string) => void
}

export const CAImporter: React.FC<CAImporterProps> = ({ onCreate }) => {
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
                <Grid item xs={12} >
                    <TextField fullWidth label="Private Key" value={privKey} onChange={(ev) => setPrivKey(ev.target.value)} multiline placeholder={keyPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "450px", width: "100%" }} />
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
