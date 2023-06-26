import { Control, Controller } from "react-hook-form";

import React from "react";
import { MultiTextInput, MultiTextInputProps } from "../MultiTextInput";

interface FormMultiTextInputProps extends MultiTextInputProps {
    control: Control<any, any>,
    name: string
}

export const FormMultiTextInput: React.FC<FormMultiTextInputProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <MultiTextInput onChange={onChange} value={value} {...props} />
            )}
        />
    );
};
