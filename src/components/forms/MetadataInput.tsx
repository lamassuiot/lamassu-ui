import { Alert, Button, Typography, useTheme } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React from "react";
import { Editor } from "@monaco-editor/react";

interface FormMultiKeyValueInputProps extends Omit<MetadataInputProps, "value" | "onChange"> {
    control: Control<any, any>,
    name: string
}

export const FormMultiKeyValueInput: React.FC<FormMultiKeyValueInputProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => {
                return <MetadataInput {...props} onChange={onChange} value={value} />;
            }}
        />
    );
};

interface MetadataInputProps {
    label: string
    value: { [key: string]: any }
    onChange: (values: { [key: string]: any }) => void
    readonly?: boolean
    disabled?: boolean
}

const MetadataInput: React.FC<MetadataInputProps> = (props) => {
    const theme = useTheme();

    const [metadata, setMetadata] = React.useState(props.value);
    const [enableSave, setEnableSave] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    return (
        <Grid container flexDirection={"column"} spacing={1}>
            <Grid>
                <Typography variant="h6">{props.label}</Typography>
            </Grid>
            <Grid>
                <Editor
                    theme="vs-dark"
                    defaultLanguage="json"
                    height="50vh"
                    value={JSON.stringify(metadata, null, 4)}
                    defaultValue={JSON.stringify(metadata, null, 4)}
                    onChange={(value) => {
                        if (!value) {
                            setMetadata({});
                            return;
                        }

                        try {
                            setMetadata(JSON.parse(value));
                            setEnableSave(true);
                            setHasError(false);
                        } catch (e) {
                            setEnableSave(false);
                            setHasError(true);
                            console.error("Error parsing metadata", e);
                        }
                    }}
                />
            </Grid>
            {hasError && (
                <Grid>
                    <Alert severity="error">Error parsing metadata. Not a valid JSON</Alert>
                </Grid>
            )}
            <Grid>
                <Button variant="contained" fullWidth disabled={!enableSave} onClick={() => { props.onChange(metadata); setEnableSave(false); }}>
                    Save changes
                </Button>
            </Grid>
        </Grid>
    );
};

export { MetadataInput };
