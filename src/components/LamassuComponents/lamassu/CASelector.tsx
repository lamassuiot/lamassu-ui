import { getCAs } from "ducks/features/cas/apicalls";
import React from "react";
import { Autocomplete, Box, ClickAwayListener, Grid, Paper, Popper, TextField, Typography, useTheme, styled, autocompleteClasses, AutocompleteCloseReason, IconButton, Dialog, DialogTitle, DialogContent } from "@mui/material";
import { CertificateAuthority } from "ducks/features/cas/models";
import Label from "../dui/typographies/Label";
import { KeyValueLabel } from "../dui/KeyValueLabel";
import { MonoChromaticButton } from "../dui/MonoChromaticButton";
import CloseIcon from "@mui/icons-material/Close";
import CertificateDecoder from "../composed/CreateCAForm/CertificateDecoder";
import { CodeCopier } from "../dui/CodeCopier";
import moment from "moment";

interface CAInfo {
    id: string;
    name: string;
}

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

type Props = {
    label: string,
    multiple: boolean;
    onSelect: (cert: CertificateAuthority | CertificateAuthority[]) => void;
    value?: CertificateAuthority | CertificateAuthority[]
}

const CASelector: React.FC<Props> = ({ onSelect, value, multiple = false, label }) => {
    console.log(value);

    const [inputValue, setInputValue] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [options, setOptions] = React.useState<readonly CertificateAuthority[]>([]);

    const [selectedOptions, setSelectedOptions] = React.useState<CertificateAuthority[]>((value && Array.isArray(value)) ? value : []);
    const [selectedOption, setSelectedOption] = React.useState<CertificateAuthority>();

    const [displayCA, setDisplayCA] = React.useState<CertificateAuthority | undefined>(!Array.isArray(value) ? value : undefined);

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
        if (value !== undefined) {
            if (multiple && Array.isArray(value)) {
                setSelectedOptions(value);
            } else if (!Array.isArray(value)) {
                setSelectedOption(value);
            }
        }
    }, [value]);

    React.useEffect(() => {
        if (multiple) {
            onSelect(selectedOptions);
        } else if (selectedOption) {
            onSelect(selectedOption);
        }
    }, [selectedOptions, selectedOption]);

    React.useEffect(() => {
        const run = async () => {
            setLoading(true);
            try {
                const casResponse = await getCAs(20, 0, "asc", "id", []);
                console.log(casResponse);

                setOptions([...casResponse.cas]);
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
            label={label}
            value={
                <>
                    <Grid container flexDirection={"column"} spacing={2} sx={{ width: "500px" }}>
                        <Grid item>
                            {
                                multiple
                                    ? (
                                        <MonoChromaticButton onClick={handleClick}>Select CAs</MonoChromaticButton>
                                    )
                                    : (
                                        selectedOption
                                            ? (
                                                <Box component={Paper} sx={{ padding: "5px", background: theme.palette.textField.background, cursor: "pointer" }} onClick={handleClick}>
                                                    <Grid container columnGap={2} alignItems={"center"}>
                                                        <Grid item xs={"auto"} height={"40px"}>
                                                            <img src={process.env.PUBLIC_URL + "/assets/AWS-SM.png"} height={"40px"} width={"40px"} />
                                                        </Grid>
                                                        <Grid item xs container flexDirection={"column"}>
                                                            <Grid item xs>
                                                                <Typography>{selectedOption.name}</Typography>
                                                            </Grid>
                                                            <Grid item xs>
                                                                <Label>{moment.duration(moment(selectedOption.valid_to).diff(moment())).humanize(true)}</Label>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Box>
                                            )
                                            : (
                                                <MonoChromaticButton onClick={handleClick}>Select CA</MonoChromaticButton>
                                            )
                                    )
                            }
                        </Grid>
                        <Grid item container flexDirection={"column"} spacing={2}>
                            {
                                selectedOptions.map((item, idx) => (
                                    <Grid item key={idx} onClick={() => setDisplayCA(item)} sx={{ cursor: "pointer" }}>
                                        <Box component={Paper} sx={{ padding: "5px", background: theme.palette.textField.background }}>
                                            <Grid container columnGap={2} alignItems={"center"}>
                                                <Grid item xs={"auto"} height={"40px"}>
                                                    <img src={process.env.PUBLIC_URL + "/assets/AWS-SM.png"} height={"40px"} width={"40px"} />
                                                </Grid>
                                                <Grid item xs container flexDirection={"column"}>
                                                    <Grid item xs>
                                                        <Typography>{item.name}</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Label>{moment.duration(moment(item.valid_to).diff(moment())).humanize(true)}</Label>
                                                    </Grid>
                                                </Grid>
                                                <Grid item xs={"auto"}>
                                                    <IconButton size="small" onClick={(ev) => {
                                                        setOptions([...selectedOptions.splice(selectedOptions.map(val => val.name).indexOf(item.name), 1)]);
                                                        ev.stopPropagation();
                                                    }}>
                                                        <CloseIcon sx={{ fontSize: "14px" }} />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Box>
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
                                        borderBottom: `1px solid ${theme.palette.mode === "light" ? "#eaecef" : "#30363d"
                                        }`,
                                        padding: "8px 10px",
                                        fontWeight: 600
                                    }}
                                >
                                    Select Authorized CAs
                                </Box>
                                <Autocomplete
                                    loading={loading}
                                    options={options}
                                    open={open}
                                    value={multiple ? selectedOptions : selectedOption}
                                    onChange={(event: any, newValue: any) => {
                                        console.log(newValue);
                                        if (multiple) {
                                            setSelectedOptions(newValue);
                                        } else {
                                            setSelectedOption(newValue);
                                            handleClose();
                                        }
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        setInputValue(newInputValue);
                                    }}
                                    PopperComponent={PopperComponent}
                                    disableCloseOnSelect={!multiple}
                                    onClose={(
                                        event: React.ChangeEvent<{}>,
                                        reason: AutocompleteCloseReason
                                    ) => {
                                        console.log(reason);

                                        if (multiple) {
                                            if (reason === "escape") {
                                                handleClose();
                                            }
                                        } else {
                                            handleClose();
                                        }
                                    }}
                                    getOptionLabel={(option: CertificateAuthority) => option.name}
                                    renderTags={() => null}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            inputProps={{ ...params.inputProps, style: { padding: "0px" } }}
                                            InputProps={{ ...params.InputProps, style: { padding: "10px" } }}
                                        />
                                    )}
                                    multiple={multiple}
                                    renderOption={(props, option, { selected }) => (
                                        <li {...props} style={{ background: selected ? "#d9d9d9" : "none" }}>
                                            <Grid container spacing={2} >
                                                <Grid item xs={"auto"} >
                                                    <Box component={Paper} sx={{ height: "40px", width: "40px" }}>
                                                        <img src={process.env.PUBLIC_URL + "/assets/AWS-SM.png"} height={"100%"} width={"100%"} />
                                                    </Box>
                                                </Grid>
                                                <Grid item xs container flexDirection={"column"}>
                                                    <Grid item xs>
                                                        <Typography>{option.name}</Typography>
                                                    </Grid>
                                                    <Grid item xs>
                                                        <Label>{moment.duration(moment(option.valid_to).diff(moment())).humanize(true)}</Label>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </li>
                                    )}
                                />
                            </div>
                        </ClickAwayListener>
                    </StyledPopper>
                    {
                        displayCA && (
                            <Dialog open={true} onClose={() => setDisplayCA(undefined)} maxWidth={"md"}>
                                <DialogTitle>
                                    <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>{displayCA.name}</Typography>
                                </DialogTitle>
                                <DialogContent>
                                    <Grid container spacing={2} flexDirection={"column"}>
                                        <Grid item>
                                            <CodeCopier code={atob(displayCA.certificate)} />
                                        </Grid>
                                        <Grid item>
                                            <CertificateDecoder crt={atob(displayCA.certificate)} />
                                        </Grid>
                                    </Grid>
                                </DialogContent>
                            </Dialog>
                        )
                    }
                </>
            }
        />
    );
};

export default CASelector;
