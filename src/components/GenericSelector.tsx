// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { Autocomplete, LinearProgress, Popper, TextField, styled, useTheme } from "@mui/material";
import { KeyValueLabel } from "./KeyValue";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import deepEqual from "fast-deep-equal/es6";

const StyledPopper = styled(Popper)(({ theme }) => ({
    zIndex: "9999999!important"
}));

interface WrapperProps<T> {
    fetcher: (query: string, controller: AbortController) => Promise<T[]>
    optionLabel: (item: T) => string
    renderOption?: (otherProps: React.HTMLAttributes<HTMLLIElement>, item: T, selected: boolean) => React.ReactNode
    optionID: (item: T) => string
    label: string
    multiple: boolean
    onSelect: (item: T | T[] | undefined) => void
    value?: T | T[] | undefined
}

type GenericSelectorProps<T> = React.PropsWithChildren<WrapperProps<T>>;

export const GenericSelector = <T extends any>(props: GenericSelectorProps<T>) => {
    const [inputValue, setInputValue] = React.useState("");
    const [fastTypeQuery, setFastTypeQuery] = React.useState(inputValue);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setInputValue(fastTypeQuery);
        }, 1000);

        return () => clearTimeout(timer);
    }, [fastTypeQuery]);

    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<readonly T[]>([]);

    const [selectedOptions, setSelectedOptions] = React.useState<T[]>((props.value && Array.isArray(props.value)) ? props.value : []);
    const [selectedOption, setSelectedOption] = React.useState<T | undefined>();

    const theme = useTheme();

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
        } else {
            props.onSelect(selectedOption);
        }
    }, [selectedOptions, selectedOption]);

    React.useEffect(() => {
        const controller = new AbortController();
        const run = async () => {
            setLoading(true);
            try {
                const opts = await props.fetcher(inputValue, controller);
                setOptions([...opts]);
            } catch (err) {
                setOptions([]);
            }
            setLoading(false);
            return true;
        };
        run();
        return () => controller.abort();
    }, [inputValue]);

    return (
        <Grid container spacing={2}>
            <Grid xs={12}>
                <Autocomplete
                    loading={loading}
                    options={options}
                    value={props.multiple ? selectedOptions : (selectedOption === undefined ? null : selectedOption)}
                    onChange={(event: any, newValue: any) => {
                        if (props.multiple) {
                            setSelectedOptions(newValue);
                        } else {
                            setSelectedOption(newValue);
                        }
                    }}
                    onInputChange={(event, newInputValue) => {
                        setFastTypeQuery(newInputValue);
                    }}
                    disableCloseOnSelect={props.multiple}
                    disableClearable={props.multiple ? true : selectedOption !== null}
                    getOptionLabel={(option: T) => props.optionLabel(option)}
                    {...(props.renderOption !== undefined && {
                        renderOption: (otherProps, option, { selected }) => (
                            <li {...otherProps} style={{ background: selected ? "#d9d9d9" : "none" }}>
                                {props.renderOption!(otherProps, option, selected)}
                            </li>
                        )
                    })}
                    PopperComponent={StyledPopper}
                    multiple={props.multiple}
                    renderInput={(params) => (
                        <div ref={params.InputProps.ref}>
                            <KeyValueLabel label={props.label} value={
                                <>
                                    <TextField
                                        {...params}
                                        sx={{ padding: "0px 0px 5px 0px" }}
                                        inputProps={{
                                            ...params.inputProps,
                                            style: { padding: "0px 0px 5px 0px" }
                                        }}
                                        label={""}
                                        placeholder="Select one"
                                    />
                                    {
                                        loading && (
                                            <LinearProgress />
                                        )
                                    }
                                </>
                            } />
                        </div>
                    )}
                    filterOptions={(x) => x}
                    isOptionEqualToValue={(option, value) => { return props.optionID(option) === props.optionID(value); }}
                />
            </Grid>
            {
                props.value && props.renderOption !== undefined && (
                    // check if is array
                    props.value instanceof Array
                        ? (
                            props.value.map((item, index) => (
                                <Grid xs={12} key={index}>
                                    {props.renderOption!({}, item, false)}
                                </Grid>
                            ))
                        )
                        : (
                            <Grid xs={12}>
                                {props.renderOption!({}, props.value, false)}
                            </Grid>
                        )
                )
            }
        </Grid>
    );
};
