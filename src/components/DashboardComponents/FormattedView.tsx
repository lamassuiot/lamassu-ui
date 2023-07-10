import Typography from "@mui/material/Typography";
import { Box, Paper, Grid, useTheme } from "@mui/material";
import React, { ReactElement } from "react";
import { TabsListItemsProps } from "components/LamassuComponents/dui/TabsList";

interface props {
    title: string | ReactElement,
    subtitle: string | ReactElement,
    tabs?: TabsListItemsProps[]
}

export const FormattedView: React.FC<props> = ({ title, subtitle, ...rest }) => {
    const theme = useTheme();
    return (
        <Box sx={{ height: "100%" }} component={Paper}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Grid item container spacing={2} flexDirection="column" flexWrap={"nowrap"} flexGrow={1} sx={{ height: "100%" }}>
                    <Grid item>
                        <Box sx={{ padding: "40px 40px 0 40px" }}>
                            <Grid container>
                                <Grid item container spacing={2} justifyContent="flex-start">
                                    <Grid item xs={12}>
                                        <Box style={{ display: "flex", alignItems: "center" }}>
                                            <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{title}</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Grid>
                                    <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>{subtitle}</Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                    <Grid item sx={{ height: "100%" }}>
                        <Box style={{ /* flexGrow: 1, */ height: "100%", display: "flex", flexDirection: "column" }}>
                            <Grid container flexDirection={"column"} sx={{ height: "50px", flexGrow: 1, overflowY: "auto", flexWrap: "nowrap" }} >
                                <Grid item container paddingX={"40px"}>
                                    {rest.children}
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
};
