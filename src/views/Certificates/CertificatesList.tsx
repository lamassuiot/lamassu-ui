import { Box, IconButton, Paper, Tooltip, lighten, useTheme } from "@mui/material";
import { CertificatesTable } from "components/Certificates/CertificatesTable";
import { FetchHandle } from "components/TableFetcherView";
import { QuerySearchbarInput } from "components/QuerySearchbarInput";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import RefreshIcon from "@mui/icons-material/Refresh";

const queryableFields = [
    { key: "subject.common_name", title: "Common Name", operator: "contains" },
    { key: "serial_number", title: "Serial Number", operator: "contains" }
];

export const CertificateListView = () => {
    const theme = useTheme();
    const tableRef = React.useRef<FetchHandle>(null);

    const [query, setQuery] = React.useState<{ value: string, field: string, operator: string }>({ value: "", field: "", operator: "" });

    return (
        <Box padding={"30px 30px"}>
            <Grid container flexDirection={"column"} spacing={"20px"}>
                <Grid xs container>
                    <Grid xs={12} md>
                        <Grid container>
                            <QuerySearchbarInput onChange={({ query, field }) => {
                                setQuery({ value: query, field, operator: queryableFields.find((f) => f.key === field)!.operator || "contains" });
                            }}
                            fieldSelector={queryableFields}
                            />
                        </Grid>
                    </Grid>
                    <Grid xs="auto">
                        <Tooltip title="Reload Certificate List">
                            <IconButton onClick={() => { tableRef.current?.refresh(); }} style={{ background: lighten(theme.palette.primary.main, 0.7) }}>
                                <RefreshIcon style={{ color: theme.palette.primary.main }} />
                            </IconButton>
                        </Tooltip>
                    </Grid>
                </Grid>
                <Grid>
                    <Box component={Paper} borderRadius={"15px"}>
                        <CertificatesTable ref={tableRef} query={{ field: query.field, value: query.value, operator: query.operator }} />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};
