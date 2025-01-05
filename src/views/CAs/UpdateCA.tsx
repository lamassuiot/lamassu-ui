import { Alert, Button, Divider, Typography, useTheme } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { errorToString } from "ducks/services/api-client";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { validDurationRegex } from "utils/duration";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useState } from "react";
import moment, { Moment } from "moment";
import { FormExpirationInput } from "components/forms/Expiration";
import { FormattedView } from "components/FormattedView";
import apicalls from "ducks/apicalls";
import { CertificateAuthority } from "ducks/features/cas/models";
import { enqueueSnackbar } from "notistack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

type FormData = {
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    },
};

interface UpdateCAProps {
    caData: CertificateAuthority
}

export const UpdateCA: React.FC<UpdateCAProps> = (props) => {
    const theme = useTheme();

    const navigate = useNavigate();

    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            issuerExpiration: {
                type: "duration",
                duration: props.caData.validity.type === "Duration" ? props.caData.validity.duration : "100d",
                date: props.caData.validity.type === "Time" ? moment(props.caData.validity.time) : moment().add(100, "days")
            }
        }
    });

    const watchIssuanceExpiration = watch("issuerExpiration");

    const handleCreateCA = (formData: FormData) => {
        const run = async () => {
            setError(undefined);
            setLoading(true);
            try {
                await apicalls.cas.updateCAIssuanceExpiration(props.caData.id, {
                    type: formData.issuerExpiration.type === "duration" ? "Duration" : "Time",
                    duration: formData.issuerExpiration.duration,
                    time: formData.issuerExpiration.type === "date-infinity" ? moment("99991231T225959Z").format() : formData.issuerExpiration.date.format()
                });
                enqueueSnackbar("CA updated successfully", { variant: "success" });
            } catch (error) {
                setError(errorToString(error));
            }
            setLoading(false);
        };
        run();
    };

    const onSubmit = handleSubmit(data => handleCreateCA(data));

    return (
        <FormattedView
            title="Update CA"
            subtitle="Update the settings of the Certificate Authority at your convenience"
        >
            <Button startIcon={<ArrowBackIcon />} onClick={() => {
                navigate(-1);
            }}>Go Back</Button>
            <form onSubmit={onSubmit} style={{ width: "100%" }}>
                <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: "100%", paddingY: "20px" }}>
                    <Grid xs={12} container spacing={2} flexDirection={"column"}>
                        <Grid>
                            <Typography variant="h4">Issuance Expiration Settings</Typography>
                        </Grid>
                        <Grid>
                            <FormExpirationInput control={control} name="issuerExpiration" enableInfiniteDate />
                        </Grid>
                    </Grid>

                    <Grid xs={12}>
                        <Divider />
                    </Grid>

                    <Grid xs={12} container spacing={2}>
                        <Grid xs={12}>
                            <LoadingButton loading={loading} variant="contained" type="submit" disabled={
                                !validDurationRegex(watchIssuanceExpiration.duration)
                            }>Update CA</LoadingButton>
                        </Grid>
                        {
                            error && (
                                <Grid xs={12}>
                                    <Alert severity="error">
                                        Something went wrong: {error}
                                    </Alert>
                                </Grid>
                            )
                        }
                    </Grid>
                </Grid>
            </form>
        </FormattedView>
    );
};
