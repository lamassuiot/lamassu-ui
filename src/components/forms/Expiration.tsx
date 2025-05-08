import { Control, Controller, FieldPath, FieldValues, useForm } from "react-hook-form";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect } from "react";
import { FormSelect } from "./Select";
import { Moment } from "moment";
import { validDurationRegex } from "utils/duration";
import { FormDateInput } from "./DateInput";
import { FormTextField } from "./Textfield";

interface FormExpirationProps<T extends FieldValues> extends Omit<ExpirationInputProps, "value" | "onChange"> {
    control: Control<T, any>,
    name: FieldPath<T>,
}

export const FormExpirationInput = <T extends FieldValues>(props: FormExpirationProps<T>) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <ExpirationInput onChange={onChange} value={value} {...props} />
            )}
        />
    );
};

type FormData = {
    type: "duration" | "date" | "date-infinity",
    date: Moment,
    duration: string
};

interface ExpirationInputProps {
    value: FormData
    onChange: (data: FormData) => void,
    enableInfiniteDate?: boolean
}

export const ExpirationInput = (props: ExpirationInputProps) => {
    const { value, onChange, enableInfiniteDate } = props;

    const { control, getValues, setValue, watch, formState: { errors }, handleSubmit } = useForm<FormData>({
        defaultValues: {
            type: value.type,
            duration: value.duration,
            date: value.date
        }
    });

    useEffect(() => {
        setValue("type", value.type);
        setValue("duration", value.duration);
        setValue("date", value.date);
    }, [value, setValue]);

    const watchAll = watch();

    return (
        <Grid container spacing={2} alignItems={"end"}>
            <Grid xs={4}>
                <FormSelect control={control} name="type" label="" options={[
                    { value: "duration", render: "Duration" },
                    { value: "date", render: "End Date" },
                    ...(props.enableInfiniteDate ? [{ value: "date-infinity", render: "Indefinite Validity" }] : [])
                ]} />
            </Grid>
            {
                watchAll.type === "duration" && (
                    <Grid xs>
                        <FormTextField label="Duration (valid units y/w/d/h/m/s)" helperText="Not a valid expression. Valid units are y/w/d/h/m/s" control={control} name="duration" error={!validDurationRegex(watchAll.duration)} />
                    </Grid>
                )
            }
            {
                watchAll.type === "date" && (
                    <Grid xs>
                        <FormDateInput label="" control={control} name="date" />
                    </Grid>
                )
            }
        </Grid>
    );
};
