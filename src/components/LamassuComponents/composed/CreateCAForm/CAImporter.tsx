import { Grid, useTheme } from "@mui/material";
import { TextField } from "components/LamassuComponents/dui/TextField";
import React, { useState } from "react";
import CertificateImporter from "./CertificateImporter";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { LoadingButton, Alert } from "@mui/lab";
import { importCA } from "ducks/features/cas/apicalls";
import moment from "moment";

const keyPlaceHolder = `-----BEGIN EC PRIVATE KEY-----
MHcCAQEEIOUXa254YMYXWksCADpHFdJ+ly+nrQFsa0ozEuTZXmP5oAoGCCqGSM49
AwEHoUQDQgAEuLp+SvdUZJTXqCHivs3BpwfkKSAZl9ug9590zn7Hec2dLZj1tPG6
uywNx1FjrBpX2j6DBnyp1owBUY0Y1RVWpw==
-----END EC PRIVATE KEY-----
`;

export const CAImporter = () => {
    const theme = useTheme();

    const [crt, setCrt] = useState<string | undefined>();
    const [privKey, setPrivKey] = useState<string | undefined>();
    const [issuanceDur, setIssuanceDur] = useState<string>("100");

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImport = async () => {
        setIsLoading(true);
        try {
            const issuanceDuration = moment.duration(issuanceDur, "days").asSeconds();
            await importCA(window.btoa(crt!), window.btoa(privKey!), `${issuanceDuration}`);
        } catch (error) {
            console.log(error);

            setHasError(true);
        }
        setIsLoading(false);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs container spacing={1}>
                <CertificateImporter onChange={(crt) => { setCrt(crt); }} />
            </Grid>

            <Grid item xs container>
                <Grid item xs={12} >
                    <TextField fullWidth label="Private Key" value={privKey} onChange={(ev) => setPrivKey(ev.target.value)} multiline placeholder={keyPlaceHolder} sx={{ fontFamily: "monospace", fontSize: "0.7rem", minWidth: "450px", width: "100%" }} />
                </Grid>
            </Grid>

            <Grid item container spacing={1}>
                <Grid item xs={12}>
                    <SubsectionTitle>Issuance Expiration Settings</SubsectionTitle>
                </Grid>
                <Grid item xs={9} />
                <Grid item xs={4}>
                    <TextField label="Duration (in days)" value={issuanceDur} onChange={(ev) => setIssuanceDur(ev.target.value)} />
                </Grid>
            </Grid>

            <Grid item xs={12}>
                <LoadingButton loading={isLoading} variant="contained" disabled={!crt || !privKey} onClick={() => handleImport()}>Import CA</LoadingButton>
            </Grid>

            <Grid item xs={12}>
                {
                    hasError && (
                        <Alert severity="error">
                            Could not import CA
                        </Alert>
                    )
                }
            </Grid>

        </Grid>
    );
};

export default CertificateImporter;
