import { styled, SwitchProps as MuiSwitchProps, Switch as MuiSwitch, Grid } from "@mui/material";
import Label from "./typographies/Label";
import React from "react";

const CustomSwitch = styled((props: MuiSwitchProps) => (
    <MuiSwitch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    "& .MuiSwitch-switchBase": {
        padding: 0,
        margin: 2,
        transitionDuration: "300ms",
        "&.Mui-checked": {
            transform: "translateX(16px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
                backgroundColor: theme.palette.primary.main,
                opacity: 1,
                border: 0
            },
            "&.Mui-disabled + .MuiSwitch-track": {
                opacity: 0.5
            }
        },
        "&.Mui-focusVisible .MuiSwitch-thumb": {
            color: theme.palette.primary.main,
            border: "6px solid #fff"
        },
        "&.Mui-disabled .MuiSwitch-thumb": {
            color:
          theme.palette.mode === "light"
              ? theme.pv
              : theme.palette.grey[600]
        },
        "&.Mui-disabled + .MuiSwitch-track": {
            opacity: theme.palette.mode === "light" ? 0.7 : 0.3
        }
    },
    "& .MuiSwitch-thumb": {
        boxSizing: "border-box",
        width: 22,
        height: 22
    },
    "& .MuiSwitch-track": {
        borderRadius: 26 / 2,
        backgroundColor: theme.palette.mode === "light" ? "#E9E9EA" : "#39393D",
        opacity: 1,
        transition: theme.transitions.create(["background-color"], {
            duration: 500
        })
    }
}));

interface SwitchProps extends MuiSwitchProps {
    label: string
}

const Switch: React.FC<SwitchProps> = ({ label, value, ...rest }) => {
    return (
        <Grid container flexDirection={"column"}>
            <Grid item>
                <Label>{label}</Label>
            </Grid>
            <Grid item>
                <CustomSwitch {...rest}/>
            </Grid>
        </Grid>
    );
};

export { Switch }; export type { SwitchProps };
