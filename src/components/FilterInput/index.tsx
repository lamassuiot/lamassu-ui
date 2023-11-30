import React, { useState } from "react";
import { Box, Button, Grid, IconButton, Menu, MenuItem, Theme, Typography, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import "moment/locale/es";

import { TextField } from "components/LamassuComponents/dui/TextField";
import { Select } from "components/LamassuComponents/dui/Select";
import { AiOutlineNumber } from "react-icons/ai";
import ShortTextRoundedIcon from "@mui/icons-material/ShortTextRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { BsCalendar3 } from "react-icons/bs";
import moment from "moment";

export type Operator = {
    label: string
    filterValue: string
}

export const Operands = (fieldType: FieldType): Operator[] => {
    switch (fieldType) {
    case FieldType.String:
        return [
            { label: "Equal", filterValue: "equal" },
            { label: "Not Equal", filterValue: "notequal" },
            { label: "Contains", filterValue: "contains" },
            { label: "Not Contains", filterValue: "notcontains" }
        ];
    case FieldType.StringArray:
        return [
            { label: "Contains", filterValue: "contains" }
        ];
    case FieldType.Date:
        return [
            { label: "Before", filterValue: "before" },
            { label: "After", filterValue: "after" },
            { label: "Equal", filterValue: "equal" }
        ];
    case FieldType.Enum:
        return [
            { label: "Equal", filterValue: "equal" },
            { label: "Not Equal", filterValue: "notequal" }
        ];
    case FieldType.Number:
        return [
            { label: "Equal", filterValue: "equal" },
            { label: "Not Equal", filterValue: "notequal" },
            { label: "Less Than", filterValue: "lessthan" },
            { label: "Less or Equal Than", filterValue: "lessequal" },
            { label: "Greater Than", filterValue: "greaterthan" },
            { label: "Greater or Equal Than", filterValue: "greaterequal" }
        ];

    default:
        return [];
    }
};

export enum FieldType {
    Number = "number",
    Date = "date",
    Enum = "enum",
    String = "string",
    StringArray = "string_array"
};

export type Field = {
    label: string
    key: string
    type: FieldType,
    fieldOptions?: any
}

type Props = {
    filters: Filter[]
    fields: Field[]
    onChange: (filters: Filter[]) => void
    modal?: boolean
    externalRender?: boolean
}

const emptyFilter = {
    propertyField: { key: "", label: "", type: FieldType.String, fieldOptions: undefined },
    propertyOperator: "",
    propertyValue: ""
};

const renderFilterTypeIcon = (type: FieldType, theme: Theme) => {
    switch (type) {
    case FieldType.String:
        return <ShortTextRoundedIcon sx={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

    case FieldType.StringArray:
        return <ShortTextRoundedIcon sx={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

    case FieldType.Enum:
        return <AiOutlineNumber style={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

    case FieldType.Number:
        return <AiOutlineNumber style={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

    case FieldType.Date:
        return <BsCalendar3 style={{ marginRight: "10px", color: theme.palette.text.primaryLight }} />;

    default:
        return <></>;
    }
};

type FilterRendererProps ={
    filters: Filter[]
    onChange: (filters: Filter[]) => void
}

export const FilterRenderer: React.FC<FilterRendererProps> = ({ filters, onChange }) => {
    const theme = useTheme();
    return (
        <Grid item xs={12} container spacing={1}>
            {
                    filters!.map((filter, idx) => {
                        if (filter.propertyField.key !== "") {
                            return (
                                <Grid item xs="auto" key={idx} sx={{ borderRadius: "10px", border: `1px solid ${theme.palette.divider}`, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center" }}>
                                    {renderFilterTypeIcon(filter.propertyField.type, theme)}
                                    <Typography fontWeight={500} sx={{ marginRight: "10px", color: theme.palette.text.primaryLight, fontSize: "14px" }}>{filter.propertyField.label}</Typography>
                                    <Typography fontWeight={400} sx={{ marginRight: "10px", fontSize: "12px", lineHeight: "10px" }}>{`(${filter.propertyOperator.toLowerCase()}) ${filter.propertyValue}`}</Typography>
                                    <IconButton size="small" onClick={() => {
                                        const newF = filters;
                                        newF.splice(idx, 1); console.log(newF);
                                        onChange([...newF]);
                                    }}>
                                        <CloseRoundedIcon sx={{ fontSize: "16px" }} />
                                    </IconButton>
                                </Grid>
                            );
                        }
                        return <></>;
                    })
            }
        </Grid>
    );
};

export type Filter = {
    propertyField: Field,
    propertyOperator: string,
    propertyValue: string
}
export const Filters: React.FC<Props> = ({ externalRender = false, fields, filters, onChange, modal = true }) => {
    const [newFilter, setNewFiler] = useState<Filter>(
        emptyFilter
    );
    const theme = useTheme();

    const [showFilterBar, setShowFilterBar] = useState(false);
    const [addFilerAnchorEl, setAddFilerAnchorEl] = useState(null);

    const handleAddFilterClick = (event: any) => {
        if (addFilerAnchorEl !== event.currentTarget) {
            setAddFilerAnchorEl(event.currentTarget);
        }
        setShowFilterBar(true);
    };
    const handleAddFilterClose = (event: any) => {
        setNewFiler(emptyFilter);
        setAddFilerAnchorEl(null);
        setShowFilterBar(false);
    };

    const loadOptionsForFieldType = (fieldType: FieldType) => {
        return Operands(fieldType).map((operand) => {
            return <MenuItem key={operand.filterValue} value={operand.filterValue}>{operand.label}</MenuItem>;
        });
    };

    const addNewFilterItem = (ev: any, newFilter: Filter) => {
        onChange([...filters, newFilter]);
        handleAddFilterClose(ev);
    };

    const removeFilter = (idx: number) => {
        const newFilters = filters;
        newFilters.splice(idx, 1);
        onChange([...newFilters]);
    };

    const loadInputForPropertyKey = (field: Field) => {
        switch (field.type) {
        case FieldType.String:
        case FieldType.StringArray:
            return <TextField label="" value={newFilter.propertyValue} onChange={(ev) => setNewFiler((prev) => ({ ...prev, propertyValue: ev.target.value, propertyOperatorType: field.type }))} />;
        case FieldType.Enum: {
            let options: any[] = [];
            if (field.fieldOptions && Array.isArray(field.fieldOptions)) {
                options = field.fieldOptions;
            }
            options.forEach((opt: any) => {
                // const opt = ObjectByString(dataItem, prop.dataKey!);

                if (!options.includes(opt)) {
                    options.push(opt);
                }
            });
            return (
                <Select
                    label="Property"
                    disabled={newFilter.propertyField.key === ""}
                    value={newFilter.propertyValue}
                    onChange={(ev: any) => { setNewFiler((prev) => ({ ...prev, propertyOperatorType: field.type, propertyValue: ev.target.value })); }}
                >
                    {
                        options.map((option: any, idx: number) => {
                            return <MenuItem key={idx} value={option}>{option}</MenuItem>;
                        })
                    }
                </Select>
            );
        }
        case FieldType.Number:
            return <TextField label="" value={newFilter.propertyValue} onChange={(ev) => setNewFiler((prev) => ({ ...prev, propertyValue: ev.target.value, propertyOperatorType: field.type }))} type="number" />;

        case FieldType.Date:
            return <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="es">
                <DatePicker
                    label=""
                    value={moment(newFilter.propertyValue)}
                    onChange={(newValue: any) => {
                        setNewFiler((prev) => ({ ...prev, propertyValue: moment(newValue).toISOString(), propertyOperatorType: field.type }));
                    }}
                />
            </LocalizationProvider>;
        default:
            return <></>;
        }
    };

    const Selector = (
        <Grid container alignItems="flex-end" spacing={2} sx={{ padding: "10px 0px" }}>
            <Grid item xs>
                <Select
                    label="Property"
                    value={newFilter.propertyField.key}
                    onChange={(ev) => setNewFiler({ propertyField: fields.find(field => field.key === ev.target.value)!, propertyOperator: "", propertyValue: "" })}
                >
                    {
                        fields.map((field) => {
                            return field.type && <MenuItem key={field.key} value={field.key}>{field.label}</MenuItem>;
                        })
                    }
                </Select>
            </Grid>
            <Grid item xs>
                <Select
                    label="Operand"
                    value={newFilter.propertyOperator}
                    onChange={(ev: any) => setNewFiler((prev) => ({ ...prev, propertyOperator: ev.target.value }))}
                >
                    {
                        newFilter.propertyField.key !== "" && loadOptionsForFieldType(newFilter.propertyField.type)
                    }
                </Select>
            </Grid>
            <Grid item xs>
                {loadInputForPropertyKey(newFilter.propertyField)}
            </Grid>
            <Grid item xs="auto">
                <Button variant="contained" disabled={newFilter.propertyField.key === "" || newFilter.propertyOperator === "" || newFilter.propertyValue === ""} onClick={(ev) => { addNewFilterItem(ev, newFilter); }}>Add</Button>
            </Grid>
        </Grid>
    );

    return (
        <Grid container>
            <Grid item xs={12} container spacing={1}>
                <Button startIcon={<AddIcon />} onClick={handleAddFilterClick}>Add filter</Button>
            </Grid>

            {
                modal
                    ? (
                        <Menu
                            style={{ marginTop: 1, borderRadius: 0 }}
                            id="simple-menu"
                            anchorEl={addFilerAnchorEl}
                            open={showFilterBar}
                            onClose={handleAddFilterClose}
                        >
                            <Box sx={{ padding: "10px", minWidth: "700px" }}>
                                {Selector}
                            </Box>

                        </Menu>
                    )
                    : (
                        <>
                            {
                                showFilterBar && (
                                    Selector
                                )
                            }
                        </>
                    )
            }
            {
                !externalRender && (
                    <FilterRenderer filters={filters} onChange={(newFilers) => onChange([...newFilers])}/>
                )
            }
        </Grid>
    );
};
