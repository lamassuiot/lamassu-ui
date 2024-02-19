import React, { useState, useEffect } from "react";

import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";
import ExpandMore from "@mui/icons-material/ExpandMore";
import ExpandLess from "@mui/icons-material/ExpandLess";

import "./SideBar.css";
import { Collapse, Grid, List, ListItem, Paper, Typography, useTheme } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { Box } from "@mui/system";
import { InfoRegular, WeatherMoonRegular, WeatherSunnyRegular } from "@fluentui/react-icons";
import { Body1 } from "@fluentui/react-text";

interface Props {
  onToggleDark: any
  onCollapse: any
  collapsed: boolean
  menuConfig: any
}

const SideBar: React.FC<Props> = ({ onToggleDark, onCollapse, collapsed, menuConfig }) => {
    const theme = useTheme();
    const routerNavigation = useNavigate();
    const location = useLocation();
    const [selectedPath, setSelectedPath] = useState("");

    const handleSelectedPath = (newPath: string) => {
        if (newPath.charAt(0) !== "/") {
            window.open(newPath, "_blank")?.focus();
        } else {
            setSelectedPath(newPath);
            routerNavigation(newPath);
        }
    };

    useEffect(() => {
        setSelectedPath(location.pathname);
    }, []);

    return (
        <Paper style={{ borderRadius: 0, height: "100%" }} elevation={0}>
            <Grid item className="sidebar-wrapper" sx={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <Box>
                    <MenuButton title={"Collapse"} icon={collapsed ? <KeyboardArrowRightOutlinedIcon /> : <KeyboardArrowLeftOutlinedIcon />} onClick={() => { onCollapse(collapsed); }} collapsed={collapsed} />
                    {
                        menuConfig.map((configItem: any) => (
                            <Box key={Math.random()}>
                                {
                                    <>
                                        <MenuSeparator />
                                        {
                                            configItem.menuTitle !== "" && (
                                                <MenuSectionTitle title={configItem.menuTitle} collapsed={collapsed} />
                                            )
                                        }
                                        {
                                            configItem.menuItems.map((menuConfigItem: any) => (
                                                <MenuItem
                                                    key={menuConfigItem.path}
                                                    title={menuConfigItem.title}
                                                    link={menuConfigItem.link}
                                                    collapsed={collapsed}
                                                    active={selectedPath}
                                                    exactLink={!menuConfigItem.path.includes("*")}
                                                    onSelect={(link: string) => { handleSelectedPath(link); }}
                                                    icon={menuConfigItem.icon}
                                                />
                                            ))
                                        }
                                    </>
                                }
                            </Box>
                        ))
                    }
                    <MenuSeparator />
                    <MenuButton title={theme.palette.mode === "dark" ? "Light" : "Dark"} icon={theme.palette.mode === "dark" ? <WeatherMoonRegular /> : <WeatherSunnyRegular />} onClick={onToggleDark} collapsed={collapsed} />
                </Box>
                <Box>
                    <MenuSeparator />
                    <MenuButton title="Info" icon={<InfoRegular />} onClick={() => { handleSelectedPath("/info"); }} collapsed={collapsed} />
                </Box>
            </Grid>
        </Paper>
    );
};

interface MenuItemProps {
  active: string
  exactLink?: boolean
  link: string
  title: string
  icon: any
  children?: any
  style?: any
  onSelect: any
  collapsed: any
}

const MenuItem: React.FC<MenuItemProps> = ({ active, exactLink = false, link, title, icon, children, style, onSelect, collapsed }) => {
    const theme = useTheme();
    const [expand, setExpand] = useState(false);

    const selectedBorderWidth = 5;
    let paddingLeftPxls = 0;
    const selected = exactLink ? active === link && link !== undefined : active.startsWith(link) && link !== undefined;
    if (selected) {
        paddingLeftPxls = 10;
    } else {
        paddingLeftPxls = 10 + selectedBorderWidth;
    }
    if (style && style.paddingLeft) {
        paddingLeftPxls = paddingLeftPxls + style.paddingLeft;
    }

    const cPrimary = theme.palette.primary;
    return (
        <div style={{ borderLeft: selected ? selectedBorderWidth + "px solid " + cPrimary.main : "" }}>
            <List style={{ padding: 0 }}>
                <ListItem button style={{ height: 40, paddingLeft: paddingLeftPxls }}/* component={link ? Link : null}  to={link} */ onClick={() => { link ? onSelect(link) : setExpand(!expand); }}>

                    {
                        selected
                            ? (
                                React.Children.map(icon, (child, key) =>
                                    React.cloneElement(child, { style: { color: theme.palette.primary.main, fontSize: 24 }, key })
                                )
                            )
                            : (
                                React.Children.map(icon, (child, key) =>
                                    React.cloneElement(child, { style: { color: theme.palette.text.secondary, fontSize: 24 }, key })
                                )
                            )
                    }

                    {
                        !collapsed && (
                            <Body1 style={{ marginLeft: 10, width: "100%", fontSize: 14, color: selected ? cPrimary.main : "", fontWeight: selected ? "bold" : "" }}>
                                {title}
                            </Body1>)
                    }

                    {children ? (expand ? <ExpandLess /> : <ExpandMore />) : null}

                </ListItem>
                {children
                    ? (
                        <Collapse in={expand}>
                            {
                                React.Children.map(children, (child, key) =>
                                    React.cloneElement(child, { style: { paddingLeft: 25 }, key })
                                )
                            }
                        </Collapse>
                    )
                    : (null)
                }
            </List>
        </div>
    );
};

const MenuSeparator = () => {
    const theme = useTheme();
    return (
        <div style={{ borderTop: `1px solid ${theme.palette.divider}` }} />
    );
};

interface MenuSectionTitleProps {
  collapsed: boolean
  title: string
}
const MenuSectionTitle: React.FC<MenuSectionTitleProps> = ({ title, collapsed }) => {
    if (!collapsed) {
        return (
            <Typography className="sidebar-menu-section-title"> {title} </Typography>
        );
    }
    return <></>;
};

interface MenuButtonProps {
  onClick: any
  icon: any
  title: string
  collapsed: boolean
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, icon, title, collapsed }) => {
    const theme = useTheme();

    return (
        <ListItem button onClick={onClick}>
            {
                React.Children.map(icon, (child, key) =>
                    React.cloneElement(child, { style: { color: theme.palette.text.secondary }, key })
                )
            }
            {!collapsed && <Typography style={{ marginLeft: 10, width: "100%", fontSize: 14 }}> {title} </Typography>}
            {/* !collapsed && <div style={{marginLeft: 10, width: "100%", fontSize: 14, color: "#555"}}> {title} </div> */}
        </ListItem>
    );
};

export {
    SideBar,
    MenuSeparator
};
