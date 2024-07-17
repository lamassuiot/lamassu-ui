import { Button, Typography, useTheme } from "@mui/material";
import { Control, Controller } from "react-hook-form";
import { TextField } from "components/TextField";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useState } from "react";

interface FormMultiKeyValueInputProps extends Omit<MultiKeyValueInputProps, "value" | "onChange"> {
    control: Control<any, any>,
    name: string
}

export const FormMultiKeyValueInput: React.FC<FormMultiKeyValueInputProps> = (props) => {
    return (
        <Controller
            name={props.name}
            control={props.control}
            render={({ field: { onChange, value } }) => {
                return <MultiKeyValueInput {...props} onChange={onChange} value={value} />;
            }}
        />
    );
};

interface MultiKeyValueInputProps {
    label: string
    value: any
    onChange: (values: any) => void
    disable?: boolean
}

const MultiKeyValueInput: React.FC<MultiKeyValueInputProps> = ({ label, value = {}, onChange, disable = false }) => {
    const theme = useTheme();
    const [newKey, setNewKey] = useState("");
    const [newVal, setNewVal] = useState("");

    return (
        <Grid container flexDirection={"column"}>
            <Grid>
                <Typography>{label}</Typography>
            </Grid>
            <Grid container spacing={1} flexDirection={"column"}>
                {
                    Object.entries(value).map(([key, value], idx) => {
                        let strValue = value;
                        if (typeof value === "object") {
                            strValue = JSON.stringify(value);
                        }
                        return (
                            <Grid key={key} container spacing={2} alignItems={"center"}>
                                <Grid xs={12} md>
                                    <TextField label="" value={key} disabled={disable} fullWidth sx={{}} />
                                </Grid>
                                <Grid xs={12} md>
                                    <TextField label="" value={strValue} disabled={disable} fullWidth />
                                </Grid>
                                {
                                    !disable && (
                                        <Grid xs="auto">
                                            <Button variant="outlined" onClick={() => {
                                                onChange((prev: any) => {
                                                    const newVal = { ...prev };
                                                    delete newVal[key];
                                                    return { ...newVal };
                                                });
                                            }}>
                                                <DeleteOutlinedIcon />
                                            </Button>
                                        </Grid>
                                    )
                                }
                            </Grid>
                        );
                    })
                }
                {
                    !disable && (
                        <Grid container spacing={2} alignItems={"center"}>
                            <Grid xs={12} md>
                                <TextField placeholder="Clave" fullWidth value={newKey} onChange={ev => setNewKey(ev.target.value)} label={""} />
                            </Grid>
                            <Grid xs={12} md>
                                <TextField placeholder="Valor" fullWidth label={""} value={newVal} onChange={ev => setNewVal(ev.target.value)} />
                            </Grid>
                            <Grid xs="auto">
                                <Button variant="outlined" disabled={newKey === ""} onClick={() => {
                                    onChange({ ...value, [newKey]: newVal });
                                    setNewKey("");
                                    setNewVal("");
                                }}>Add</Button>
                            </Grid>
                        </Grid>
                    )
                }
            </Grid>
        </Grid>
    );
};

export { MultiKeyValueInput }; export type { MultiKeyValueInputProps };
