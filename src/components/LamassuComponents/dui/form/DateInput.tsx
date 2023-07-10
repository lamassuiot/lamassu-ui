import React from "react";
import "moment";
import DateInput, { DateInputProps } from "../DateInput";
import { Control, Controller } from "react-hook-form";

interface FormDateInputProps extends Omit<DateInputProps, "onChange" | "value"> {
    control: Control<any, any>,
    name: string
}

export const FormDateInput: React.FC<FormDateInputProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <DateInput onChange={onChange} value={value} {...props} />
            )}
        />

    );
};
