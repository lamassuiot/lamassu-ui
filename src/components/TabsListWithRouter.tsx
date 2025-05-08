import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { Tab, Tabs } from "@mui/material";
import { TabsListItemsProps, TabsListProps } from "./TabsList";
import Grid from "@mui/material/Unstable_Grid2";
import React, { useEffect, useState } from "react";

interface TabsListWithRouterProps extends TabsListProps {
    tabs: TabsListItemsWithRoute[];
    useParamsKey: string
}

export interface TabsListItemsWithRoute extends TabsListItemsProps {
    path: string
    goto: string
}

const TabsListWithRouter: React.FC<TabsListWithRouterProps> = ({ tabs, headerStyle = {}, contentStyle = {}, useParamsKey }) => {
    const navigate = useNavigate();
    const params = useParams();

    const [value, setValue] = useState(2);
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
        navigate(tabs[newValue].goto);
    };

    useEffect(() => {
        let idx = tabs.findIndex(tab => {
            if (tab.path !== "") {
                return params[useParamsKey]!.startsWith(tab.path);
            }
            return false;
        });

        if (idx === -1) {
            idx = 0;
        }

        setValue(idx);
    }, [tabs]);

    return (
        <Grid container direction={"column"} sx={{ width: "100%", height: "100%" }}>
            <Grid sx={{ borderBottom: 1, borderColor: "divider", ...headerStyle }}>
                <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons allowScrollButtonsMobile>
                    {
                        tabs.map((elem, idx) => {
                            return (
                                <Tab key={idx} label={elem.label} />
                            );
                        })
                    }
                </Tabs>
            </Grid>
            <Grid xs={12} flex={1} sx={{ ...contentStyle, height: "1px", overflowY: "auto" }}>
                <Routes>
                    <Route path="/" element={<Outlet />}>
                        {
                            tabs.map((elem, idx) => {
                                return (
                                    <Route key={idx} path={elem.path} element={elem.element} />
                                );
                            })
                        }
                    </Route>
                </Routes>
            </Grid>
        </Grid >
    );
};

export { TabsListWithRouter }; export type { TabsListWithRouterProps };
