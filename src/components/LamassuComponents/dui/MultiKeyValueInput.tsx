
import React, { useEffect, useState } from "react";
import { Button, Grid, useTheme } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { TextField } from "./TextField";
import Label from "./typographies/Label";

interface MultiKeyValueInputProps {
    label: string
    value?: any
    onChange?: (values: any) => void
    disable?: boolean
}

const MultiKeyValueInput: React.FC<MultiKeyValueInputProps> = ({ label, value = {}, onChange, disable = false }) => {
    const theme = useTheme();
    const [keyValues, setKeyValues] = useState(value);
    const [newKey, setNewKey] = useState("");
    const [newVal, setNewVal] = useState("");

    useEffect(() => {
        if (onChange) {
            onChange(keyValues);
        }
    }, [keyValues]);

    return (
        <Grid container flexDirection={"column"}>
            <Grid item>
                <Label>{label}</Label>
            </Grid>
            <Grid item container spacing={1} flexDirection={"column"}>
                {
                    Object.entries(keyValues).map(([key, value], idx) => {
                        let strValue = value;
                        if (typeof value === "object") {
                            strValue = JSON.stringify(value);
                        }
                        return (
                            <Grid key={key} item container spacing={2} alignItems={"center"}>
                                <Grid item xs={4}>
                                    <TextField label="" value={key} disabled={disable} />
                                </Grid>
                                <Grid item xs>
                                    <TextField label="" value={strValue} disabled={disable}/>
                                </Grid>
                                {
                                    !disable && (
                                        <Grid item xs="auto">
                                            <Button variant="outlined" onClick={() => {
                                                setKeyValues((prev: any) => {
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
                        <Grid item container spacing={2} alignItems={"center"}>
                            <Grid item xs={4}>
                                <TextField placeholder="Key" value={newKey} onChange={ev => setNewKey(ev.target.value)} label={""} />
                            </Grid>
                            <Grid item xs>
                                <TextField label={""} value={newVal} onChange={ev => setNewVal(ev.target.value)} />
                            </Grid>
                            <Grid item xs="auto">
                                <Button variant="outlined" disabled={newKey === ""} onClick={() => {
                                    setKeyValues({ ...keyValues, [newKey]: newVal });
                                    setNewKey("");
                                    setNewVal("");
                                }}>Add</Button>
                            </Grid>
                        </Grid>
                    )
                }
            </Grid>
        </Grid >
    );
};

export { MultiKeyValueInput }; export type { MultiKeyValueInputProps };
