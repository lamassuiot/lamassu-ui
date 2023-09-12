import { Autocomplete, AutocompleteCloseReason, Box, ClickAwayListener, Grid, Paper, Popper, TextField, autocompleteClasses, styled, useTheme } from "@mui/material";
import React from "react";
import { MatchSorterOptions, matchSorter } from "match-sorter";
import { KeyValueLabel } from "../dui/KeyValueLabel";
import { MonoChromaticButton } from "../dui/MonoChromaticButton";
import deepEqual from "fast-deep-equal/es6";

interface WrapperProps<T> {
    fetcher: () => Promise<T[]>
    optionRenderer: (item: T) => React.ReactElement
    optionID: (item: T) => string
    label: string
    selectLabel: string
    filterKeys?: string[]
    multiple: boolean
    onSelect: (cert: T | T[]) => void
    value?: T | T[]
}

type GenericSelectorProps<T> = React.PropsWithChildren<WrapperProps<T>>;

export const GenericSelector = <T extends object>(props: GenericSelectorProps<T>) => {
    let filterOpts: MatchSorterOptions<T>;
    if (props.filterKeys) {
        filterOpts = { keys: props.filterKeys };
    }

    const [inputValue, setInputValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<readonly T[]>([]);

    const [selectedOptions, setSelectedOptions] = React.useState<T[]>((props.value && Array.isArray(props.value)) ? props.value : []);
    const [selectedOption, setSelectedOption] = React.useState<T>();

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const theme = useTheme();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        if (anchorEl) {
            anchorEl.focus();
        }
        setAnchorEl(null);
    };

    React.useEffect(() => {
        if (props.value !== undefined) {
            if (props.multiple && Array.isArray(props.value)) {
                setSelectedOptions(props.value);
            } else if (!Array.isArray(props.value) && !deepEqual(props.value, selectedOption)) {
                setSelectedOption(props.value);
            }
        }
    }, [props.value]);

    React.useEffect(() => {
        if (props.multiple) {
            props.onSelect(selectedOptions);
        } else if (selectedOption) {
            props.onSelect(selectedOption);
        }
    }, [selectedOptions, selectedOption]);

    React.useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const opts = await props.fetcher();
                setOptions([...opts]);
            } catch (err) {
                setOptions([]);
            }
            setLoading(false);
            return true;
        };
        run();
    }, [inputValue]);

    const open = Boolean(anchorEl);

    return (
        <KeyValueLabel
            label={props.label}
            value={
                <>
                    <Grid container flexDirection={"column"} spacing={2} sx={{ width: "500px" }}>
                        <Grid item>
                            {
                                props.multiple
                                    ? (
                                        <MonoChromaticButton onClick={handleClick}>{props.selectLabel}</MonoChromaticButton>
                                    )
                                    : (
                                        selectedOption
                                            ? (
                                                <Box component={Paper} sx={{ cursor: "pointer", padding: "5px" }} onClick={handleClick}>
                                                    {props.optionRenderer(selectedOption)}
                                                </Box>
                                            )
                                            : (
                                                <MonoChromaticButton onClick={handleClick}>{props.selectLabel}</MonoChromaticButton>
                                            )
                                    )
                            }
                        </Grid>
                        <Grid item container flexDirection={"column"} spacing={2}>
                            {
                                selectedOptions.map((item, idx) => (
                                    <Grid item key={idx}>
                                        {props.optionRenderer(item)}
                                    </Grid>
                                ))
                            }
                        </Grid>
                    </Grid>
                    <StyledPopper open={open} anchorEl={anchorEl} placement="bottom-start">
                        <ClickAwayListener onClickAway={handleClose}>
                            <div>
                                <Box
                                    sx={{
                                        borderBottom: `1px solid ${theme.palette.mode === "light" ? "#eaecef" : "#30363d"}`,
                                        padding: "8px 10px",
                                        fontWeight: 600
                                    }}
                                >
                                    {props.selectLabel}
                                </Box>
                                <Autocomplete
                                    loading={loading}
                                    options={options}
                                    open={open}
                                    value={props.multiple ? selectedOptions : selectedOption}
                                    onChange={(event: any, newValue: any) => {
                                        if (props.multiple) {
                                            setSelectedOptions(newValue);
                                        } else {
                                            setSelectedOption(newValue);
                                            if (newValue) {
                                                handleClose();
                                            }
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        setInputValue(newInputValue);
                                    }}
                                    PopperComponent={PopperComponent}
                                    disableCloseOnSelect={!props.multiple}
                                    onClose={(
                                        event: React.ChangeEvent<{}>,
                                        reason: AutocompleteCloseReason
                                    ) => {
                                        if (reason === "escape") {
                                            handleClose();
                                        }
                                    }}
                                    getOptionLabel={(option: T) => props.optionID(option)}
                                    renderTags={() => null}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            inputProps={{ ...params.inputProps, style: { padding: "0px" } }}
                                            InputProps={{ ...params.InputProps, style: { padding: "10px" } }}
                                        />
                                    )}
                                    multiple={props.multiple}
                                    renderOption={(lProps, option, { selected }) => (
                                        <li {...lProps} style={{ background: selected ? "#d9d9d9" : "none" }}>
                                            {props.optionRenderer(option)}
                                        </li>
                                    )}
                                    isOptionEqualToValue={(option, value) => { return props.optionID(option) === props.optionID(value); }}
                                    filterOptions={(options, { inputValue }) => matchSorter(options, inputValue, filterOpts)}
                                />
                            </div>
                        </ClickAwayListener>
                    </StyledPopper>
                </>
            }
        />
    );
};

interface PopperComponentProps {
    anchorEl?: any;
    disablePortal?: boolean;
    open: boolean;
}

const StyledPopper = styled(Popper)(({ theme }) => ({
    border: `1px solid ${theme.palette.mode === "light" ? "#e1e4e8" : "#30363d"}`,
    boxShadow: `0 8px 24px ${theme.palette.mode === "light" ? "rgba(149, 157, 165, 0.2)" : "rgb(1, 4, 9)"
    }`,
    borderRadius: 6,
    width: 500,
    zIndex: theme.zIndex.modal,
    fontSize: 13,
    color: theme.palette.mode === "light" ? "#24292e" : "#c9d1d9",
    backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1c2128"
}));
const StyledAutocompletePopper = styled("div")(({ theme }) => ({
    [`& .${autocompleteClasses.paper}`]: {
        boxShadow: "none",
        margin: 0,
        color: "inherit",
        fontSize: 13
    },
    [`& .${autocompleteClasses.listbox}`]: {
        backgroundColor: theme.palette.mode === "light" ? "#fff" : "#1c2128",
        padding: 0,
        [`& .${autocompleteClasses.option}`]: {
            minHeight: "auto",
            alignItems: "flex-start",
            padding: 8,
            borderBottom: `1px solid  ${theme.palette.mode === "light" ? " #eaecef" : "#30363d"
            }`,
            "&[aria-selected=\"true\"]": {
                backgroundColor: "transparent"
            },
            [`&.${autocompleteClasses.focused}, &.${autocompleteClasses.focused}[aria-selected="true"]`]:
            {
                backgroundColor: theme.palette.action.hover
            }
        }
    },
    [`&.${autocompleteClasses.popperDisablePortal}`]: {
        position: "relative"
    }
}));

function PopperComponent (props: PopperComponentProps) {
    const { disablePortal, anchorEl, open, ...other } = props;
    return <StyledAutocompletePopper {...other} />;
}
