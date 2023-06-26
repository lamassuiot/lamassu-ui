import React from "react";
import { Button, ButtonProps, useTheme } from "@mui/material";
import { pSBC } from "components/utils/colors";

interface MonoChromaticButtonProps extends Omit<ButtonProps, "color"> {
    color?: string
}

const MonoChromaticButton: React.FC<MonoChromaticButtonProps> = ({ color, ...rest }) => {
    const theme = useTheme();
    let bg = "";
    if (!color || color === "") {
        color = theme.palette.primary.main;
        bg = theme.palette.primary.light;
    } else {
        bg = pSBC(0.5, color)!;
    }

    return (
        <Button sx={{
            color,
            background: bg
        }}
        {...rest}
        />
    );
};

export { MonoChromaticButton }; export type { MonoChromaticButtonProps };
