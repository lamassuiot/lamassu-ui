import { AiOutlineSearch } from "react-icons/ai";
import { Box, Paper, SxProps } from "@mui/material";
import { Select } from "./Select";
import { TimedTextField } from "./TimedTextField";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";

interface fieldSelector {
    key: string;
    title: string;
}

interface Props {
    onChange: ({ query, field }: { query: string, field: string }) => void;
    fieldSelector?: fieldSelector[];
    sx?: SxProps;
}

export const QuerySearchbarInput: React.FC<Props> = (props) => {
    const [query, setQuery] = useState("");
    const [queryFieldIdx, setQueryFieldIdx] = useState(0);

    useEffect(() => {
        props.onChange({ query, field: props.fieldSelector ? props.fieldSelector[queryFieldIdx].key : "" });
    }, [query, queryFieldIdx]);

    return (
        <Box component={Paper} sx={{ padding: "5px", height: 30, display: "flex", alignItems: "center", width: 450, ...props.sx }}>
            <Grid container spacing={1} sx={{ width: "100%" }}>
                <Grid xs container alignItems={"center"}>
                    <Grid xs="auto">
                        <AiOutlineSearch size={20} color="#626365" style={{ marginLeft: 10, marginRight: 10 }} />
                    </Grid>
                    <Grid xs>
                        <TimedTextField waitTime={500} queryPlaceholder={props && props.fieldSelector ? props.fieldSelector[queryFieldIdx].title : ""} onChange={(newValue: any) => {
                            setQuery(newValue);
                        }} />
                    </Grid>
                </Grid>
                {
                    props.fieldSelector &&
                    <Grid xs="auto">
                        <Select label="" value={queryFieldIdx} sx={{ height: "30px" }} onChange={(ev) => setQueryFieldIdx(ev.target.value as number)} options={
                            props.fieldSelector.map((field, idx) => {
                                return { value: idx, render: field.title };
                            })
                        }/>
                    </Grid>
                }
            </Grid>
        </Box>
    );
};
