import { Control, Controller } from "react-hook-form";

import React from "react";
import { TextFiledProps, TextField } from "../TextField";

interface FormTextFieldProps extends TextFiledProps {
    control: Control<any, any>,
    name: string
}

export const FormTextField: React.FC<FormTextFieldProps> = (props) => {
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
