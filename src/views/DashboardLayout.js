import { Box, height } from "@mui/system";
import { AppBar } from "components/DashboardComponents/AppBar";
import { SideBar } from "components/DashboardComponents/SideBar";
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';

import CaList from "views/CaList";
import "./DashboardLayout.css"
import {  Button, Divider, GlobalStyles, Grid, Paper, Typography,IconButton  } from "@mui/material";

import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import { dark, light } from "theme";
import  DeviceList from "./DeviceList";
import {MdOutlinePrecisionManufacturing} from "react-icons/md"
import  DmsList  from "./DmsList";
import { LamassuNotifications } from "components/DashboardComponents/LamassuNotifications";
import CloseIcon from '@mui/icons-material/Close';

export default ({loading, loadingComponent=<></>, notificationsList}) => {
    const [darkTheme, setDarkTheme] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const [displayNotifications, setDisplayNotifications] = useState(false)

    const theme = createTheme(darkTheme ? dark : light)

    const routes = [
        {
            menuTitle: "",
            menuItems: [
                {
                    title: "Home",
                    route: "/",
                    icon: <DashboardOutlinedIcon  key="/"/>,
                    content: <CaList />
                }
            ]
        },
        {
            menuTitle: "Certification Authorities",
            menuItems: [
                {
                    title: "CAs",
                    route: "/cas/",
                    icon: <AccountBalanceOutlinedIcon  key="/1"/>,
                    content: <CaList />
                },
            ]
        },
        {
            menuTitle: "Registration Authorities",
            menuItems: [
                {
                    title: "Device Manufacturing Systems",
                    route: "/dms/",
                    icon: <MdOutlinePrecisionManufacturing  key="/2"/>,
                    content: <DmsList />
                },
                {
                    title: "Device Manager",
                    route: "/devmanager/",
                    icon: <RouterOutlinedIcon  key="/3"/>,
                    content: <DeviceList />
                },
            ]
        },
    ]


    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles
                styles={{
                    '*::-webkit-scrollbar': {
                        width: '8px',
                        height: '8px',
                    },
                    '*::-webkit-scrollbar-track': {
                        background: theme.palette.scrollbar.track
                    },
                    '*::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.scrollbar.thumb,
                        borderRadius: 50,
                        border: 0,
                        outline: 'none',
                    },
                }}
            />
            <Router>
                <Box className={collapsed ? "dashboard-layout-collapsed" : "dashboard-layout"} component={Paper} elevation={0}>
                    <Box className="header">
                        <AppBar 
                            background={"#468AEB"}
                            logo={
                                <Grid container alignItems={"center"}>
                                    <img src={process.env.PUBLIC_URL + "/assets/LAMASSU_W.png"} height={24} style={{marginLeft: "5px"}}/>
                                    <Typography sx={{marginLeft: "15px", fontWeight: "bold", color: "white"}}>Lamassu IoT</Typography>
                                </Grid>
                            }
                            notificationsCount={notificationsList.length}
                            onNotificationsClick={()=>setDisplayNotifications(true)}
                        />
                    </Box>
                    <Box className="sidebar">
                        <SideBar 
                            darkTheme={darkTheme}
                            onTogleDark={()=>{setDarkTheme(!darkTheme)}} 
                            collapsed={collapsed} 
                            onCollapse={()=>{setCollapsed(!collapsed)}}
                            menuConfig={routes}
                            isLoading={loading}
                        />
                    </Box>
                    <Box className="content">
                        {
                            loading ? (
                                <Grid container justifyContent="center" alignItems="center" style={{height: "100%", background: "#eee"}}>
                                    {
                                        React.cloneElement(loadingComponent)
                                    }
                                </Grid>
                            ) : (
                                <Grid container sx={{height: "100%"}}>
                                    <Grid item xs={displayNotifications ? 9 : 12} sx={{height: "100%"}} >
                                        <Routes>
                                            {
                                                routes.map(routeGr => {
                                                    return (
                                                        routeGr.menuItems.map(route => {
                                                            return (
                                                                <Route exact path={route.route} element={route.content} />
                                                            )
                                                        })
                                                    )
                                                })
                                            }
                                        </Routes>
                                    </Grid>
                                    {
                                        displayNotifications && (
                                            <Grid item xs={3} container component={Paper} elevation={6} direction="column" sx={{zIndex: 1}}>
                                                <Grid item container style={{marginBottom: "10px", padding: "20px 20px 0px 20px"}} justifyContent="space-between" alignItems={"center"}>
                                                    <Grid item>
                                                        <Typography style={{fontWeight: "500", color: theme.palette.text.primary }}>Notifications</Typography>
                                                    </Grid>
                                                    <Grid item>
                                                        <IconButton onClick={()=>setDisplayNotifications(false)}>
                                                            <CloseIcon />                           
                                                        </IconButton>
                                                    </Grid>
                                                </Grid>
                                                <Box style={{overflowY: "auto", height: "10px", paddingLeft: 10}} flexGrow={1}>
                                                    <LamassuNotifications notificationsList={notificationsList}/>
                                                </Box>
                                            </Grid>
                                        )
                                    }
                                </Grid>
                            )
                        }
                    </Box>
                </Box>
            </Router>
        </ThemeProvider>
    )
}