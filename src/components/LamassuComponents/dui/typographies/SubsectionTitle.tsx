import React from "react";
import { Typography, TypographyProps, useTheme } from "@mui/material";

interface Props extends TypographyProps { }

const SubsectionTitle: React.FC<Props> = ({ ...rest }) => {
    const theme = useTheme();

    return (
        <Typography variant="h6" {...rest} />
    );
};

export default SubsectionTitle;
