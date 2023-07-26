
import React from "react";
import { Autocomplete, AutocompleteProps, AutocompleteRenderInputParams, useTheme } from "@mui/material";
import { TextField } from "./TextField";

interface AutocompleteRenderInputParamsProps extends AutocompleteRenderInputParams {
    label: string,
    placeholder?: string,
    onClick?: (ev?: React.MouseEvent<HTMLElement>) => void
}

const RenderInputAutocomplete: React.FC<AutocompleteRenderInputParamsProps> = ({
    InputProps,
    InputLabelProps,
    label,
    placeholder = "Press enter to add",
    onClick = (ev: React.MouseEvent<HTMLElement>) => { },
    ...other
}) => {
    return (
        <div ref={InputProps.ref} >
            <TextField
                {...InputProps}
                {...other}
                label={label}

                onClick={onClick}
                placeholder={placeholder}
            />
        </div>
    );
};

interface MultiTextInputProps extends Omit<AutocompleteProps<any, true, true, true>, "renderInput"> {
    label: string
    placeholder?: string
}

const MultiTextInput: React.FC<MultiTextInputProps> = ({ label, ...rest }) => {
    const theme = useTheme();
    return (
        <Autocomplete
            value={rest.value}
            onChange={(ev) => {
                // @ts-ignore
                rest.onChange(ev);
            }}
            multiple
            ChipProps={{ sx: { borderRadius: "5px", fontSize: "12px", color: "#fff", background: "#555" } }}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={rest.placeholder}

                />
            )}
            {...rest}
        />
    );
};

export { MultiTextInput, RenderInputAutocomplete }; export type { MultiTextInputProps };
