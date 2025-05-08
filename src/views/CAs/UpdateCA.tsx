import { Alert, Button, Divider, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { errorToString } from "ducks/services/api-client";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { validDurationRegex } from "utils/duration";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import moment, { Moment } from "moment";
import { FormExpirationInput } from "components/forms/Expiration";
import { FormattedView } from "components/FormattedView";
import apicalls from "ducks/apicalls";
import { CertificateAuthority } from "ducks/features/cas/models";
import { enqueueSnackbar } from "notistack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getCA } from "ducks/features/cas/apicalls";
import { ErrorBox } from "components/ErrorBox/ErrorBox";

type FormData = {
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    },
};

export const UpdateCA: React.FC = () => {
    const navigate = useNavigate();

    const [error, setError] = useState<string | undefined>();
    const [fetchError, setFetchError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const params = useParams();
    const caId = params.caName || "";
    const [caData, setCAData] = useState<CertificateAuthority | undefined>();

    useEffect(() => {
        if (caId !== "") {
            fetchCA();
        }
    }, [caId]);

    const fetchCA = () => {
        setLoading(true);
        getCA(caId)
            .then((result) => {
                setCAData(result);
            })
            .catch((error) => {
                setFetchError(errorToString(error));
            })
            .finally(() => { setLoading(false); });
    };

    const form = useForm<FormData>({
        defaultValues: {
            issuerExpiration: {
                type: "duration",
                duration: "100d",
                date: moment().add(100, "days")
            }
        }
    });

    const { control, handleSubmit, watch, reset } = form;

    useEffect(() => {
        if (caData?.validity) {
            reset({
                issuerExpiration: {
                    type: caData.validity.type === "Duration" ? "duration" : "date",
                    duration: caData.validity.type === "Duration" ? caData.validity.duration : "100d",
                    date: caData.validity.type === "Time"
                        ? moment(caData.validity.time)
                        : moment().add(100, "days")
                }
            });
        }
    }, [caData, reset]);

    const watchIssuanceExpiration = watch("issuerExpiration");

    const handleCreateCA = (formData: FormData) => {
        const run = async () => {
            setError(undefined);
            setLoading(true);
            try {
                if (!caData) {
                    throw new Error("CA data not loaded");
                }

                await apicalls.cas.updateCAIssuanceExpiration(caData.id, {
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

    if (fetchError) {
        return <ErrorBox error={fetchError} errorPrefix="Could not fetch CA" />;
    }

    if (!caData?.id || !caData) return <div>Loading...</div>;

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
