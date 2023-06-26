
import React, { useState } from "react";
import { Grid, Menu } from "@mui/material";
import { Box } from "@mui/system";
import { BlockPicker } from "react-color";
import Label from "./typographies/Label";

interface ColorPickerProps {
    color: string,
    onChange: (newColor: string) => void,
    label?: string
}

const colorList = ["#D9E3F0", "#F47373", "#697689", "#37D67A", "#25ee32", "#2CCCE4", "#0068D1", "#333333", "#dce775", "#ff8a65", "#ba68c8"];

const ColorPicker: React.FC<ColorPickerProps> = (props) => {
    const [anchorElColorPicker, setAnchorElColorPicker] = useState(null);

    const handleClickColorPicker = (event: any) => {
        if (anchorElColorPicker !== event.currentTarget) {
            setAnchorElColorPicker(event.currentTarget);
        }
    };

    const handleCloseColorPicker = (event: any) => {
        setAnchorElColorPicker(null);
    };

    const colorInput = (
        <>
            <Box onClick={ev => handleClickColorPicker(ev)} sx={{ width: 100, height: "38px", borderRadius: "5px", cursor: "pointer", background: props.color }} />
            <Menu
                sx={{ marginTop: 1, width: "770px", borderRadius: 0 }}
                MenuListProps={{ style: { padding: 0 } }}
                id="simple-menu"
                anchorEl={anchorElColorPicker}
                open={Boolean(anchorElColorPicker)}
                onClose={handleCloseColorPicker}
            >
                <BlockPicker triangle="hide" color={props.color} onChange={(newColor: any) => { props.onChange(newColor.hex); }} colors={colorList} />
            </Menu>
        </>
    );

    if (props.label) {
        return (
            <Grid container flexDirection={"column"}>
                <Grid item sx={{ marginBottom: "5px" }}>
                    <Label>{props.label}</Label>
                </Grid>
                <Grid item>
                    {colorInput}
                </Grid>
            </Grid>

        );
    }

    return colorInput;
};

export { ColorPicker }; export type { ColorPickerProps };
