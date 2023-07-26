import React, { useEffect, useState } from "react";
import { Alert, Divider, Grid, MenuItem, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import moment, { Moment } from "moment";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import Label from "components/LamassuComponents/dui/typographies/Label";
import assert from "assert";
import { FormDateInput } from "components/LamassuComponents/dui/form/DateInput";
import { CryptoEngineSelector } from "components/LamassuComponents/lamassu/CryptoEngineSelector";
import { CryptoEngine, createCA } from "ducks/features/cav3/apicalls";
import { errorToString } from "ducks/services/api";
import { LoadingButton } from "@mui/lab";

type FormData = {
    cryptoEngine: string
    subject: {
        commonName: string;
        country: string;
        state: string;
        locality: string;
        organization: string;
        organizationUnit: string;
    }
    privateKey: {
        type: "RSA" | "ECDSA"
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

const unitConverterToSeconds = {
    s: 1,
    m: 60,
    h: 3600,
    d: 3600 * 24,
    w: 3600 * 24 * 7,
    y: 3600 * 24 * 365
};

const validDurationRegex = (test: string) => {
    const validator = /\d+[ywdhms]{1}/;
    const res = test.match(validator);
    if (res && res[0] === test) {
        return true;
    }
    return false;
};
const durationValueUnitSplitRegex = /\d+|\D+/g;

export const CreateCA = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [error, setError] = useState<string | undefined>();
    const [loading, setLoading] = useState(false);

    const [timelineStages, setTimelineStages] = useState<{
        label: string,
        size: number,
        background: string,
        color: string,
        startLabel: string | React.ReactElement | undefined,
        endLabel: string | React.ReactElement | undefined,
    }[]>([]);

    const [selectedCryptoEngine, setSelectedCryptoEngine] = useState<CryptoEngine | undefined>();

    const { control, getValues, setValue, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            cryptoEngine: "",
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

    const watchSubject = watch("subject");
    const watchKeyType = watch("privateKey.type");
    const watchCAExpiration = watch("caExpiration");
    const watchIssuanceExpiration = watch("issuerExpiration");

    useEffect(() => {
        const now = moment();

        let inactiveDate = now.clone();
        let expDate = now.clone();

        if (watchCAExpiration.type === "duration" && validDurationRegex(watchCAExpiration.duration)) {
            const expDurSplit = watchCAExpiration.duration.match(durationValueUnitSplitRegex);
            assert(expDurSplit !== null);
            assert(expDurSplit!.length === 2);
            // @ts-ignore
            expDate.add(parseInt(expDurSplit![0]) * unitConverterToSeconds[expDurSplit[1]], "seconds");
        } else if (watchCAExpiration.type === "date") {
            expDate = watchCAExpiration.date;
        } else {
            expDate = moment("99991231T235959Z");
        }

        if (watchIssuanceExpiration.type === "duration" && validDurationRegex(watchIssuanceExpiration.duration)) {
            const expDurSplit = watchIssuanceExpiration.duration.match(durationValueUnitSplitRegex);
            assert(expDurSplit !== null);
            assert(expDurSplit!.length === 2);
            // @ts-ignore
            inactiveDate = expDate.clone().subtract(parseInt(expDurSplit![0]) * unitConverterToSeconds[expDurSplit[1]], "seconds");
        } else if (watchIssuanceExpiration.type === "date") {
            inactiveDate = watchIssuanceExpiration.date;
        }

        const timelineStages = [
            {
                label: "Issuable Period",
                size: inactiveDate.diff(now),
                background: "#333",
                color: "#ddd",
                startLabel: <>
                    <Label>{now.format("DD/MM/YYYY")}</Label>
                    <Label>(now)</Label>
                </>,
                endLabel: undefined
            },
            {
                label: "Inactive",
                size: expDate.diff(now) - inactiveDate.diff(now),
                background: "#ddd",
                color: "#555",
                startLabel: inactiveDate.format("DD/MM/YYYY"),
                endLabel: expDate.format("DD/MM/YYYY")
            }
        ];

        setTimelineStages(timelineStages);
    }, [watchCAExpiration.date, watchCAExpiration.duration, watchCAExpiration.type, watchIssuanceExpiration.date, watchIssuanceExpiration.duration, watchIssuanceExpiration.type]);

    const handleCreateCA = (formData: FormData) => {
        const run = async () => {
            setLoading(true);
            try {
                await createCA({
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
                        <CryptoEngineSelector onSelect={(engine) => console.log(engine)} />
                    </Grid>
                    <Grid item xs={12} xl={4}>
                        <FormTextField label="CA Name" control={control} name="subject.commonName" helperText="Common Name can not be empty" error={watchSubject.commonName === ""} />
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        <FormSelect control={control} name="privateKey.type" label="Key Type">
                            <MenuItem value={"RSA"}>RSA</MenuItem>
                            <MenuItem value={"ECDSA"}>ECDSA</MenuItem>
                        </FormSelect>
                    </Grid>
                    <Grid item xs={6} xl={4}>
                        {
                            watchKeyType === "RSA"
                                ? (
                                    <FormSelect control={control} name="privateKey.size" label="Key Size">
                                        <MenuItem value={2048}>2048</MenuItem>
                                        <MenuItem value={3072}>3072</MenuItem>
                                        <MenuItem value={4096}>4096</MenuItem>
                                    </FormSelect>
                                )
                                : (
                                    <FormSelect control={control} name="privateKey.size" label="Key Size">
                                        <MenuItem value={224}>224</MenuItem>
                                        <MenuItem value={256}>256</MenuItem>
                                        <MenuItem value={384}>384</MenuItem>
                                    </FormSelect>
                                )
                        }
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
                                <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="caExpiration.duration" error={!validDurationRegex(watchCAExpiration.duration)} />
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
                                <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="issuerExpiration.duration" error={!validDurationRegex(watchIssuanceExpiration.duration)} />
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
                    <Grid item container flexDirection={"column"}>
                        <Grid container columns={timelineStages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0)} spacing={1}>
                            {
                                timelineStages.map((stage, idx) => (
                                    <Grid key={idx} item xs={stage.size} height={"50px"}>
                                        <Box sx={{ background: stage.background, color: stage.color, borderRadius: "3px", height: "100%" }}>
                                            <Grid container alignItems={"center"} justifyContent={"center"} width={"100%"} height={"100%"}>
                                                <Grid item xs="auto"><Typography>{stage.label}</Typography></Grid>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                ))
                            }
                        </Grid>
                        <Grid item container columns={timelineStages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0)} spacing={1} alignItems={"start"}>
                            {
                                timelineStages.map((stage, idx) => (
                                    <Grid key={idx} item xs={stage.size} container alignItems={"flex-start"} justifyContent={"space-between"}>
                                        <Grid item xs="auto" container flexDirection={"column"}>
                                            {
                                                stage.startLabel && (
                                                    <>
                                                        <Grid item><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                                        <Grid item>
                                                            {
                                                                typeof stage.startLabel === "string"
                                                                    ? (
                                                                        <Label>{stage.startLabel}</Label>
                                                                    )
                                                                    : (
                                                                        stage.startLabel
                                                                    )
                                                            }
                                                        </Grid>
                                                    </>
                                                )
                                            }
                                        </Grid>
                                        <Grid item xs="auto" container flexDirection={"column"} alignItems={"end"}>
                                            {
                                                stage.endLabel && (
                                                    <>
                                                        <Grid item><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                                        <Grid item>
                                                            {
                                                                typeof stage.endLabel === "string"
                                                                    ? (
                                                                        <Label>{stage.endLabel}</Label>
                                                                    )
                                                                    : (
                                                                        stage.endLabel
                                                                    )
                                                            }
                                                        </Grid>
                                                    </>
                                                )
                                            }
                                        </Grid>
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Grid>
                </Grid>

                <Grid item sx={{ width: "100%" }}>
                    <Divider />
                </Grid>

                <Grid item container spacing={2} flexDirection={"column"}>
                    <Grid item>
                        <LoadingButton loading={loading} variant="contained" type="submit" disabled={
                            watchSubject.commonName === "" ||
                            !validDurationRegex(watchCAExpiration.duration) ||
                            !validDurationRegex(watchIssuanceExpiration.duration)
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
