import { Control, Controller } from "react-hook-form";

import React from "react";
import TagsInput from "components/LamassuComponents/TagsInput";

interface FormMultiTextInputProps {
    control: Control<any, any>,
    name: string
    label: string
}

export const FormMultiTextInput: React.FC<FormMultiTextInputProps> = (props) => {
    console.log(props);

    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => {
                return (
                    <TagsInput onChange={onChange} tags={value} label={props.label} placeholder=""/>
                );
            }}
        />
    );
};
