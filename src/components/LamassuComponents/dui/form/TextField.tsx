import { Control, Controller } from "react-hook-form";

import React from "react";
import { TextFiledProps } from "../TextField";
import {
    makeStyles,
    shorthands,
    Input,
    Label
} from "@fluentui/react-components";

interface FormTextFieldProps extends TextFiledProps {
    control: Control<any, any>,
    name: string
}

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        // Use 2px gap below the label (per the design system)
        ...shorthands.gap("2px"),
        // Prevent the example from taking the full width of the page (optional)
        maxWidth: "400px"
    }
});

export const FormTextField: React.FC<FormTextFieldProps> = (props) => {
    const styles = useStyles();

    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => (
                <div className={styles.root}>
                    <Label>{props.label}</Label>
                    <Input value={value} onChange={onChange} />
                </div>
            )}
        />
    );
};
