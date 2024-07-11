import React, { useEffect, useState } from "react";
import moment, { Moment } from "moment";
import { } from "@mui/system";
import { useForm } from "react-hook-form";
import { Grid, IconButton, Button, MenuItem, Alert } from "@mui/material";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { TextField } from "components/LamassuComponents/dui/TextField";
import { CertificateAuthority } from "ducks/features/cav3/models";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import EditIcon from "@mui/icons-material/Edit";
import { FormSelect } from "components/LamassuComponents/dui/form/Select";
import { FormDateInput } from "components/LamassuComponents/dui/form/DateInput";
import * as duration from "components/utils/duration";
import { apicalls } from "ducks/apicalls";
import { errorToString } from "ducks/services/api";

interface Props {
    caData: CertificateAuthority
}
type FormData = {
    issuerExpiration: {
        type: "Duration" | "Time",
        date: Moment,
        duration: string
    },
};

export const CertificateSettings: React.FC<Props> = ({ caData }) => {
    const [editMode, setEditMode] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            issuerExpiration: {
                type: caData.issuance_expiration.type,
                date: caData.issuance_expiration.type === "Time" ? moment(caData.issuance_expiration.time) : moment(),
                duration: caData.issuance_expiration.type === "Duration" ? caData.issuance_expiration.duration : ""
            }
        }
    });

    const watchIssuanceExpiration = watch("issuerExpiration");

    useEffect(() => {
        if (editMode === false) {
            setError(undefined);
            reset();
        }
    }, [editMode]);

    const handleEditSubmit = handleSubmit(async (data) => {
        try {
            const resp = await apicalls.cas.updateCAIssuanceExpiration(caData.id, {
                type: data.issuerExpiration.type,
                duration: data.issuerExpiration.type === "Duration" ? data.issuerExpiration.duration : undefined,
                time: data.issuerExpiration.type === "Time" ? data.issuerExpiration.date.format() : undefined
            });
            setEditMode(false);
        } catch (err) {
            setError(errorToString(err));
        }
    });

    return (
        <form onSubmit={handleEditSubmit}>
            <Grid item xs={12}>
                <SubsectionTitle>Settings</SubsectionTitle>
            </Grid>
            <Grid item xs={12} container spacing={"20px"} alignItems={"end"}>
                {
                    editMode === false
                        ? (
                            <>
                                <Grid item xs>
                                    {
                                        caData.issuance_expiration.type === "Duration" && (
                                            <TextField value={caData.issuance_expiration.duration} label="Issuance Expiration" disabled />
                                        )
                                    }
                                    {
                                        caData.issuance_expiration.type === "Time" && (
                                            <TextField value={moment(caData.issuance_expiration.time).format("DD/MM/YYYY")} label="Issuance Expiration" disabled />
                                        )
                                    }
                                </Grid>
                                <Grid item xs="auto">
                                    <IconButton onClick={() => {
                                        setEditMode(true);
                                    }}>
                                        <EditIcon fontSize={"small"} />
                                    </IconButton>
                                </Grid>
                            </>
                        )
                        : (
                            <>
                                {
                                    error && (
                                        <Grid item xs={12}>
                                            <Alert severity="error"> {error}</Alert>
                                        </Grid>
                                    )
                                }
                                <Grid item container spacing={2}>
                                    <Grid item xs={12} xl={4}>
                                        <FormSelect control={control} name="issuerExpiration.type" label="Issuance By">
                                            <MenuItem value={"Duration"}>Duration</MenuItem>
                                            <MenuItem value={"Time"}>End Date</MenuItem>
                                        </FormSelect>
                                    </Grid>
                                    <Grid item xs={12} xl={8} />
                                    {
                                        watchIssuanceExpiration.type === "Duration" && (
                                            <Grid item xs={12} xl={4}>
                                                <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="issuerExpiration.duration" error={!duration.validDurationRegex(watchIssuanceExpiration.duration)} />
                                            </Grid>
                                        )
                                    }
                                    {
                                        watchIssuanceExpiration.type === "Time" && (
                                            <Grid item xs={4}>
                                                <FormDateInput label="Expiration Date" control={control} name="issuerExpiration.date" />
                                            </Grid>
                                        )
                                    }
                                </Grid>
                                <Grid item xs="auto">
                                    <Button variant="contained" type="submit">Save</Button>
                                </Grid>
                                <Grid item xs="auto">
                                    <Button onClick={() => {
                                        setEditMode(false);
                                    }}>Cancel</Button>
                                </Grid>
                            </>
                        )
                }
            </Grid>
        </form>

    );
};
