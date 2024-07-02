import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";

import { Select, SelectProps } from "components/Select";
import React from "react";

interface FormSelectProps<T extends FieldValues> extends SelectProps {
    control: Control<T, any>,
    name: FieldPath<T>,
}

export const FormSelect = <T extends FieldValues>(props: FormSelectProps<T>) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <Select onChange={onChange} fullWidth value={value} {...props} />
            )}
        />
    );
};
