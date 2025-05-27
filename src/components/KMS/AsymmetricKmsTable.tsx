import { Box, IconButton, Paper, Tooltip, Typography, lighten, useMediaQuery, useTheme } from "@mui/material";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef, GridFilterItem } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { Ref, useEffect, useImperativeHandle } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import apicalls from "ducks/apicalls";
import { AsymmetricKey } from "ducks/features/kms/models";
import { HiOutlineKey } from "react-icons/hi2";

interface Props {
    filter?: GridFilterItem | undefined;
    query?: { field: string, value: string, operator: string }
    ref?: Ref<FetchHandle>
    onRowClick?: (row: AsymmetricKey) => void
}

const Table = React.forwardRef((props: Props, ref: Ref<FetchHandle>) => {
    const tableRef = React.useRef<FetchHandle>(null);
    const navigate = useNavigate();
    const theme = useTheme();

    const isMobileScreen = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {
        if (props.query?.value || props.filter) {
            tableRef.current?.refresh();
        }
    }, [props.query, props.filter]);

    useImperativeHandle(ref, () => ({
        refresh() {
            tableRef.current?.refresh();
        }
    }));

    const cols: GridColDef<AsymmetricKey>[] = [
        {
            field: "id",
            headerName: "",
            filterable: false,
            sortable: false,
            resizable: false,
            type: "actions",
            minWidth: 10,
            maxWidth: 50,
            renderCell: ({ value, row, id }) => {
                return <HiOutlineKey />;
            }
        },
        { field: "name", valueGetter: (value, row) => value, headerName: "Name", minWidth: 250, flex: 0.2 },
        {
            field: "algorithm",
            headerName: "Algorithm",
            headerAlign: "center",
            align: "center",
            minWidth: 100,
            renderCell: ({ value, row, id }) => {
                return <Label color={"grey"}>{row.algorithm}</Label>;
            }
        },
        {
            field: "sha256",
            headerName: "SHA-256",
            minWidth: 200,
            flex: 1,
            renderCell: ({ value, row, id }) => {
                return <Typography  noWrap title={value} >
                    {value}
                </Typography>;
            }
        },
        {
            field: "tags",
            headerName: "Tags",
            minWidth: 250,
            flex: 1,
            renderCell: ({ value, row, id }) => {
                return <Grid container spacing={1}>
                    {
                        row.tags.map((t, idx) => {
                            return (
                                <Grid key={idx} xs="auto">
                                    <Label color={"grey"}>{t}</Label>
                                </Grid>
                            );
                        })
                    }
                </Grid>;
            }
        },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            headerAlign: "center",
            width: 150,
            cellClassName: "actions",
            renderCell: ({ value, row, id }) => {
                return (
                    <Grid container spacing={1} paddingY={"10px"}>
                        <Grid xs="auto">
                            <Tooltip title="Show Key">
                                <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: lighten(theme.palette.primary.light, 0.8), width: 35, height: 35 }}>
                                    <IconButton onClick={() => {
                                        navigate("/devices/" + row.id + "/certificates");
                                    }}>
                                        <VisibilityIcon sx={{ color: theme.palette.primary.main }} fontSize={"small"} />
                                    </IconButton>
                                </Box>
                            </Tooltip>
                        </Grid>
                    </Grid>
                );
            }
        }
    ];

    return (
        <TableFetchViewer
            columns={cols}
            fetcher={(params, controller) => {
                return apicalls.kms.getAsymmetricKeys(params);
            }}
            id={(item) => item.id}
            ref={tableRef}

            filter={!props.query || (props.query && props.query?.value === "") ? props.filter : { ...props.query, id: "query" }}
            sortField={{ field: "id", sort: "desc" }}
            density="compact"
        />
    );
});

Table.displayName = "AsymmetricKMSTable";
export default Table;

// export const ProbesTable = React.forwardRef<Props>(Table) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
