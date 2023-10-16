import React, { useEffect, useState } from "react";
import { Grid, Tab, Tabs } from "@mui/material";
import { TabsListItemsProps, TabsListProps } from "./TabsList";
import { Routes, Route, useNavigate, Outlet, useParams } from "react-router-dom";

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
    }, []);

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
        </Grid>
    );
};

export { TabsListWithRouter }; export type { TabsListWithRouterProps };
