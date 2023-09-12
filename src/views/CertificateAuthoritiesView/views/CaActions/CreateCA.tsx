import React, { useEffect, useState } from "react";
import { Alert, Divider, Grid, MenuItem, useTheme } from "@mui/material";
import { useForm } from "react-hook-form";
import moment, { Moment } from "moment";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { FormDateInput } from "components/LamassuComponents/dui/form/DateInput";
import { CryptoEngine, createCA } from "ducks/features/cav3/apicalls";
import { errorToString } from "ducks/services/api";
import { LoadingButton } from "@mui/lab";
import CryptoEngineSelector from "components/LamassuComponents/lamassu/CryptoEngineSelector";
import * as duration from "components/utils/duration";
import { CATimeline } from "views/CertificateAuthoritiesView/components/CATimeline";

type FormData = {
    cryptoEngine: CryptoEngine
    id: string
    subject: {
        commonName: string;
        country: string;
        state: string;
        locality: string;
        organization: string;
        organizationUnit: string;
    }
    privateKey: {
        type: string
        size: number
    }
    caExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    },
    issuerExpiration: {
        type: "duration" | "date" | "date-infinity",
        date: Moment,
        duration: string
    },
};

interface CreateCAProps {
    defaultEngine: CryptoEngine
}

export const CreateCA: React.FC<CreateCAProps> = ({ defaultEngine }) => {
    const theme = useTheme();

    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            cryptoEngine: defaultEngine,
            id: window.crypto.randomUUID(),
            subject: {
                commonName: "",
                country: "",
                state: "",
                locality: "",
                organization: "",
                organizationUnit: ""
            },
            privateKey: {
                type: "RSA",
                size: 4096
            },
            caExpiration: {
                type: "duration",
                duration: "300d",
                date: moment().add(300, "days")
            },
            issuerExpiration: {
                type: "duration",
                duration: "100d",
                date: moment().add(100, "days")
            }
        }
    });

    const watchAll = watch();
    const watchSubject = watch("subject");
    const watchKeyType = watch("privateKey.type");
    const watchCAExpiration = watch("caExpiration");
    const watchIssuanceExpiration = watch("issuerExpiration");

    const handleCreateCA = (formData: FormData) => {
        const run = async () => {
            setLoading(true);
            try {
                await createCA({
                    engine_id: formData.cryptoEngine.id,
                    subject: {
                        country: formData.subject.country,
                        state: formData.subject.state,
                        locality: formData.subject.locality,
                        organization: formData.subject.organization,
                        organization_unit: formData.subject.organizationUnit,
                        common_name: formData.subject.commonName
                    },
                    key_metadata: {
                        type: formData.privateKey.type,
                        bits: formData.privateKey.size
                    },
                    ca_expiration: {
                        type: formData.caExpiration.type === "duration" ? "Duration" : "Time",
                        duration: formData.caExpiration.duration,
                        time: formData.caExpiration.type === "date-infinity" ? "99991231T235959Z" : formData.caExpiration.date.format()
                    },
                    issuance_expiration: {
                        type: formData.issuerExpiration.type === "duration" ? "Duration" : "Time",
                        duration: formData.issuerExpiration.duration,
                        time: formData.issuerExpiration.type === "date-infinity" ? "99991231T235959Z" : formData.issuerExpiration.date.format()
                    },
                    ca_type: "MANAGED"
                });
            } catch (error) {
                setError(errorToString(error));
            }
            setLoading(false);
        };
        run();
    };

    useEffect(() => {
        if (watchKeyType === "RSA") {
            setValue("privateKey.size", 4096);
        } else {
            setValue("privateKey.size", 256);
        }
    }, [watchKeyType]);

    const onSubmit = handleSubmit(data => handleCreateCA(data));

    return (
        <form onSubmit={onSubmit}>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ width: "100%", paddingY: "20px" }}>
                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>CA Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12}>
                        <CryptoEngineSelector value={watchAll.cryptoEngine} onSelect={engine => {
                            if (Array.isArray(engine)) {
                                if (engine.length > 0) {
                                    setValue("cryptoEngine", engine[0]);
                                }
                            } else {
                                setValue("cryptoEngine", engine);
                            }
                        }} />
                    </Grid>
                    <Grid item xs={12}>
                        <FormTextField label="CA ID" control={control} name="id" helperText="ID" disabled />
                    </Grid>
                    <Grid item xs={12} xl={4}>
                        <FormTextField label="CA Name" control={control} name="subject.commonName" helperText="Common Name can not be empty" error={watchSubject.commonName === ""} />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormSelect control={control} name="privateKey.type" label="Key Type">
                            {
                                watchAll.cryptoEngine.supported_key_types.map((keyFam, idx) => <MenuItem key={idx} value={keyFam.type}>{keyFam.type}</MenuItem>)
                            }
                        </FormSelect>
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormSelect control={control} name="privateKey.size" label="Key Size">
                            {
                                 watchAll.cryptoEngine.supported_key_types.find(keyFam => keyFam.type === watchKeyType)!.sizes.map((keySize, idx) => (
                                     <MenuItem key={idx} value={keySize}>{keySize}</MenuItem>
                                 ))
                            }
                        </FormSelect>
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Subject</SubsectionTitle>
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormTextField label="Country" control={control} name="subject.country" />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormTextField label="State / Province" control={control} name="subject.state" />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormTextField label="Locality" control={control} name="subject.locality" />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormTextField label="Organization" control={control} name="subject.organization" />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormTextField label="Organization Unit" control={control} name="subject.organizationUnit" />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormTextField label="Common Name" control={control} name="subject.commonName" disabled />
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>CA Expiration Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12} xl={4}>
                        <FormSelect control={control} name="caExpiration.type" label="Expiration By">
                            <MenuItem value={"duration"}>Duration</MenuItem>
                            <MenuItem value={"date"}>End Date</MenuItem>
                            <MenuItem value={"date-infinity"}>Indefinite Validity</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={12} xl={8} />
                    {
                        watchCAExpiration.type === "duration" && (
                            <Grid item xs={12} xl={4}>
                                <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="caExpiration.duration" error={!duration.validDurationRegex(watchCAExpiration.duration)} />
                            </Grid>
                        )
                    }
                    {
                        watchCAExpiration.type === "date" && (
                            <Grid item xs={12} xl={4}>
                                <FormDateInput label="Expiration Date" control={control} name="caExpiration.date" />
                            </Grid>
                        )
                    }
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2}>
                    <Grid item xs={12}>
                        <SubsectionTitle>Issuance Expiration Settings</SubsectionTitle>
                    </Grid>
                    <Grid item xs={12} xl={4}>
                        <FormSelect control={control} name="issuerExpiration.type" label="Issuance By">
                            <MenuItem value={"duration"}>Duration</MenuItem>
                            <MenuItem value={"date"}>End Date</MenuItem>
                            <MenuItem value={"date-infinity"}>Indefinite Validity</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={12} xl={8} />
                    {
                        watchIssuanceExpiration.type === "duration" && (
                            <Grid item xs={12} xl={4}>
                                <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="issuerExpiration.duration" error={!duration.validDurationRegex(watchIssuanceExpiration.duration)} />
                            </Grid>
                        )
                    }
                    {
                        watchIssuanceExpiration.type === "date" && (
                            <Grid item xs={4}>
                                <FormDateInput label="Expiration Date" control={control} name="issuerExpiration.date" />
                            </Grid>
                        )
                    }
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2} flexDirection={"column"}>
                    <Grid item>
                        <SubsectionTitle>Timeline</SubsectionTitle>
                    </Grid>
                    <Grid item>
                        <CATimeline
                            caExpiration={watchCAExpiration.type === "duration" ? watchCAExpiration.duration : (watchCAExpiration.type === "date" ? watchCAExpiration.date : "")}
                            issuanceDuration={watchIssuanceExpiration.type === "duration" ? watchIssuanceExpiration.duration : (watchIssuanceExpiration.type === "date" ? watchIssuanceExpiration.date : "")}
                        />
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2} flexDirection={"column"}>
                    <Grid item>
                        <LoadingButton loading={loading} variant="contained" type="submit" disabled={
                            watchSubject.commonName === "" ||
                            !duration.validDurationRegex(watchCAExpiration.duration) ||
                            !duration.validDurationRegex(watchIssuanceExpiration.duration)
                        }>Create CA</LoadingButton>
                    </Grid>
                    {
                        error && (
                            <Grid item>
                                <Alert severity="error">
                                    Something went wrong: {error}
                                </Alert>
                            </Grid>
                        )
                    }
                </Grid>
            </Grid>
        </form>

    );
};
