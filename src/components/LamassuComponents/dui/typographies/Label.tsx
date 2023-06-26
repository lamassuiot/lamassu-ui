import React from "react";
import { Typography, TypographyProps, useTheme } from "@mui/material";

interface Props extends TypographyProps { }

const Label: React.FC<Props> = ({ ...rest }) => {
    const theme = useTheme();

    return (
        <Typography fontSize="0.8rem" sx={{ color: theme.palette.textField.label }} {...rest}/>
    );
};

export default Label;
