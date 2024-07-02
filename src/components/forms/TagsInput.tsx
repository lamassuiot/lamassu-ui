import { Control, Controller, FieldPath, FieldValues } from "react-hook-form";
import React from "react";
import TagsInput from "components/TagsInput";

interface FormTagsInputProps<T extends FieldValues> {
    control: Control<T, any>,
    name: FieldPath<T>,
    label: string
}

export const FormTagsInput = <T extends FieldValues>(props: FormTagsInputProps<T>) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => {
                return (
                    <TagsInput onChange={onChange} tags={value} label={props.label} />
                );
            }}
        />
    );
};
