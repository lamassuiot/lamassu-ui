import { Box, Grid, IconButton, InputBase, InputBaseProps, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";

interface TextFiledProps extends InputBaseProps {
    label: string,
    tooltip?: string | React.ReactNode,
    isValid?: boolean,
    validateFunc?: (val: any) => boolean,
    quickButtons?: React.ReactNode[]
}

const TextField: React.FC<TextFiledProps> = ({ label, validateFunc, quickButtons, ...rest }) => {
    const theme = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    return (
        <Grid container>
            <Grid item xs={12} sx={{ marginBottom: "5px" }}>
                <Typography fontSize="0.8rem" sx={{
                    color: isFocused ? theme.palette.primary.main : "unset",
                    display: "flex",
                    alignItems: "center"
                }}>
                    {label}{rest.required && " *"} {rest.tooltip && (
                        <Tooltip title={rest.tooltip} sx={{ }}>
                            <HelpOutlinedIcon sx={{ fontSize: "16px", marginLeft: "5px", color: "#555" }}/>
                        </Tooltip>
                    )}
                </Typography>
            </Grid>
            <Grid item
                xs={12}
                sx={{
                    background: theme.palette.textField.background,
                    padding: "5px 10px",
                    borderRadius: "4px",
                    ...(isFocused && { borderBottom: `1px solid ${theme.palette.primary.main}` })
                }}
                justifyContent={"center"}
                container
            >
                <Grid item xs>
                    <InputBase fullWidth={true} sx={{ fontSize: 14 }} {...rest} onBlur={() => { setIsFocused(false); }} onFocus={() => { setIsFocused(true); }} autoCorrect="off" />
                </Grid>
                {
                    validateFunc && (
                        <Grid item xs="auto" marginLeft={"5px"}>
                            {
                                validateFunc(rest.value)
                                    ? (
                                        <Box sx={{ background: theme.palette.success.light, width: "30px", height: "30px", borderRadius: "30px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <CheckIcon sx={{ color: theme.palette.success.main, fontSize: "0.9rem" }} />
                                        </Box>
                                    )
                                    : (
                                        <Box sx={{ background: theme.palette.error.light, width: "30px", height: "30px", borderRadius: "30px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                            <CloseIcon sx={{ color: theme.palette.error.main, fontSize: "0.9rem" }} />
                                        </Box>
                                    )
                            }
                        </Grid>
                    )
                }
                {
                    validateFunc && (
                        <Grid item xs="auto" marginLeft={"5px"} container spacing={1}>
                            {
                                quickButtons?.map((btn, idx) => {
                                    return (
                                        <Grid item key={idx}>
                                            <Box component={Paper} elevation={0} style={{ borderRadius: 8, background: "#777", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <IconButton>
                                                    <ContentCopyIcon sx={{ color: "#fff", fontSize: "0.9rem" }} />
                                                </IconButton>
                                            </Box>
                                        </Grid>
                                    );
                                })
                            }
                        </Grid>
                    )
                }
            </Grid>
        </Grid >
    );
};

export { TextField }; export type { TextFiledProps };
