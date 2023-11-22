import React, { useState, useEffect } from "react";
import { Box, IconButton, InputBase, Menu, MenuItem, Paper, Skeleton, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { AiOutlineSearch } from "react-icons/ai";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/system";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";
import Grid from "@mui/material/Unstable_Grid2";
import { Field, Filter, FilterRenderer, Filters } from "components/FilterInput";
import { MonoChromaticButton } from "./dui/MonoChromaticButton";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

interface LamassuTableRowProps {
    maxCols: number
    columnConf: Array<ColumnConfItem>
    dataItem: any,
    renderFunc: any,
    enableRowExpand?: any,
}

const LamassuTableRow: React.FC<LamassuTableRowProps> = ({ maxCols, dataItem, renderFunc, enableRowExpand, columnConf }) => {
    const [isRowExpanded, setIsRowExpanded] = useState(false);
    const renderedItem = renderFunc(dataItem);
    const theme = useTheme();
    const containerRef = React.useRef(null);

    return (
        <Grid columns={maxCols} container style={{}} alignItems="center" ref={containerRef} >
            <Grid xs={maxCols} container
                style={{ borderRadius: 10, border: `1.5px solid ${theme.palette.divider}`, padding: 10, marginBottom: isRowExpanded && enableRowExpand ? 0 : 10, cursor: enableRowExpand ? "pointer" : "initial" }}
                alignItems="center" {...(enableRowExpand && { onClick: () => { setIsRowExpanded(!isRowExpanded); } })} >
                {
                    columnConf.map((item: ColumnConfItem, idx: number) => {
                        return (
                            <Grid xs={item.size} container justifyContent={item.align} style={{ padding: "0px 4px" }} key={idx}>
                                {renderedItem[item.key]}
                            </Grid>
                        );
                    })
                }
            </Grid>

            {
                enableRowExpand && (
                    <TransitionGroup direction="up" in={isRowExpanded} container={containerRef.current} style={{ width: "100%" }}>
                        {
                            isRowExpanded && (
                                <Collapse>
                                    <Grid xs={maxCols}>
                                        {renderedItem.expandedRowElement}
                                    </Grid>
                                </Collapse >
                            )
                        }
                    </TransitionGroup>
                )
            }
        </Grid>
    );
};

interface ColumnConfItem {
    key: string,
    title: string,
    align: string,
    size: number,
    query?: string,
    sortFieldKey?: string,
}

interface LamassuTableProps {
    data: Array<any>
    listRender: {
        columnConf: Array<ColumnConfItem>
        renderFunc: (item: any) => any
        enableRowExpand: any,
    }
    style?: any,
    sort?: {
        enabled: boolean
        mode?: "asc" | "desc",
        prop?: string
    }
    [x: string]: any
}

export const LamassuTable: React.FC<LamassuTableProps> = ({ data, listRender, onSortChange, sort = { enabled: false, mode: "asc", prop: "" }, style = {}, ...props }) => {
    const theme = useTheme();
    // const [selectedSortColumn, setSelectedSortColumn] = useState(() => {
    //     const filtered = columnConf.filter(column => column.type !== undefined);
    //     if (filtered.length > 0) {
    //         return filtered[0].key;
    //     }
    //     return "";
    // });
    const maxCols = listRender.columnConf.reduce((prev: number, item: ColumnConfItem) => prev + item.size, 0);

    return (
        <Box style={{ width: "100%", ...style }} {...props}>
            <Grid container spacing={0}>
                <Grid xs={maxCols} columns={maxCols} container alignItems="center" style={{ padding: "0 10px 0 10px" }}>
                    {
                        listRender.columnConf.map((item: ColumnConfItem, idx: number) => (
                            <Grid xs={item.size} container justifyContent={"center"} style={{ marginBottom: 15, cursor: sort.enabled && item.sortFieldKey ? "pointer" : "initial" }} key={idx + "-col"} alignItems="initial" onClick={() => {
                                if (sort.enabled && item.sortFieldKey) {
                                    if (item.sortFieldKey === sort.prop) {
                                        if (sort.mode === "asc") {
                                            onSortChange("desc", item.sortFieldKey);
                                        } else {
                                            onSortChange("asc", item.sortFieldKey);
                                        }
                                    } else {
                                        onSortChange("asc", item.sortFieldKey);
                                    }
                                }
                            }}>
                                <Typography style={{ color: (sort.enabled && item.sortFieldKey === sort.prop) ? theme.palette.background.default : theme.palette.text.secondary, fontWeight: "400", fontSize: 12, textAlign: "center", padding: "2px 6px", borderRadius: "5px", background: (sort.enabled && item.sortFieldKey === sort.prop) ? theme.palette.primary.main : "transparent" }}>{item.title}</Typography>
                                {
                                    sort.enabled && item.sortFieldKey && (
                                        item.sortFieldKey === sort.prop
                                            ? (
                                                sort.mode === "asc"
                                                    ? (
                                                        <ArrowUpwardIcon sx={{ marginLeft: "5px", fontSize: "15px", color: theme.palette.text.secondary }} />
                                                    )
                                                    : (
                                                        <ArrowDownwardIcon sx={{ marginLeft: "5px", fontSize: "15px", color: theme.palette.text.secondary }} />
                                                    )
                                            )
                                            : (
                                                <UnfoldMoreIcon fontSize="small"/>
                                            )
                                    )
                                }
                            </Grid>
                        ))
                    }
                </Grid>
                {
                    data.length > 0
                        ? (
                            data.map((dataItem: any, idx: number) => {
                                return (
                                    <Grid xs={maxCols} key={idx}>
                                        <LamassuTableRow columnConf={listRender.columnConf} dataItem={dataItem} maxCols={maxCols} renderFunc={listRender.renderFunc} enableRowExpand={listRender.enableRowExpand} />
                                    </Grid>
                                );
                            })
                        )
                        : (
                            <Grid xs={maxCols} sx={{ display: "flex", justifyContent: "center", fontStyle: "italic", marginTop: "10px", fontSize: "12px" }}>
                                No data
                            </Grid>
                        )
                }
            </Grid>
        </Box>
    );
};

interface LamassuCardWrapperProps {
    data: Array<any>
    renderFunc: any
    style?: any
    [x: string]: any

}
export const LamassuCardWrapper: React.FC<LamassuCardWrapperProps> = ({ data, renderFunc, style = {}, ...props }) => {
    const theme = useTheme();
    const [renderedData, setRenderedData] = useState([<></>]);

    const renderCard = () => (
        data.map((dataItem: any, idx: number) => (
            <>
                {renderFunc(dataItem)}
            </>
        ))
    );

    useEffect(() => {
        setRenderedData(renderCard());
    }, [data, theme.palette.mode]);

    return (
        <Grid container spacing={2}>
            {
                renderedData
            }
        </Grid>
    );
};

export interface LamassuQueryInputProps {
    queryPlaceholder: string
    onChange: any
}

const LamassuQueryInput: React.FC<LamassuQueryInputProps> = ({ queryPlaceholder, onChange }) => {
    const [fastTypeQuery, setFastTypeQuery] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(fastTypeQuery);
        }, 1500);

        return () => clearTimeout(timer);
    }, [fastTypeQuery]);

    return <InputBase fullWidth={true} style={{ color: "#555", fontSize: 14 }} placeholder={queryPlaceholder} value={fastTypeQuery} onChange={(ev) => setFastTypeQuery(ev.target.value)} />;
};

export interface ListWithDataControllerConfigProps {
    sort: {
        enabled: boolean,
        selectedField?: string,
        selectedMode?: "asc" | "desc",
    },
    filters: {
        options: Field[]
        activeFilters: Filter[]
    },
    pagination: {
        enabled: boolean,
        options?: Array<number>,
        selectedItemsPerPage?: number,
        selectedPage?: number
    },
}
interface ListWithDataControllerProps extends Omit<LamassuTableProps, "listRender"> {
    tableProps?: any
    totalDataItems: number,
    invertContrast?: boolean,
    isLoading: boolean,
    emptyContentComponent: any,
    withRefresh?: any
    config?: ListWithDataControllerConfigProps
    onChange: (ev: ListWithDataControllerConfigProps)=> void
    defaultRender?: "TABLE" | "CARD",
    listConf: Array<ColumnConfItem>
    listRender?: {
        renderFunc: (item: any) => any
        enableRowExpand: any,
    }
    cardRender?: {
        renderFunc: (item: any) => any
    },
    enableRowExpand?: boolean
    withAdd?: any
    [x: string]: any
}

export const ListWithDataController: React.FC<ListWithDataControllerProps> = ({
    listConf, data, style = {},
    totalDataItems,
    tableProps = {},
    isLoading,
    emptyContentComponent,
    invertContrast,
    defaultRender = "TABLE",
    config = {
        filters: {
            activeFilters: [],
            options: []
        },
        sort: {
            enabled: false
        },
        pagination: {
            enabled: false
        }
    },
    onChange,
    withRefresh,
    withAdd,
    cardRender,
    listRender
}) => {
    const theme = useTheme();

    const [dataset, setDataset] = useState(data);
    useEffect(() => {
        setDataset(data);
    }, [data]);

    let queryPlaceholder = "";
    const queryableColumns: Array<ColumnConfItem> = listConf.filter((columnConfItem: ColumnConfItem) => { return columnConfItem.query; });
    if (queryableColumns.length === 1) {
        queryPlaceholder = queryableColumns[0].title;
    } else {
        for (let i = 0; i < queryableColumns.length; i++) {
            const element = queryableColumns[i];
            queryPlaceholder = queryPlaceholder + element.title;
            if (i < queryableColumns.length - 2) {
                queryPlaceholder = queryPlaceholder + ", ";
            } else if (i < queryableColumns.length - 1) {
                queryPlaceholder = queryPlaceholder + " OR ";
            }
        }
    }

    const [query, setQuery] = useState("");
    const [filters, setFilters] = useState<Filter[]>([]);

    useEffect(() => {
        const queryFieldId = listConf.find(c => c.query);
        if (queryFieldId) {
            if (query !== "") {
                const queryField = config.filters.options.find(f => f.key === queryFieldId.query);
                if (queryField) {
                    const newFilters = [...config.filters.activeFilters];
                    const idx = newFilters.findIndex(f => f.propertyField.key === queryField.key);
                    if (idx >= 0) {
                        newFilters.splice(idx, 1);
                    }
                    setFilters([...newFilters, {
                        propertyField: queryField,
                        propertyOperator: "contains",
                        propertyValue: query
                    }]);
                }
            } else {
                // check if there is any filter with 'query'. If so, remove it
                const idx = config.filters.activeFilters.findIndex(f => f.propertyField.key === queryFieldId.query);
                if (idx >= 0) {
                    const newFilters = [...config.filters.activeFilters];
                    newFilters.splice(idx, 1);
                    setFilters([...newFilters]);
                }
            }
        }
    }, [query]);

    const [viewMode, setViewMode] = useState<"TABLE" | "CARD">(defaultRender);

    const [itemsPerPageEl, setItemsPerPageEl] = useState(null);

    const handleItemsPerPageElClick = (event: any) => {
        if (itemsPerPageEl !== event.currentTarget) {
            setItemsPerPageEl(event.currentTarget);
        }
    };
    const handleItemsPerPageElClose = (event: any) => {
        setItemsPerPageEl(null);
    };

    useEffect(() => {
        onChange({ ...config, filters: { ...config.filters, activeFilters: [...filters] } });
    }, [filters]);

    return (
        <Box style={{ display: "flex", flexDirection: "column", height: "100%", width: "inherit" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "start", width: "100%" }}>
                <Box sx={{ display: "flex" }}>
                    <Box>
                        <Box component={Paper} sx={{ padding: "5px", height: 30, display: "flex", alignItems: "center", width: 300, background: invertContrast && theme.palette.background.lightContrast }}>
                            <AiOutlineSearch size={20} color="#626365" style={{ marginLeft: 10, marginRight: 10 }} />
                            <LamassuQueryInput queryPlaceholder={queryPlaceholder} onChange={(newValue: any) => { setQuery(newValue); }} />
                        </Box>
                    </Box>

                    {
                        withAdd !== undefined && (
                            <Box style={{ width: 40, height: 40, marginLeft: 10 }}>
                                <IconButton style={{ background: theme.palette.primary.light }} onClick={withAdd}>
                                    <AddIcon style={{ color: theme.palette.primary.main }} />
                                </IconButton>
                            </Box>
                        )
                    }

                </Box>
                <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "flex-end", flexDirection: "column" }}>

                    <Grid container spacing={2} justifyContent="flex-end" alignItems={"center"}>
                        <Grid xs="auto">
                            {
                                withRefresh !== undefined && (
                                    <IconButton onClick={() => { withRefresh(); }} style={{ backgroundColor: theme.palette.primary.light }}>
                                        <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                    </IconButton>
                                )
                            }
                        </Grid>

                        <Grid xs="auto" container alignItems={"center"} spacing={2}>
                            {
                                config.pagination.enabled && (
                                    <Grid xs="auto">
                                        <MonoChromaticButton
                                            size="small" variant="contained" disableFocusRipple disableRipple endIcon={itemsPerPageEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            onClick={handleItemsPerPageElClick}>{config.pagination.selectedItemsPerPage!} Items per Page</MonoChromaticButton>
                                        <Menu
                                            style={{ marginTop: 1, width: 200, borderRadius: 0 }}
                                            id="simple-menu"
                                            anchorEl={itemsPerPageEl}
                                            open={Boolean(itemsPerPageEl)}
                                            onClose={handleItemsPerPageElClose}
                                        >
                                            {
                                                config.pagination.options!.map((option: number) => {
                                                    return <MenuItem style={{ width: "100%" }} key={option} onClick={(ev) => {
                                                        onChange({ ...config, pagination: { ...config.pagination, selectedItemsPerPage: option, selectedPage: 0 } });
                                                        handleItemsPerPageElClose(ev);
                                                    }}>{option} Items per page</MenuItem>;
                                                })
                                            }
                                        </Menu>
                                    </Grid>
                                )
                            }
                            {
                                cardRender && (
                                    <Grid xs="auto">
                                        <ToggleButtonGroup
                                            value={viewMode}
                                            exclusive
                                            onChange={(ev, nextView) => { nextView !== null && setViewMode(nextView); }}
                                            color="primary"
                                            size="small"
                                        >
                                            <ToggleButton value="table" aria-label="list" >
                                                <ViewListIcon />
                                            </ToggleButton>
                                            <ToggleButton value="card" aria-label="card">
                                                <ViewModuleIcon />
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                    </Grid>
                                )
                            }
                            {
                                config.filters && (
                                    <Grid xs="auto">
                                        <Filters externalRender filters={filters} fields={config.filters.options} onChange={(filters) => setFilters([...filters])} />
                                    </Grid>
                                )
                            }
                        </Grid>
                    </Grid>

                </Box>
            </Box>

            <Box sx={{}}>
                <Grid container gap={2} sx={{ marginTop: "3px", justifyContent: "flex-end" }}>
                    <Grid xs>
                        <Typography style={{ fontWeight: 500, fontSize: 12, padding: "10px", color: theme.palette.text.primaryLight }}>{dataset.length} RESULTS</Typography>
                    </Grid>
                    <Grid xs="auto" container justifyContent={"flex-end"} gap={2}>
                        <FilterRenderer filters={filters} onChange={(newF) => setFilters([...newF])} />
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ height: "100%", flexGrow: 1, overflowY: "auto", padding: "10px" }}>
                {
                    isLoading
                        ? (
                            <Box sx={{ width: "100%", marginBottom: "20px" }}>
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                            </Box>
                        )
                        : (
                            data.length > 0
                                ? (
                                    viewMode === "TABLE"
                                        ? (
                                            listRender !== undefined
                                                ? (
                                                    <LamassuTable listRender={{
                                                        columnConf: listConf,
                                                        renderFunc: listRender.renderFunc,
                                                        enableRowExpand: listRender.enableRowExpand
                                                    }} data={dataset}
                                                    {...config.sort.enabled && { sort: { enabled: true, mode: config.sort.selectedMode, prop: config.sort.selectedField }, onSortChange: (mode: "asc" | "desc", prop: string) => { onChange({ ...config, sort: { ...config.sort, selectedField: prop, selectedMode: mode } }); } }} {...tableProps} />
                                                )
                                                : (
                                                    <>ops no content was defined</>
                                                )
                                        )
                                        : (
                                            cardRender !== undefined
                                                ? (
                                                    <LamassuCardWrapper data={dataset} renderFunc={cardRender.renderFunc} />
                                                )
                                                : (
                                                    <>ops no content was defined</>
                                                )
                                        )
                                )
                                : (
                                    emptyContentComponent
                                )
                        )
                }
            </Box>
        </Box>
    );
};
