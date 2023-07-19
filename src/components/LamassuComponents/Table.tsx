import React, { useState, useEffect } from "react";
import { Box, Button, FormControl, Grid, IconButton, InputBase, InputLabel, Menu, MenuItem, Paper, Select, Skeleton, TextField, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { AiOutlineSearch, AiOutlineNumber } from "react-icons/ai";
import AddIcon from "@mui/icons-material/Add";
import { ColoredButton } from "components/LamassuComponents/ColoredButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTheme } from "@mui/system";
import ShortTextRoundedIcon from "@mui/icons-material/ShortTextRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { BsCalendar3 } from "react-icons/bs";
import ObjectByString from "components/utils/ObjectByString";
import DateAdapter from "@mui/lab/AdapterMoment";
import { DatePicker, LocalizationProvider } from "@mui/lab";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import Collapse from "@mui/material/Collapse";
import { TransitionGroup } from "react-transition-group";
import { numberToHumanReadableString } from "components/utils/NumberToHumanReadableString";

export const Operands = {
    number: {
        equal: "Equal",
        lessThan: "Less Than",
        greaterThan: "Greater than"
    },
    date: {
        before: "Before",
        after: "After"
    },
    enum: {
        is: "Is",
        isnot: "Is not"
    },
    tags: {
        contains: "Contains"
    },
    string: {
        contains: "Contains",
        is: "Is"
    }
};

export const OperandTypes = {
    number: "number",
    date: "date",
    enum: "enum",
    tags: "tags",
    string: "string"
};
type TOperandTypes = typeof OperandTypes[keyof typeof OperandTypes];

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
        <Grid item columns={maxCols} container style={{}} alignItems="center" ref={containerRef} >
            <Grid item xs={maxCols} container
                style={{ borderRadius: 10, border: `1.5px solid ${theme.palette.divider}`, padding: 10, marginBottom: isRowExpanded && enableRowExpand ? 0 : 10, cursor: enableRowExpand ? "pointer" : "initial" }}
                alignItems="center" {...(enableRowExpand && { onClick: () => { setIsRowExpanded(!isRowExpanded); } })} >
                {
                    columnConf.map((item: ColumnConfItem, idx: number) => {
                        return (
                            <Grid item xs={item.size} container justifyContent={item.align} style={{ padding: "0px 4px" }} key={idx}>
                                {renderedItem[item.key]}
                            </Grid>
                        );
                    })
                }
            </Grid>

            <TransitionGroup direction="up" in={isRowExpanded} container={containerRef.current} style={{ width: "100%" }}>
                {
                    enableRowExpand && isRowExpanded && (
                        <Collapse>
                            <Grid item xs={maxCols}>
                                {renderedItem.expandedRowElement}
                            </Grid>
                        </Collapse >
                    )
                }
            </TransitionGroup>
        </Grid>
    );
};

interface ColumnConfItem {
    key: string,
    dataKey?: string,
    title: string,
    align: string,
    size: number,
    query?: boolean,
    type?: TOperandTypes
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
    onSortChange?: any
    [x: string]: any
}

export const LamassuTable: React.FC<LamassuTableProps> = ({ data, sortProperties, listRender, onSortChange, sort = { enabled: false, mode: "asc", prop: "" }, style = {}, ...props }) => {
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
                {
                    <Grid item columns={listRender.columnConf.reduce((prev: number, item: any) => prev + item.size, 0)} container alignItems="center" style={{ padding: "0 10px 0 10px" }}>
                        {
                            listRender.columnConf.map((item: any, idx: number) => (
                                <Grid item xs={item.size} container justifyContent="center" style={{ marginBottom: 15, cursor: sort.enabled ? "pointer" : "initial" }} key={idx + "-col"} alignItems="initial" onClick={() => {
                                    if (sort.enabled) {
                                        if (item.key === sort.prop) {
                                            if (sort.mode === "asc") {
                                                onSortChange("desc", item.key);
                                            } else {
                                                onSortChange("asc", item.key);
                                            }
                                        } else {
                                            onSortChange("asc", item.key);
                                        }
                                    }
                                }}>
                                    <Typography style={{ color: (sort.enabled && item.key === sort.prop) ? theme.palette.background.default : theme.palette.text.secondary, fontWeight: "400", fontSize: 12, textAlign: "center", padding: "2px 6px", borderRadius: "5px", background: (sort.enabled && item.key === sort.prop) ? theme.palette.primary.main : "transparent" }}>{item.title}</Typography>
                                    {
                                        sort.enabled && item.key === sort.prop && (
                                            sort.mode === "asc"
                                                ? (
                                                    <ArrowUpwardIcon sx={{ marginLeft: "5px", fontSize: "15px", color: theme.palette.text.secondary }} />
                                                )
                                                : (
                                                    <ArrowDownwardIcon sx={{ marginLeft: "5px", fontSize: "15px", color: theme.palette.text.secondary }} />
                                                )
                                        )
                                    }
                                </Grid>
                            ))
                        }
                    </Grid>
                }
                {
                    data.length > 0
                        ? (
                            data.map((dataItem: any, idx: number) => {
                                return (
                                    <LamassuTableRow columnConf={listRender.columnConf} dataItem={dataItem} maxCols={maxCols} renderFunc={listRender.renderFunc} enableRowExpand={listRender.enableRowExpand} key={idx} />
                                );
                            })
                        )
                        : (
                            <Grid item xs sx={{ display: "flex", justifyContent: "center", fontStyle: "italic", marginTop: "10px", fontSize: "12px" }}>
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
    filter: {
        enabled: boolean,
        filters?: Array<any>
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
    onChange: any,
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
        filter: {
            enabled: false,
            filters: []
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
    const queryableColumns: Array<ColumnConfItem> = listConf.filter((columnConfItem: ColumnConfItem) => { return columnConfItem.query && columnConfItem.type === OperandTypes.string; });
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

    const [newFilter, setNewFiler] = useState({
        propertyKey: "",
        propertyOperator: "",
        propertyOperatorType: "",
        propertyValue: ""
    });

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

    const [addFilerAnchorEl, setAddFilerAnchorEl] = useState(null);
    const handleAddFilterClick = (event: any) => {
        if (addFilerAnchorEl !== event.currentTarget) {
            setAddFilerAnchorEl(event.currentTarget);
        }
    };
    const handleAddFilterClose = (event: any) => {
        setNewFiler({
            propertyKey: "",
            propertyOperator: "",
            propertyOperatorType: "",
            propertyValue: ""
        });
        setAddFilerAnchorEl(null);
    };

    useEffect(() => {
        const queryableColumns: Array<ColumnConfItem> = listConf.filter((columnConfItem: ColumnConfItem) => { return columnConfItem.query && columnConfItem.type === OperandTypes.string; });
        if (queryableColumns.length > 0) {
            const newFilter = {
                propertyKey: queryableColumns[0].dataKey,
                propertyOperator: "contains",
                propertyOperatorType: "string",
                propertyValue: query
            };
            const newFilters = config.filter!.filters!;
            const indexOfExistingFilter = newFilters.map((f: any) => f.propertyKey).indexOf(newFilter.propertyKey);

            if (indexOfExistingFilter >= 0) {
                if (query !== "") {
                    newFilters[indexOfExistingFilter] = newFilter;
                } else {
                    newFilters.splice(indexOfExistingFilter);
                }
            } else {
                if (query !== "") {
                    newFilters.push(newFilter);
                }
            }
            onChange({ filter: { ...config.filter, filters: [...newFilters] } });
        }
    }, [query]);

    const loadOptionsForPropertyKey = (key: string) => {
        if (key !== "") {
            const propType = listConf.filter((columnConfItem: ColumnConfItem) => columnConfItem.key === key)[0].type!;
            const operandKeys = Object.keys((Operands as any)[propType]);

            return operandKeys.map((key: string) => {
                return <MenuItem key={key} value={key}>{(Operands as any)[propType][key]}</MenuItem>;
            });
        }
        return <></>;
    };
    const loadInputForPropertyKey = (key: string, operator: string) => {
        if (key !== "") {
            const prop = listConf.filter((columnConfItem: ColumnConfItem) => columnConfItem.key === key)[0];
            const propType = prop.type;
            switch (propType) {
            case "string":
                return <TextField value={newFilter.propertyValue} onChange={(ev) => setNewFiler((prev) => ({ ...prev, propertyValue: ev.target.value, propertyOperatorType: propType }))} variant="standard" />;
            case "enum": {
                const options: any[] = [];
                data.forEach((dataItem: any) => {
                    const opt = ObjectByString(dataItem, prop.dataKey!);

                    if (!options.includes(opt)) {
                        options.push(opt);
                    }
                });
                return (
                    <FormControl variant="standard" fullWidth disabled={newFilter.propertyKey === ""}>
                        <Select
                            label="Property"
                            value={newFilter.propertyValue}
                            onChange={(ev) => { setNewFiler((prev) => ({ ...prev, propertyOperatorType: propType, propertyValue: ev.target.value })); }}
                        >
                            {
                                options.map((option: any, idx: number) => {
                                    return <MenuItem key={idx} value={option}>{option}</MenuItem>;
                                })
                            }
                        </Select>
                    </FormControl>
                );
            }
            case "number":
                return <TextField value={newFilter.propertyValue} onChange={(ev) => setNewFiler((prev) => ({ ...prev, propertyValue: ev.target.value, propertyOperatorType: propType }))} variant="standard" type="number" />;

            case "date":
                return <LocalizationProvider dateAdapter={DateAdapter}>
                    <DatePicker
                        label=""
                        value={newFilter.propertyValue}
                        onChange={(newValue: any) => {
                            setNewFiler((prev) => ({ ...prev, propertyValue: newValue, propertyOperatorType: propType }));
                        }}
                        renderInput={(params: any) => <TextField variant="standard" {...params} />}
                    />
                </LocalizationProvider>;
            default:
                return <></>;
            }
        } else {
            return <></>;
        }
    };

    const addNewFilterItem = (ev: any, newFilter: any) => {
        const newFilters = config.filter!.filters!;
        newFilters.push(newFilter);
        onChange({ filter: { ...config.filter, filters: [...newFilters] } });
        handleAddFilterClose(ev);
    };

    const removeFilter = (idx: number) => {
        const newFilters = config.filter!.filters!;
        newFilters.splice(idx, 1);
        onChange({ filter: { ...config.filter, filters: [...newFilters] } });
    };

    const renderFilterTypeIcon = (type: string) => {
        switch (type) {
        case "string":
            return <ShortTextRoundedIcon sx={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

        case "enum":
            return <AiOutlineNumber style={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

        case "number":
            return <AiOutlineNumber style={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

        case "date":
            return <BsCalendar3 style={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

        default:
            return <></>;
        }
    };

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

                    <Grid container spacing={2} justifyContent="flex-end">
                        <Grid item xs="auto">
                            {
                                withRefresh !== undefined && (
                                    <IconButton onClick={() => { withRefresh(); }} style={{ backgroundColor: theme.palette.primary.light }}>
                                        <RefreshIcon style={{ color: theme.palette.primary.main }} />
                                    </IconButton>
                                )
                            }
                        </Grid>

                        <Grid item xs="auto" container alignItems={"center"} spacing={2}>
                            {
                                config.pagination.enabled && (
                                    <Grid item>
                                        <ColoredButton customtextcolor={theme.palette.text.primary} customcolor={invertContrast ? theme.palette.background.lightContrast : theme.palette.gray.light}
                                            size="small" variant="contained" disableFocusRipple disableRipple endIcon={itemsPerPageEl ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            onClick={handleItemsPerPageElClick}>{config.pagination.selectedItemsPerPage!} Items per Page</ColoredButton>
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
                                                        onChange({ pagination: { ...config.pagination, selectedItemsPerPage: option, selectedPage: 0 } });
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
                                    <Grid item xs="auto">
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
                                config.filter.enabled && (
                                    <Grid item>
                                        <Button startIcon={<AddIcon />} onClick={handleAddFilterClick}>Add filter</Button>
                                        <Menu
                                            style={{ marginTop: 1, borderRadius: 0 }}
                                            id="simple-menu"
                                            anchorEl={addFilerAnchorEl}
                                            open={Boolean(addFilerAnchorEl)}
                                            onClose={handleAddFilterClose}
                                        >
                                            <Grid container alignItems="flex-end" spacing={2} sx={{ padding: "10px 20px", minWidth: "700px" }}>
                                                <Grid item xs>
                                                    <FormControl variant="standard" fullWidth>
                                                        <InputLabel>Property</InputLabel>
                                                        <Select
                                                            label="Property"
                                                            value={newFilter.propertyKey}
                                                            onChange={(ev) => setNewFiler({ propertyKey: ev.target.value, propertyOperator: "", propertyValue: "", propertyOperatorType: "" })}
                                                        >
                                                            {
                                                                listConf.map((columnConfItem: ColumnConfItem) => {
                                                                    return columnConfItem.type && <MenuItem key={columnConfItem.key} value={columnConfItem.key}>{columnConfItem.title}</MenuItem>;
                                                                })
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs>
                                                    <FormControl variant="standard" fullWidth disabled={newFilter.propertyKey === ""}>
                                                        <InputLabel>Operand</InputLabel>
                                                        <Select
                                                            label="Operand"
                                                            value={newFilter.propertyOperator}
                                                            onChange={(ev) => setNewFiler((prev) => ({ ...prev, propertyOperator: ev.target.value }))}
                                                        >
                                                            {
                                                                newFilter.propertyKey !== "" && loadOptionsForPropertyKey(newFilter.propertyKey)
                                                            }
                                                        </Select>
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs>
                                                    {loadInputForPropertyKey(newFilter.propertyKey, newFilter.propertyOperator)}
                                                </Grid>
                                                <Grid item xs="auto">
                                                    <Button variant="contained" disabled={newFilter.propertyKey === "" || newFilter.propertyOperator === "" || newFilter.propertyValue === ""} onClick={(ev) => { addNewFilterItem(ev, newFilter); }}>Add</Button>
                                                </Grid>
                                            </Grid>
                                        </Menu>
                                    </Grid>
                                )
                            }
                        </Grid>
                    </Grid>

                </Box>
            </Box>

            <Box sx={{}}>
                <Grid container gap={2} sx={{ marginTop: "3px", justifyContent: "flex-end" }}>
                    <Grid item xs="auto">
                        <Typography style={{ fontWeight: 500, fontSize: 12, padding: "10px", color: theme.palette.text.primaryLight }}>{dataset.length} RESULTS</Typography>
                    </Grid>
                    <Grid item xs container justifyContent={"flex-end"} gap={2}>
                        {
                            config.filter.filters!.map((filter: any, idx: number) => {
                                if (filter.propertyKey !== "") {
                                    return (
                                        <Grid item xs="auto" key={idx} sx={{ borderRadius: "10px", border: `1px solid ${theme.palette.divider}`, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                            {renderFilterTypeIcon(filter.propertyOperatorType)}
                                            <Typography fontWeight={500} sx={{ marginRight: "10px", color: theme.palette.text.primaryLight, fontSize: "14px" }}>{listConf.filter((item) => item.dataKey === filter.propertyKey)[0].title}</Typography>
                                            <Typography fontWeight={400} sx={{ marginRight: "10px", fontSize: "12px", lineHeight: "10px" }}>{`(${filter.propertyOperator.toLowerCase()}) ${filter.propertyValue}`}</Typography>
                                            <IconButton size="small" onClick={() => { removeFilter(idx); }}>
                                                <CloseRoundedIcon sx={{ fontSize: "16px" }} />
                                            </IconButton>
                                        </Grid>
                                    );
                                }
                                return <></>;
                            })
                        }
                    </Grid>
                </Grid>
            </Box>

            {
                config.pagination.enabled && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                        <Grid container spacing={1} alignItems="center" sx={{ width: "fit-content", marginRight: "15px" }}>
                            <Grid item xs="auto">
                                <Box>{`${(config.pagination.selectedItemsPerPage! * config.pagination.selectedPage!) + 1}-${config.pagination.selectedItemsPerPage! * (config.pagination.selectedPage! + 1)} of ${numberToHumanReadableString(totalDataItems, ".")}`}</Box>
                            </Grid>
                            <Grid item xs="auto">
                                <IconButton size="small" disabled={config.pagination.selectedPage! === 0} onClick={() => { onChange({ pagination: { ...config.pagination, selectedPage: config.pagination.selectedPage! - 1 } }); }}>
                                    <ArrowBackIosIcon sx={{ fontSize: "15px" }} />
                                </IconButton>
                            </Grid>
                            <Grid item xs="auto">
                                <IconButton size="small" disabled={(config.pagination.selectedPage! + 1) * config.pagination.selectedItemsPerPage! >= totalDataItems} onClick={() => { onChange({ pagination: { ...config.pagination, selectedPage: config.pagination.selectedPage! + 1 } }); }}>
                                    <ArrowForwardIosIcon sx={{ fontSize: "15px" }} />
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Box>
                )
            }

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
                                                    {...config.sort.enabled && { sort: { enabled: true, mode: config.sort.selectedMode, prop: config.sort.selectedField }, onSortChange: (mode: "asc" | "desc", prop: string) => { onChange({ sort: { ...config.sort, selectedField: prop, selectedMode: mode } }); } }} {...tableProps} />
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
