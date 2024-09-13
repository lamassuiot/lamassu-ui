import * as AI from "react-icons/ai";
import * as BI from "react-icons/bi";
import * as BS from "react-icons/bs";
import * as CG from "react-icons/cg";
import * as FA6 from "react-icons/fa6";
import * as GO from "react-icons/go";
import * as MD from "react-icons/md";
import * as TB from "react-icons/tb";
import { Box, Button, Dialog, DialogContent, Paper, Typography, useTheme } from "@mui/material";
import { ColorPicker } from "./ColorPicker";
import { TimedTextField } from "./TimedTextField";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";

export interface Icon {
    name: string,
    fg: string
    bg: string
}

const iconPool = {
    ...MD,
    ...CG,
    ...GO,
    ...BI,
    ...AI,
    ...BS,
    ...FA6,
    ...TB
};

const allowedIcons = [
    "MdDeviceThermostat",
    "MdOutlineElectricScooter",
    "MdOutlineElectricRickshaw",
    "MdOutlineElectricalServices",
    "MdOutlineElectricMeter",
    "MdOutlineElectricBike",
    "MdOutlineTrain",
    "CgDatabase",
    "CgModem",
    "CgSmartHomeBoiler",
    "CgSmartHomeCooker",
    "CgSmartHomeHeat",
    "CgSmartHomeLight",
    "CgSmartHomeRefrigerator",
    "CgSmartHomeWashMachine",
    "CgSmartphone",
    "CgSmartphoneChip",
    "CgSmartphoneRam",
    "CgSmartphoneShake",
    "CgBatteryFull",
    "GoRadioTower",
    "BiSolidCreditCardFront",
    "BsSdCard",
    "IoMdCar",
    "AiOutlineIdcard",
    "GiElectric",
    "BsHouse",
    "BsHouseGear",
    "TbCrane",
    "MdOutlineElevator"
];

const icons = Object.entries(iconPool).filter(entry => allowedIcons.includes(entry[0]));

interface IconInputProps {
    label: string,
    value?: Icon,
    onChange?: (newIcon: Icon) => void
    readonly?: boolean
    size?: number
    iconSize?: number
}

const IconInput: React.FC<IconInputProps> = ({ label, size = 45, iconSize = size - 15, readonly = false, value = { bg: "#25eee2", fg: "#333333", name: "CgSmartphoneChip" }, onChange }) => {
    const theme = useTheme();
    const [icon, setIcon] = useState<Icon>(value);
    const [open, setOpen] = useState(false);
    const [filteredIcons, setFilteredIcons] = useState<string[]>([]);

    const [filter, setFilter] = useState("");
    const [fg, setFg] = useState(value.fg);
    const [bg, setBg] = useState(value.bg);

    const resetModal = () => {
        setFilter("");
    };

    useEffect(() => {
        if (filter !== "") {
            const filterLower = filter.toLocaleLowerCase();
            const entries = icons.filter(iconEntry => {
                return iconEntry[0].toLocaleLowerCase().includes(filterLower);
            });
            setFilteredIcons(entries.map(entry => { return entry[0]; }));
        } else {
            setFilteredIcons(icons.map(entry => { return entry[0]; }));
        }
    }, [filter]);

    useEffect(() => {
        if (onChange && icon) {
            onChange(icon);
        }
    }, [icon]);

    useEffect(() => {
        if (fg !== value.fg) setFg(value.fg);
        if (bg !== value.bg) setBg(value.bg);
        if (icon.name !== value.name) setIcon(value);
    }, [value]);

    let iconRender = <></>;
    if (icon !== undefined && icon.name !== "") {
        const iconFromList = icons.find(i => i[0] === icon.name);
        if (iconFromList !== undefined && iconFromList.length === 2) {
            iconRender = iconFromList[1]({ fontSize: iconSize, color: icon.fg });
        }
    }
    return (
        <>
            <Grid container flexDirection={"column"}>
                <Grid xs={12} sx={{ marginBottom: "5px" }}>
                    <Typography>{label}</Typography>
                </Grid>
                <Grid container spacing={2}>
                    {
                        icon !== undefined
                            ? (
                                <Grid>
                                    <Box onClick={() => {
                                        if (!readonly) {
                                            setOpen(true);
                                        }
                                    }} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, background: icon.bg, cursor: !readonly ? "pointer" : "inherit", borderRadius: "8px" }} component={Paper}>
                                        {
                                            iconRender
                                        }
                                    </Box>
                                </Grid>
                            )
                            : (
                                <Grid>
                                    <Button onClick={() => setOpen(true)}>Select Icon</Button>
                                </Grid>
                            )
                    }
                </Grid>
            </Grid>
            {
                open && (
                    <Dialog open={open} onClose={() => { setOpen(false); resetModal(); }} maxWidth={"sm"}>
                        <DialogContent>
                            <Grid container direction={"column"} spacing={2}>
                                <Grid container spacing={2}>
                                    <Grid xs>
                                        <TimedTextField queryPlaceholder="Icon Name" onChange={(newVal: React.SetStateAction<string>) => {
                                            setFilter(newVal);
                                        }} />
                                    </Grid>
                                    <Grid xs="auto">
                                        <ColorPicker label="Background Color" color={bg} onChange={function (newColor: string) { setBg(newColor); }} />
                                    </Grid>
                                    <Grid xs="auto">
                                        <ColorPicker label="Icon Color" color={fg} onChange={function (newColor: string) { setFg(newColor); }} />
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2}>
                                    {
                                        filteredIcons.map((val, idx) => {
                                            const icon = icons.find(i => i[0] === val);
                                            return (
                                                <Grid key={idx} xs="auto">
                                                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "55px", height: "55px", background: bg, cursor: "pointer" }} component={Paper} onClick={() => {
                                                        setIcon({
                                                            bg,
                                                            fg,
                                                            name: val
                                                        });
                                                        setOpen(false);
                                                        resetModal();
                                                    }}>
                                                        {
                                                            icon
                                                                ? icon[1]({ fontSize: "30px", color: fg })
                                                                : (
                                                                    <>NF</>
                                                                )
                                                        }
                                                    </Box>
                                                    {/* <pre>{val.name}</pre> */}
                                                </Grid>
                                            );
                                        })
                                    }
                                </Grid>
                            </Grid>
                        </DialogContent>
                    </Dialog>
                )
            }
        </>
    );
};

export { IconInput }; export type { IconInputProps };
