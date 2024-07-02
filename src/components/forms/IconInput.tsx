import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import { IconInput, IconInputProps } from "../IconInput";
import React from "react";

interface FormIconInputProps<T extends FieldValues> extends IconInputProps {
    control: Control<T, any>,
    name: FieldPath<T>,
}

export const FormIconInput = <T extends FieldValues>(props: FormIconInputProps<T>) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <IconInput onChange={onChange} value={value} {...props} />
            )}
        />
    );
};
