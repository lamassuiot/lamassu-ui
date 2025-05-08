import { Box, IconButton, Paper, Tooltip, Typography, lighten, useMediaQuery, useTheme } from "@mui/material";
import { Device, deviceStatusToColor } from "ducks/features/devices/models";
import { FetchHandle, TableFetchViewer } from "components/TableFetcherView";
import { GridColDef, GridFilterItem } from "@mui/x-data-grid";
import { IconInput } from "components/IconInput";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import Label from "components/Label";
import React, { Ref, useEffect, useImperativeHandle } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import apicalls from "ducks/apicalls";
import moment from "moment";

interface Props {
    filter?: GridFilterItem | undefined;
    query?: { field: string, value: string, operator: string}
    ref?: Ref<FetchHandle>
    onRowClick?: (row: Device) => void
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
        refresh () {
            tableRef.current?.refresh();
        }
    }));

    const cols: GridColDef<Device>[] = [
        {
            field: "icon",
            headerName: "",
            filterable: false,
            sortable: false,
            resizable: false,
            type: "actions",
            minWidth: 10,
            maxWidth: 50,
            renderCell: ({ value, row, id }) => {
                const iconSplit = row.icon_color.split("-");
                return <Box padding={"0px 0px 5px 0px"}>
                    <IconInput readonly label="" size={35} value={{ bg: iconSplit[0], fg: iconSplit[1], name: row.icon }} />
                </Box>;
            }
        },
        { field: "id", valueGetter: (value, row) => value, headerName: "ID", minWidth: 250, flex: 0.2 },
        {
            field: "status",
            headerName: "Status",
            headerAlign: "center",
            align: "center",
            minWidth: 250,
            renderCell: ({ value, row, id }) => {
                return <Label color={deviceStatusToColor(row.status)}>{row.status}</Label>;
            }
        },
        {
            field: "dms_owner",
            headerName: "DMS",
            headerAlign: "center",
            align: "center",
            minWidth: 250,
            renderCell: ({ value, row, id }) => {
                return <Label color={"grey"}>{row.dms_owner}</Label>;
            }
        },
        {
            field: "creation_timestamp",
            headerName: "Created At",
            align: "center",
            headerAlign: "center",
            minWidth: 200,
            renderCell: ({ value, row, id }) => {
                return <Grid container flexDirection={"column"}>
                    <Grid xs><Typography variant="body2" textAlign={"center"}>{moment(row.creation_timestamp).format("DD/MM/YYYY HH:mm")}</Typography></Grid>
                    <Grid xs><Typography variant="caption" textAlign={"center"} textTransform={"none"} component={"div"}>{moment.duration(moment(row.creation_timestamp).diff(moment())).humanize(true)}</Typography></Grid>
                </Grid>;
            }
        },
        {
            field: "tags",
            headerName: "Tags",
            minWidth: 200,
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
                            <Tooltip title="Show Device">
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
            fetcher={(params, _controller) => {
                return apicalls.devices.getDevices(params);
            }}
            id={(item) => item.id}
            ref={tableRef}
            filter={!props.query || (props.query && props.query?.value === "") ? props.filter : { ...props.query, id: "query" }}
            density="compact"
            sortField={{ field: "creation_timestamp", sort: "desc" }}
            {
                ...isMobileScreen ? { onRowClick: props.onRowClick } : {}
            }

        />
    );
});

Table.displayName = "DevicesTable";
export default Table;

// export const ProbesTable = React.forwardRef<Props>(Table) as (props: Props & { ref?: Ref<FetchHandle> }) => ReactElement;
