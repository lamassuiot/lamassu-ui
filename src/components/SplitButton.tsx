import * as React from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";

export interface Option {
    label: string
    onClick: Function
    disabled?: boolean
    color?: string
}
interface Props {
    options: Array<Option>;
}

const SplitButton: React.FC<Props> = ({ options }) => {
    const [internalOpts, setInternalOpts] = React.useState(options);
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    React.useEffect(() => {
        setInternalOpts(options);
        setSelectedIndex(0);
    }, [options]);

    const handleClick = () => {
        internalOpts[selectedIndex].onClick();
    };

    const handleMenuItemClick = (
        event: React.MouseEvent<HTMLLIElement, MouseEvent>,
        index: number
    ) => {
        setSelectedIndex(index);
        setOpen(false);
    };

    const handleToggle = () => {
        setOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            anchorRef.current &&
            anchorRef.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <ButtonGroup variant="contained" ref={anchorRef} aria-label="split button" size="small">
                <Button
                    onClick={handleClick}
                    disabled={internalOpts[selectedIndex].disabled}
                    sx={{ backgroundColor: internalOpts[selectedIndex].color }}
                >
                    {internalOpts[selectedIndex].label}
                </Button>
                <Button
                    size="small"
                    aria-controls={open ? "split-button-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                    sx={{ backgroundColor: "#aaa" }}

                >
                    <ArrowDropDownIcon />
                </Button>
            </ButtonGroup>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                transition
                disablePortal
                style={{ zIndex: 1000 }}
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === "bottom" ? "center top" : "center bottom"
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {internalOpts.map((option: Option, index: number) => (
                                        <MenuItem
                                            disabled={option.disabled}
                                            key={option.label}
                                            selected={index === selectedIndex}
                                            onClick={(event) => handleMenuItemClick(event, index)}
                                        >
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper>
        </React.Fragment>
    );
};

export default SplitButton;
