
import React, { useEffect, useState } from "react";
import { Button, Grid, useTheme } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { TextField } from "./TextField";
import Label from "./typographies/Label";

interface MultiKeyValueInputProps {
    label: string
    value?: Map<string, any>
    onChange?: (values: Map<string, any>) => void
}

const MultiKeyValueInput: React.FC<MultiKeyValueInputProps> = ({ label, value = new Map<string, any>(), onChange }) => {
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
                    Array.from(keyValues.entries()).map(([key, value]) => {
                        return (
                            <Grid key={key} item container spacing={2} alignItems={"center"}>
                                <Grid item xs={3}>
                                    <TextField label="" value={key} />
                                </Grid>
                                <Grid item xs>
                                    <TextField label="" value={value} />
                                </Grid>
                                <Grid item xs="auto">
                                    <Button variant="outlined" onClick={() => {
                                        setKeyValues(prev => {
                                            const map = new Map(prev);
                                            map.delete(key);
                                            return new Map(map);
                                        });
                                    }}>
                                        <DeleteOutlinedIcon />
                                    </Button>
                                </Grid>
                            </Grid>
                        );
                    })
                }
                <Grid item container spacing={2} alignItems={"center"}>
                    <Grid item xs={3}>
                        <TextField placeholder="Key" value={newKey} onChange={ev => setNewKey(ev.target.value)} label={""} />
                    </Grid>
                    <Grid item xs>
                        <TextField label={""} value={newVal} onChange={ev => setNewVal(ev.target.value)} />
                    </Grid>
                    <Grid item xs="auto">
                        <Button variant="outlined" disabled={newKey === ""} onClick={() => {
                            setKeyValues(keyValues.set(newKey, newVal));
                            setNewKey("");
                            setNewVal("");
                        }}>Add</Button>
                    </Grid>
                </Grid>
            </Grid>
        </Grid >
    );
};

export { MultiKeyValueInput }; export type { MultiKeyValueInputProps };
