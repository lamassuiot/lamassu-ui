import { Control, Controller } from "react-hook-form";

import React from "react";
import { IconInput, IconInputProps } from "../IconInput";

interface FormIconInputProps extends IconInputProps {
    control: Control<any, any>,
    name: string
}

export const FormIconInput: React.FC<FormIconInputProps> = (props) => {
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
