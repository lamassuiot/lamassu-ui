import "moment/locale/es";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import React from "react";

interface FormProps<T extends FieldValues> {
    control: Control<T, any>,
    name: FieldPath<T>,
    label: string
}

export const FormDateInput = <T extends FieldValues>(props: FormProps<T>) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
                    <DatePicker
                        label={props.label}
                        value={value}
                        onChange={(ev) => {
                            if (ev !== null) {
                                onChange(ev);
                            }
                        }}
                    />
                </LocalizationProvider>
            )}
        />
    );
};
