import { Alert, Divider, Typography, useTheme } from "@mui/material";
import { CASelector } from "components/CAs/CASelector";
import { CATimeline } from "./CATimeline";
import { CertificateAuthority, CryptoEngine } from "ducks/features/cas/models";
import { FormSelect } from "components/forms/Select";
import { FormTextField } from "components/forms/Textfield";
import { LoadingButton } from "@mui/lab";
import { errorToString } from "ducks/services/api-client";
import { useForm } from "react-hook-form";
import { useNavigate, useOutletContext } from "react-router-dom";
import { validDurationRegex } from "utils/duration";
import CryptoEngineSelector from "components/CryptoEngines/CryptoEngineSelector";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";
import apicalls from "ducks/apicalls";
import moment, { Moment } from "moment";
import { FormExpirationInput } from "components/forms/Expiration";

type FormData = {
    cryptoEngine: CryptoEngine
    parentCA: CertificateAuthority | undefined
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

    const navigate = useNavigate();
    const [preselectedCAParent] = useOutletContext<[CertificateAuthority | undefined]>();

    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            parentCA: preselectedCAParent,
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
                await apicalls.cas.createCA({
                    parent_id: formData.parentCA ? formData.parentCA.id : undefined,
                    id: formData.id,
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
                        time: formData.caExpiration.type === "date-infinity" ? moment("99991231T225959Z").format() : formData.caExpiration.date.format()
                    },
                    issuance_expiration: {
                        type: formData.issuerExpiration.type === "duration" ? "Duration" : "Time",
                        duration: formData.issuerExpiration.duration,
                        time: formData.issuerExpiration.type === "date-infinity" ? moment("99991231T225959Z").format() : formData.caExpiration.date.format()
                    },
                    ca_type: "MANAGED"
                });
                navigate(`/cas/${formData.id}`);
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
                <Grid xs={12} container spacing={2}>
                    <Grid xs={12}>
                        <Typography variant="h4">CA Settings</Typography>
                    </Grid>
                    <Grid xs={12}>
                        <CryptoEngineSelector value={watchAll.cryptoEngine} onSelect={engine => {
                            if (Array.isArray(engine)) {
                                if (engine.length > 0) {
                                    setValue("cryptoEngine", engine[0]);
                                }
                            } else if (engine) {
                                setValue("cryptoEngine", engine);
                            }
                        }} />
                    </Grid>
                    <Grid xs={12}>
                        <CASelector value={getValues("parentCA")} onSelect={(elems) => {
                            if (!Array.isArray(elems)) {
                                setValue("parentCA", elems);
                            }
                        }} multiple={false} label="Parent CA"
                        />
                    </Grid>
                    <Grid xs={12}>
                        <FormTextField label="CA ID" control={control} name="id" helperText="ID" disabled />
                    </Grid>
                    <Grid xs={12}>
                        <FormTextField label="CA Name" control={control} name="subject.commonName" helperText="Common Name can not be empty" error={watchSubject.commonName === ""} />
                    </Grid>
                    <Grid xs={6} md={6}>
                        <FormSelect control={control} name="privateKey.type" label="Key Type" options={
                            watchAll.cryptoEngine.supported_key_types.map((keyFam, idx) => {
                                return { value: keyFam.type, render: keyFam.type };
                            })
                        } />

                    </Grid>
                    <Grid xs={6} md={6}>
                        <FormSelect control={control} name="privateKey.size" label="Key Size" options={
                            watchAll.cryptoEngine.supported_key_types.find(keyFam => keyFam.type === watchKeyType)!.sizes.map((keySize, idx) => {
                                return { value: keySize, render: keySize.toString() };
                            })
                        } />
                    </Grid>
                </Grid>

                <Grid xs={12}>
                    <Divider />
                </Grid>

                <Grid xs={12} container spacing={2}>
                    <Grid xs={12}>
                        <Typography variant="h4">Subject</Typography>
                    </Grid>
                    <Grid xs={12} md={6}>
                        <FormTextField label="Country" control={control} name="subject.country" />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <FormTextField label="State / Province" control={control} name="subject.state" />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <FormTextField label="Locality" control={control} name="subject.locality" />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <FormTextField label="Organization" control={control} name="subject.organization" />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <FormTextField label="Organization Unit" control={control} name="subject.organizationUnit" />
                    </Grid>
                    <Grid xs={12} md={6}>
                        <FormTextField label="Common Name" control={control} name="subject.commonName" disabled />
                    </Grid>
                </Grid>

                <Grid xs={12}>
                    <Divider />
                </Grid>

                <Grid xs={12} container spacing={2}>
                    <Grid xs={12} md={6} container spacing={2} flexDirection={"column"}>
                        <Grid>
                            <Typography variant="h4">CA Expiration Settings</Typography>
                        </Grid>
                        <Grid>
                            <FormExpirationInput control={control} name="caExpiration" enableInfiniteDate />
                        </Grid>
                    </Grid>

                    <Grid xs={12} md={6} container spacing={2} flexDirection={"column"}>
                        <Grid>
                            <Typography variant="h4">Issuance Expiration Settings</Typography>
                        </Grid>
                        <Grid>
                            <FormExpirationInput control={control} name="issuerExpiration" enableInfiniteDate />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid xs={12}>
                    <Divider />
                </Grid>

                <Grid container spacing={2} xs={12}>
                    <Grid xs={12}>
                        <Typography variant="h4">Timeline</Typography>
                    </Grid>
                    <Grid xs={12}>
                        <CATimeline
                            caIssuedAt={moment()}
                            caExpiration={watchCAExpiration.type === "duration" ? watchCAExpiration.duration : (watchCAExpiration.type === "date" ? watchCAExpiration.date : "")}
                            issuanceDuration={watchIssuanceExpiration.type === "duration" ? watchIssuanceExpiration.duration : (watchIssuanceExpiration.type === "date" ? watchIssuanceExpiration.date : "")}
                        />
                    </Grid>
                </Grid>

                <Grid sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid container spacing={2} xs={12}>
                    <Grid xs={12}>
                        <LoadingButton loading={loading} variant="contained" type="submit" disabled={
                            watchSubject.commonName === "" ||
                            !validDurationRegex(watchCAExpiration.duration) ||
                            !validDurationRegex(watchIssuanceExpiration.duration)
                        }>Create CA</LoadingButton>
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

    );
};
