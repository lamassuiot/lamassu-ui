import { Control, Controller } from "react-hook-form";

import React from "react";
import { MultiKeyValueInput, MultiKeyValueInputProps } from "../MultiKeyValueInput";

interface FormMultiKeyValueInputProps extends MultiKeyValueInputProps {
    control: Control<any, any>,
    name: string
}

export const FormMultiKeyValueInput: React.FC<FormMultiKeyValueInputProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <MultiKeyValueInput onChange={onChange} value={value} {...props} />
            )}
        />
    );
};
