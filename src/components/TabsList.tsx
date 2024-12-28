import { Tab, Tabs } from "@mui/material";
import { TabPanel } from "./TabPanel";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useState } from "react";

interface TabsListProps {
    tabs: TabsListItemsProps[];
    headerStyle?: React.CSSProperties
    contentStyle?: React.CSSProperties
}

export interface TabsListItemsProps {
    label: React.ReactNode;
    element: React.ReactNode;
    hidden?: boolean;
}

const TabsList: React.FC<TabsListProps> = ({ tabs, headerStyle = {}, contentStyle = {} }) => {
    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Grid container direction={"column"} sx={{ width: "100%" }}>
            <Grid sx={{ borderBottom: 1, borderColor: "divider", ...headerStyle }}>
                <Tabs value={value} onChange={handleChange}>
                    {
                        tabs.filter(item => item.hidden !== true).map((elem, idx) => {
                            return (
                                <Tab key={idx} label={elem.label} />
                            );
                        })
                    }
                </Tabs>
            </Grid>
            <Grid xs={12} flex={1} sx={contentStyle}>
                {
                    tabs.filter(item => item.hidden !== true).map((elem, idx) => {
                        return (
                            <TabPanel key={idx} value={value} index={idx}>
                                {elem.element}
                            </TabPanel>
                        );
                    })
                }
            </Grid>
        </Grid>
    );
};

export { TabsList }; export type { TabsListProps };
