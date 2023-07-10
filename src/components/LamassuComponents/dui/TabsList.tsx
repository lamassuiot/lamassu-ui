import React, { useState } from "react";
import { Grid, Tab, Tabs } from "@mui/material";
import { TabPanel } from "./TabPanel";

interface TabsListProps {
    tabs: TabsListItemsProps[];
    headerStyle?: React.CSSProperties
    contentStyle?: React.CSSProperties
}

export interface TabsListItemsProps {
    label: React.ReactNode;
    element: React.ReactNode;
}

const TabsList: React.FC<TabsListProps> = ({ tabs, headerStyle = {}, contentStyle = {} }) => {
    const [value, setValue] = useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Grid container direction={"column"} spacing={2}>
            <Grid item sx={{ borderBottom: 1, borderColor: "divider", ...headerStyle }}>
                <Tabs value={value} onChange={handleChange}>
                    {
                        tabs.map((elem, idx) => {
                            return (
                                <Tab key={idx} label={elem.label} />
                            );
                        })
                    }
                </Tabs>
            </Grid>
            <Grid item flex={1} sx={contentStyle}>
                {
                    tabs.map((elem, idx) => {
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
