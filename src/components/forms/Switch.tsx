import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { IOSSwitch } from "components/Switch";
import { SwitchProps, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";

interface FormSwitchProps<T extends FieldValues> extends SwitchProps {
    control: Control<T, any>,
    name: FieldPath<T>,
    label: string
}

export const FormSwitch = <T extends FieldValues>(props: FormSwitchProps<T>) => {
    return (
        <Grid container flexDirection={"column"}>
            <Grid xs>
                <Typography>{props.label}</Typography>
            </Grid>
            <Grid xs>
                <Controller
                    name={props.name}
                    control={props.control}
                    render={({ field: { onChange, value } }) => (
                        <IOSSwitch onChange={onChange} checked={value} {...props} />
                    )}
                />
            </Grid>
        </Grid>
    );
};
