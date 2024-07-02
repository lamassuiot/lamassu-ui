import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { TextField, TextFieldProps } from "components/TextField";
import React from "react";

interface FormTextFieldProps<T extends FieldValues> extends TextFieldProps {
    control: Control<T, any>
    name: FieldPath<T>
}

export const FormTextField = <T extends FieldValues>(props: FormTextFieldProps<T>) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <TextField onChange={onChange} value={value} {...props} />
            )}
        />
    );
};
