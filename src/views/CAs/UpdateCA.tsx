import { Alert, Divider, Typography, useTheme } from "@mui/material";
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

type FormData = {
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    },
};

interface UpdateCAProps {
}

export const UpdateCA: React.FC<UpdateCAProps> = () => {
    const theme = useTheme();

    const navigate = useNavigate();

    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            issuerExpiration: {
                type: "duration",
                duration: "100d",
                date: moment().add(100, "days")
            }
        }
    });

    const watchIssuanceExpiration = watch("issuerExpiration");

    const handleCreateCA = (formData: FormData) => {
        const run = async () => {
            setLoading(true);
            try {
                // await apicalls.cas.createCA({ });
                // navigate(`/cas/${formData.id}`);
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
            <form onSubmit={onSubmit}>
                <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: "100%", paddingY: "20px" }}>
                    <Grid xs={12} container spacing={2} flexDirection={"column"}>
                        <Grid>
                            <Typography variant="h4">Issuance Expiration Settings</Typography>
                        </Grid>
                        <Grid>
                            <FormExpirationInput control={control} name="issuerExpiration" enableInfiniteDate/>
                        </Grid>
                    </Grid>

                    <Grid sx={{ width: "100%" }}>
                        <Divider />
                    </Grid>

                    <Grid container spacing={2} flexDirection={"column"}>
                        <Grid>
                            <LoadingButton loading={loading} variant="contained" type="submit" disabled={
                                !validDurationRegex(watchIssuanceExpiration.duration)
                            }>Update CA</LoadingButton>
                        </Grid>
                        {
                            error && (
                                <Grid>
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
