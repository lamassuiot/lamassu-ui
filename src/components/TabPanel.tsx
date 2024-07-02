import React from "react";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            style={{ height: "100%" }}
            {...other}
        >
            {value === index && (
                children
            )}
        </div>
    );
};

export { TabPanel }; export type { TabPanelProps };
