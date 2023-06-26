import { Control, Controller } from "react-hook-form";

import React from "react";
import { Switch, SwitchProps } from "../Switch";

interface FormSwitchProps extends SwitchProps {
    control: Control<any, any>,
    name: string
}

export const FormSwitch: React.FC<FormSwitchProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <Switch onChange={onChange} checked={value} {...props} />
            )}
        />
    );
};
