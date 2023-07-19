import { Grid, Paper, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { TabsList, TabsListItemsProps } from "components/LamassuComponents/dui/TabsList";
import React, { useState } from "react";

interface Props {
    title: string
    subtitle: string,
    tabs: TabsListItemsProps[]
}

const StandardWrapperView: React.FC<Props> = ({ title, subtitle, tabs }) => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <Box sx={{ height: "100%" }} component={Paper}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "40px 40px 0 40px" }}>
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
                </Box>
                {
                    tabs.length === 1
                        ? (
                            <Box sx={{ overflowY: "auto" }}>
                                <Box sx={{ margin: "15px 40px" }}>{tabs[0].element}</Box>
                            </Box>
                        )
                        : (
                            <TabsList tabs={tabs} headerStyle={{ margin: "0 25px" }} contentStyle={{ margin: "15px 40px" }}/>
                        )
                }
            </Box>
        </Box>
    );
};

export default StandardWrapperView;
