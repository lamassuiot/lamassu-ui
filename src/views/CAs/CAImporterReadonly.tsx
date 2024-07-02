import { Alert, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { TextField } from "components/TextField";
import { importReadOnlyCA } from "ducks/features/cas/apicalls";
import { useNavigate } from "react-router-dom";
import CertificateImporter from "components/CRTImporter";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useState } from "react";

interface CAReadonlyImporterProps {
}

export const CAReadonlyImporter: React.FC<CAReadonlyImporterProps> = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [crt, setCrt] = useState<string | undefined>();

    const [caID, setCAID] = useState(window.crypto.randomUUID());
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImport = async () => {
        setIsLoading(true);
        try {
            await importReadOnlyCA(caID, window.btoa(crt!));
            navigate(`/cas/${caID}`);
        } catch (error) {
            console.log(error);
            setHasError(true);
        }
        setIsLoading(false);
    };

    return (
        <Grid container spacing={2} sx={{ width: "100%" }}>
            <Grid xs={12}>
                <TextField label="CA ID" name="id" helperText="ID" value={caID} disabled />
            </Grid>
            <Grid xs={12}>
                <CertificateImporter onChange={(crt) => { setCrt(crt); }} />
            </Grid>

            <Grid xs={12}>
                <LoadingButton loading={isLoading} variant="contained" disabled={!crt} onClick={() => handleImport()}>Import CA</LoadingButton>
            </Grid>

            <Grid xs={12}>
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
