
import React, { useState, useEffect } from "react";
import { Box, Dialog, DialogContent, Grid, Paper, useTheme } from "@mui/material";
import * as MD from "react-icons/md";
import * as CG from "react-icons/cg";
import * as GO from "react-icons/go";
import { TimedTextFiled } from "./TimedTextFiled";
import { MonoChromaticButton } from "./MonoChromaticButton";
import { ColorPicker } from "./ColorPicker";
import Label from "./typographies/Label";

interface MuiIcon {
    icon: (props: any) => React.ReactNode,
    name: string
}

export interface Icon {
    icon: MuiIcon,
    fg: string
    bg: string
}

const iconPool = {
    ...MD,
    ...CG,
    ...GO
};

const allowedIcons = [
    "MdDeviceThermostat",
    "MdOutlineElectricScooter",
    "MdOutlineElectricRickshaw",
    "MdOutlineElectricalServices",
    "MdOutlineElectricMeter",
    "MdOutlineElectricBike",
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
    "GoRadioTower"
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

const IconInput: React.FC<IconInputProps> = ({ label, size = 45, iconSize = size - 15, readonly = false, value = { bg: "#25ee32", fg: "#222222", icon: { icon: CG.CgSmartphoneChip, name: "CgSmartphoneChip" } }, onChange }) => {
    const theme = useTheme();
    const [icon, setIcon] = useState<Icon | undefined>(value);
    const [open, setOpen] = useState(false);
    const [filteredIcons, setFilteredIcons] = useState<MuiIcon[]>([]);

    const [filter, setFilter] = useState("");
    const [fg, setFg] = useState("#eee");
    const [bg, setBg] = useState("#333");

    const resetModal = () => {
        setFilter("");
    };

    useEffect(() => {
        if (filter !== "") {
            const filterLower = filter.toLocaleLowerCase();
            const entries = icons.filter(iconEntry => {
                return iconEntry[0].toLocaleLowerCase().includes(filterLower);
            });
            setFilteredIcons(entries.map(entry => { return { icon: entry[1], name: entry[0] }; }));
        } else {
            setFilteredIcons(icons.map(entry => { return { icon: entry[1], name: entry[0] }; }));
        }
    }, [filter]);

    useEffect(() => {
        if (onChange && icon) {
            onChange(icon);
        }
    }, [icon]);

    return (
        <>
            <Grid container flexDirection={"column"}>
                <Grid item xs={12} sx={{ marginBottom: "5px" }}>
                    <Label>{label}</Label>
                </Grid>
                <Grid item container spacing={2}>
                    {
                        icon !== undefined
                            ? (
                                <Grid item>
                                    <Box onClick={() => {
                                        if (!readonly) {
                                            setOpen(true);
                                        }
                                    }} sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: size, height: size, background: icon.bg, cursor: !readonly ? "pointer" : "inherit", borderRadius: "8px" }} component={Paper}>
                                        {
                                            icon.icon.icon({ fontSize: iconSize, color: icon.fg })
                                        }
                                    </Box>
                                </Grid>
                            )
                            : (
                                <Grid item>
                                    <MonoChromaticButton onClick={() => setOpen(true)}>Select Icon</MonoChromaticButton>
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
                                <Grid item container spacing={2}>
                                    <Grid item xs>
                                        <TimedTextFiled label="Icon Name" onChange={(newVal) => {
                                            setFilter(newVal);
                                        }} />
                                    </Grid>
                                    <Grid item xs="auto">
                                        <ColorPicker label="Background Color" color={bg} onChange={function (newColor: string) { setBg(newColor); }} />
                                    </Grid>
                                    <Grid item xs="auto">
                                        <ColorPicker label="Icon Color" color={fg} onChange={function (newColor: string) { setFg(newColor); }} />
                                    </Grid>
                                </Grid>
                                <Grid item container spacing={2}>
                                    {
                                        filteredIcons.map((val, idx) => (
                                            <Grid key={idx} item xs="auto">
                                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: "55px", height: "55px", background: bg, cursor: "pointer" }} component={Paper} onClick={() => {
                                                    setIcon({
                                                        bg,
                                                        fg,
                                                        icon: val
                                                    });
                                                    setOpen(false);
                                                    resetModal();
                                                }}>
                                                    {
                                                        val.icon({ fontSize: "30px", color: fg })
                                                    }
                                                </Box>
                                                {/* <pre>{val.name}</pre> */}
                                            </Grid>
                                        ))
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
