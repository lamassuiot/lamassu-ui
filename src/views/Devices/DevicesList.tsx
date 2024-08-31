import { Box, IconButton, Paper, Tooltip, lighten, useTheme } from "@mui/material";
import { FetchHandle } from "components/TableFetcherView";
import { GridFilterItem } from "@mui/x-data-grid";
import { QuerySearchbarInput } from "components/QuerySearchbarInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import DevicesTable from "components/Devices/DeviceTable";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

const queryableFields = [
    { key: "id", title: "Device ID", operator: "contains" },
    { key: "tags", title: "Tags", operator: "equal" }
];

export const DevicesListView = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [searchParams, _] = useSearchParams();

    const tableRef = React.useRef<FetchHandle>(null);
    const [query, setQuery] = React.useState<{ value: string, field: string, operator: string }>({ value: "", field: "", operator: "" });

    const urlFilters = searchParams.getAll("filter");
    let filter: GridFilterItem | undefined;

    urlFilters.forEach(f => {
        // check filter syntax
        if (f.includes("[") && f.includes("]")) {
            const propName = f.substring(0, f.indexOf("["));
            const op = f.substring(f.indexOf("[") + 1, f.indexOf("]"));
            const val = f.substring(f.indexOf("]") + 1, f.length);

            if (propName !== "" && op !== "" && val !== "") {
                filter = {
                    id: propName,
                    field: propName,
                    value: val,
                    operator: op
                };
            }
        }
    });

    return (
        <Box padding={"30px 30px"}>
            <Grid container flexDirection={"column"} spacing={"20px"}>
                <Grid xs container>
                    <Grid xs={12} md>
                        <Grid container>
                            <QuerySearchbarInput onChange={({ query, field }) => {
                                setQuery({ value: query, field, operator: queryableFields.find((f) => f.key === field)?.operator || "contains" });
                            }}
                            fieldSelector={queryableFields}
                            />
                        </Grid>
                    </Grid>
                    <Grid xs="auto">
                        <Tooltip title="Refresh Device List">
                            <IconButton onClick={() => { tableRef.current?.refresh(); }} style={{ background: lighten(theme.palette.primary.main, 0.7) }}>
                                <RefreshIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                    <Grid xs="auto">
                        <Tooltip title="Add New Device">
                            <IconButton style={{ background: lighten(theme.palette.primary.main, 0.7) }} onClick={() => { navigate("create"); }}>
                                <AddIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid xs >
                    <Box component={Paper} borderRadius={"15px"}>
                        <DevicesTable ref={tableRef} query={query} filter={filter} onRowClick={(row) => {
                            navigate(`/devices/${row.id}/certificates`);
                        }} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
