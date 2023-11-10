import { Grid, useTheme } from "@mui/material";
import React, { useState } from "react";
import CertificateImporter from "../../../../components/LamassuComponents/composed/Certificates/CertificateImporter";
import { LoadingButton, Alert } from "@mui/lab";
import { importReadOnlyCA } from "ducks/features/cav3/apicalls";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { actions } from "ducks/actions";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

interface CAReadonlyImporterProps {
}

export const CAReadonlyImporter: React.FC<CAReadonlyImporterProps> = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [crt, setCrt] = useState<string | undefined>();

    const [caID, setCAID] = useState(window.crypto.randomUUID());
    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleImport = async () => {
        setIsLoading(true);
        try {
            await importReadOnlyCA(caID, window.btoa(crt!));
            dispatch(actions.caActionsV3.importCAWithKey(caID));
            navigate(`/cas/${caID}`);
        } catch (error) {
            console.log(error);
            setHasError(true);
        }
        setIsLoading(false);
    };

    return (
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField label="CA ID" name="id" helperText="ID" value={caID} disabled />
            </Grid>
            <Grid item xs={12}>
                <CertificateImporter onChange={(crt) => { setCrt(crt); }} />
            </Grid>

            <Grid item xs={12}>
                <LoadingButton loading={isLoading} variant="contained" disabled={!crt} onClick={() => handleImport()}>Import CA</LoadingButton>
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
