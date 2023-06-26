import { Control, Controller } from "react-hook-form";

import React from "react";
import { Select, SelectProps } from "../Select";

interface FormSelectProps extends SelectProps {
    control: Control<any, any>,
    name: string
}

export const FormSelect: React.FC<FormSelectProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <Select onChange={onChange} value={value} {...props} />
            )}
        />
    );
};
