import { Alert, Box, LinearProgress, styled } from "@mui/material";
import { DataGrid, GridColDef, GridDensity, GridFilterItem, GridFilterModel, GridPaginationMeta, GridPaginationModel, GridRowId, GridSlots, GridSortItem, GridSortModel, GridValidRowModel, getGridDateOperators, getGridStringOperators } from "@mui/x-data-grid";

import { ListRequest, ListResponse, errorToString } from "../ducks/services/api-client";
import React, { ReactElement, Ref, useEffect, useImperativeHandle, useState } from "react";
import moment from "moment";

declare module "@mui/x-data-grid" {
    interface NoRowsOverlayPropsOverrides {
        errorMsg?: string;
    }
}

interface WrapperComponentProps<T extends GridValidRowModel> {
    fetcher: (queryParams: ListRequest, controller: AbortController) => Promise<ListResponse<T>>,
    id: (item: T) => string
    columns: GridColDef<T>[]
    errorPrefix?: string
    disableControllers?: boolean
    density?: GridDensity
    sortField?: GridSortItem
    sortMode?: "server" | "client"
    pageSize?: number,
    filter?: GridFilterItem,
    onRowClick?: (row: T) => void
}

export type FetchHandle = {
    refresh: () => void,
}

const PAGE_SIZE = 10;

type ComponentProps<T extends GridValidRowModel> = React.PropsWithChildren<WrapperComponentProps<T>>;
const Fetcher = <T extends GridValidRowModel>(props: ComponentProps<T>, ref: Ref<FetchHandle>) => {
    const [sortMode, setSortMode] = useState<"server" | "client">(props.sortMode || "server");
    const [data, setData] = React.useState<ListResponse<T> | undefined>(undefined);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<any | undefined>(undefined);

    const [sortModel, setSortModel] = useState<GridSortModel>([
        props.sortField || { field: "id", sort: "asc" }
    ]);

    const [rowCountState, setRowCountState] = React.useState(-1);
    const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: props.filter ? [props.filter] : [] });
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: props.pageSize || PAGE_SIZE });
    const mapPageToNextCursor = React.useRef<{ [page: number]: GridRowId }>({});

    const paginationMetaRef = React.useRef<GridPaginationMeta>();
    // Memoize to avoid flickering when the `hasNextPage` is `undefined` during refetch
    const paginationMeta = React.useMemo(() => {
        if (data?.next !== undefined && paginationMetaRef.current?.hasNextPage !== (data?.next !== "")) {
            paginationMetaRef.current = { hasNextPage: data?.next !== "" };
        }
        return paginationMetaRef.current;
    }, [data?.next]);

    useEffect(() => {
        console.log("Filter changed", props.filter);
        setFilterModel({ ...filterModel, items: props.filter ? [props.filter] : [] });
    }, [props.filter]);

    useEffect(() => {
        // reset page to 0 when filter changes
        paginationMetaRef.current = {};
        mapPageToNextCursor.current = {};
        setRowCountState(-1);
        setPaginationModel({ pageSize: PAGE_SIZE, page: 0 });

        const controller = new AbortController();
        fetchData(controller);
        return () => controller.abort();
    }, [filterModel, sortModel]);

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller);
        return () => controller.abort();
    }, [paginationModel]);

    const handleSortModelChange = (newSortModel: GridSortModel) => {
        setSortModel(newSortModel);
    };

    const handleFilterModelChange = (newFilterModel: GridFilterModel) => {
        setFilterModel(newFilterModel);
    };

    const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
        // We have the cursor, we can allow the page transition.
        if (
            newPaginationModel.page === 0 ||
            mapPageToNextCursor.current[newPaginationModel.page - 1]
        ) {
            setPaginationModel(newPaginationModel);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchData(controller);
        return () => controller.abort();
    }, []);

    const fetchData = async (controller: AbortController) => {
        setError(undefined);
        setIsLoading(true);
        try {
            const filters = filterModel.items.filter(f => {
                return f.id && f.value;
            }).map(filter => {
                let propertyValue = filter.value;
                if (props.columns.find(col => col.field === filter.field)?.type === "date") {
                    propertyValue = moment(filter.value).toISOString();
                }

                const propertyKey = filter.field;
                const propertyOperator = filter.operator;
                return propertyKey + "[" + propertyOperator + "]" + propertyValue;
            });

            const bookMark = mapPageToNextCursor.current[paginationModel.page - 1] as string;
            const resp = await props.fetcher({
                pageSize: paginationModel.pageSize,
                sortMode: sortModel[0]?.sort === "desc" ? "desc" : "asc",
                sortField: sortModel[0]?.field,
                bookmark: bookMark,
                filters
            }, controller);
            setData(resp);
            mapPageToNextCursor.current[paginationModel.page] = resp.next;
        } catch (err: any) {
            setError(errorToString(err));
        }
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        refresh () {
            fetchData(new AbortController());
        }
    }));

    const stringOperators = getGridStringOperators().filter(
        (operator) => operator.value === "equals" || operator.value === "contains"
    );
    // modify equals to be equal using findIndex
    const eqSIndex = stringOperators.findIndex(operator => operator.value === "equals");
    if (eqSIndex > -1) {
        stringOperators[eqSIndex].label = "equal"; // remove 's' from 'equals' to 'equal'
        stringOperators[eqSIndex].value = "equal"; // remove 's' from 'equals' to 'equal'
    }

    const dateOperators = getGridDateOperators().filter(
        (operator) => operator.value === "is" || operator.value === "before" || operator.value === "after"
    );

    return (
        <DataGrid
            getRowId={props.id}
            rows={error ? [] : (data ? data.list : [])}
            columns={
                props.columns.map(col => {
                    if (!col.type || col.type === "string") {
                        return {
                            ...col,
                            filterOperators: stringOperators
                        };
                    } else if (col.type === "date") {
                        return {
                            ...col,
                            filterOperators: dateOperators
                        };
                    }
                    return col;
                })
            }
            loading={isLoading}
            isCellEditable={() => false}
            rowSelection={false}
            slots={{
                loadingOverlay: LinearProgress as GridSlots["loadingOverlay"],
                noRowsOverlay: error ? CustomErrorOverlay : CustomNoDataOverlay
            }}
            slotProps={{
                noRowsOverlay: {
                    errorMsg: error || undefined
                }
            }}
            {...props.onRowClick !== undefined && {
                onRowClick: (row) => {
                    props.onRowClick!(row.row as T);
                }
            }}
            autosizeOptions={{
                columns: ["status"],
                includeOutliers: false,
                includeHeaders: true
            }}
            autosizeOnMount
            paginationModel={paginationModel}
            onPaginationModelChange={handlePaginationChange}
            paginationMode="server"
            paginationMeta={paginationMeta}
            rowCount={rowCountState}
            onRowCountChange={(newRowCount) => setRowCountState(newRowCount)}
            pageSizeOptions={[PAGE_SIZE]}
            filterMode="server"
            onFilterModelChange={handleFilterModelChange}
            filterModel={filterModel}
            sortModel={sortModel}
            sortingMode={sortMode}
            density={props.density || "comfortable"}
            onSortModelChange={handleSortModelChange}
            {
                ...props.disableControllers && {
                    hideFooterSelectedRowCount: true,
                    hideFooterPagination: true,
                    hideFooter: true,
                    disableColumnMenu: true,
                    disableColumnFilter: true
                }
            }
            getRowHeight={() => "auto"}
            sx={{
                "--DataGrid-overlayHeight": "150px"
            }}
            autoHeight
        />
    );
};

export const TableFetchViewer = React.forwardRef(Fetcher) as <T extends object>(props: ComponentProps<T> & { ref?: Ref<FetchHandle> }) => ReactElement;

const StyledGridOverlay = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    "& .ant-empty-img-1": {
        fill: theme.palette.mode === "light" ? "#aeb8c2" : "#262626"
    },
    "& .ant-empty-img-2": {
        fill: theme.palette.mode === "light" ? "#f5f5f7" : "#595959"
    },
    "& .ant-empty-img-3": {
        fill: theme.palette.mode === "light" ? "#dce0e6" : "#434343"
    },
    "& .ant-empty-img-4": {
        fill: theme.palette.mode === "light" ? "#fff" : "#1c1c1c"
    },
    "& .ant-empty-img-5": {
        fillOpacity: theme.palette.mode === "light" ? "0.8" : "0.08",
        fill: theme.palette.mode === "light" ? "#f5f5f5" : "#fff"
    }
}));

export default function CustomNoDataOverlay () {
    return (
        <StyledGridOverlay>
            <svg
                width="250"
                height="200"
                viewBox="0 0 184 152"
                aria-hidden
                focusable="false"
            >
                <g fill="none" fillRule="evenodd">
                    <g transform="translate(24 31.67)">
                        <ellipse
                            className="ant-empty-img-5"
                            cx="67.797"
                            cy="106.89"
                            rx="67.797"
                            ry="12.668"
                        />
                        <path
                            className="ant-empty-img-1"
                            d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                        />
                        <path
                            className="ant-empty-img-2"
                            d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                        />
                        <path
                            className="ant-empty-img-3"
                            d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                        />
                    </g>
                    <path
                        className="ant-empty-img-3"
                        d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                    />
                    <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
                        <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                        <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                    </g>
                </g>
            </svg>
            <Box sx={{ marginY: "10px" }}>No results</Box>
        </StyledGridOverlay>
    );
}

export const CustomErrorOverlay = (props: any) => {
    return (
        <StyledGridOverlay>
            <Box sx={{ padding: "0 20px" }}>
                <Alert severity="error" sx={{ width: "100%" }}>
                    {
                        props.errorMsg || "Could not fetch"
                    }
                    {
                        typeof props.errorMsg === "string" && props.errorMsg.length > 1 && (
                            <>: {props.errorMsg}</>
                        )
                    }
                </Alert>
            </Box>
        </StyledGridOverlay>
    );
};
