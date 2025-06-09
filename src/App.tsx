import * as React from "react";
import { Box, ListItem, Paper, Typography, useTheme, useMediaQuery, IconButton, Drawer } from "@mui/material";
import { CAView } from "views/CAs";
import { CertificatesView } from "views/Certificates";
import { DMSView } from "views/DMS";
import { DevicesView } from "views/Devices";
import { Home } from "views/Home";
import { Route, Routes, useNavigate } from "react-router-dom";
import { TbCertificate } from "react-icons/tb";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import Grid from "@mui/material/Unstable_Grid2";
import KeyboardArrowLeftOutlinedIcon from "@mui/icons-material/KeyboardArrowLeftOutlined";
import LogoutIcon from "@mui/icons-material/Logout";
import RouterOutlinedIcon from "@mui/icons-material/RouterOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { InfoView } from "views/Info/info";
import MenuIcon from "@mui/icons-material/Menu";
import { AlertsViewList } from "views/Alerts/AlertsList";
import lamassuFullWhite from "assets/lamassu/lamassu_full_white.svg";
import { useAuth } from "auths/AuthProvider";
import { Landing } from "components/Landing/Landing";
import AuthCallback from "views/AuthCallback/AuthCallback";
import { isAuthEnabled, isCognitoAuth } from "auths/oidcConfig";
import LogoutModal from "components/LogoutModal/LogoutModal";

type SidebarSection = {
    sectionTitle: string, sectionItems: Array<SidebarItem>
}

type SidebarItem =
    | SidebarItemButton
    | SidebarItemNavigation

type SidebarItemNavigation = { kind: "navigation", title: string, basePath: string, goTo: string, icon: React.JSX.Element, content: React.JSX.Element }
type SidebarItemButton = { kind: "button", title: string, onClick: () => void, icon: React.JSX.Element }

function sidebarBasePathPattern (basePath: string) {
    let prefix = basePath;
    if (basePath.endsWith("/*")) {
        prefix = basePath.replaceAll("/*", "*");
    }
    // Escape special characters in the prefix
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Replace '*' with '.*' to match any characters
    const pattern = new RegExp("^" + escapedPrefix.replace(/\*/g, ".*") + "$");

    return pattern;
}

export default function Dashboard () {
    const theme = useTheme();
    const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
    const { isAuthenticated, signinRedirect, signoutRedirect, isLoading, isLoginout } = useAuth();

    const [collapsed, setCollapsed] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [redirecting, setRedirecting] = React.useState(false);

    const handleCollapseClick = () => {
        setCollapsed(!collapsed);
    };

    const handleLogout = () => {
        if (isCognitoAuth) {
            setOpen(true);
        } else {
            signoutRedirect();
        }
    };

    const sidebarContent: Array<SidebarSection> = [
        {
            sectionTitle: "",
            sectionItems: [
                {
                    kind: "button",
                    title: "Collapse",
                    onClick: handleCollapseClick,
                    icon: <KeyboardArrowLeftOutlinedIcon />
                }
            ]
        },
        {
            sectionTitle: "",
            sectionItems: [
                {
                    kind: "navigation",
                    title: "Home",
                    goTo: "/",
                    basePath: "/",
                    icon: <DashboardOutlinedIcon />,
                    content: <Home isMenuCollapsed={collapsed} />
                }
            ]
        },
        {
            sectionTitle: "Certification Authorities",
            sectionItems: [
                {
                    kind: "navigation",
                    title: "CAs",
                    basePath: "/cas/*",
                    goTo: "/cas",
                    icon: <AccountBalanceOutlinedIcon />,
                    content: <CAView />
                },
                {
                    kind: "navigation",
                    title: "Certificates",
                    basePath: "/certs/*",
                    goTo: "/certs",
                    icon: <TbCertificate />,
                    content: <CertificatesView />
                }
            ]
        },
        {
            sectionTitle: "Registration Authorities",
            sectionItems: [
                {
                    kind: "navigation",
                    title: "DMS",
                    basePath: "/dms/*",
                    goTo: "/dms",
                    icon: <FactoryOutlinedIcon />,
                    content: <DMSView />
                },
                {
                    kind: "navigation",
                    title: "Devices",
                    basePath: "/devices/*",
                    goTo: "/devices",
                    icon: <RouterOutlinedIcon />,
                    content: <DevicesView />
                }
            ]
        },
        {
            sectionTitle: "Notifications",
            sectionItems: [
                {
                    kind: "navigation",
                    title: "Alerts",
                    basePath: "/alerts/*",
                    goTo: "/alerts",
                    icon: <MailOutlinedIcon />,
                    content: <AlertsViewList />
                }
            ]
        },
        {
            sectionTitle: "",
            sectionItems: [
                {
                    kind: "navigation",
                    title: "Info",
                    basePath: "/info/*",
                    goTo: "/info",
                    icon: <InfoOutlinedIcon />,
                    content: <InfoView />
                },
                ...(isAuthEnabled
                    ? [
                        {
                            kind: "button",
                            title: "Log out",
                            onClick: handleLogout,
                            icon: <LogoutIcon style={{ color: theme.palette.error.main, cursor: "pointer" }} />
                        } as SidebarItemButton
                    ]
                    : [])
            ]
        }
    ];

    const sidebarItems = sidebarContent.map(section => section.sectionItems).flat();
    const sidebarNavigator = sidebarItems.filter((item): item is SidebarItemNavigation => {
        return item.kind === "navigation";
    });

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated && location.pathname !== "/callback" && !isLoginout) {
            setRedirecting(true);
            signinRedirect();
        }
    }, [isLoading, isAuthenticated, location.pathname, isLoginout]);

    if (isLoading || redirecting) {
        return <Landing />;
    };

    return (
        <Box component={Paper} sx={{ height: "100%" }}>

            <LogoutModal open={open} onClose={() => setOpen(false)} onConfirm={() => signoutRedirect()} />

            <Grid container sx={{ height: "100%" }} direction={"column"} spacing={0}>
                <Grid container sx={{ background: theme.palette.primary.main, height: "50px", paddingX: "10px", width: "100%", margin: 0 }} alignItems={"center"} >
                    {
                        !isMdUp && (
                            <Grid xs="auto">
                                <IconButton onClick={() => setMenuOpen(!menuOpen)}>
                                    <MenuIcon style={{ color: "#fff", cursor: "pointer" }} />
                                </IconButton>
                            </Grid>
                        )
                    }
                    <Grid xs>
                        <img src={lamassuFullWhite} height={30} style={{ marginLeft: "10px" }} />
                    </Grid>
                </Grid>
                <Grid flexGrow={1} container sx={{ height: "calc(100% - 50px)" }}>
                    {
                        isMdUp
                            ? (
                                <Grid xs="auto" container flexDirection={"column"} sx={{ width: "100%", maxWidth: collapsed ? "50px" : "250px", background: theme.sidebar.background, borderRight: `1px solid ${theme.palette.divider}` }}>
                                    <MenuBar collapsed={collapsed} items={sidebarContent} />
                                </Grid>
                            )
                            : (
                                <React.Fragment>
                                    <Drawer
                                        anchor={"left"}
                                        open={menuOpen}
                                        onClose={() => {
                                            setMenuOpen(false);
                                        }}
                                    >
                                        <Box width={300}>
                                            <MenuBar collapsed={false} items={sidebarContent} onItemClick={(item) => {
                                                setMenuOpen(false);
                                            }} />
                                        </Box>
                                    </Drawer>
                                </React.Fragment>
                            )
                    }
                    <Grid xs sx={{ background: theme.palette.background.default, height: "100%", overflowY: "auto" }}>
                        <Routes>
                            {
                                sidebarNavigator.map((route: SidebarItemNavigation, idx) => {
                                    return (
                                        <Route path={route.basePath} element={<MainWrapper component={route.content} />} key={`main-route-${idx}`} />
                                    );
                                })
                            }
                            <Route path="/callback" element={<AuthCallback />} />
                            <Route path="*" element={<Typography>404</Typography>} />
                        </Routes>
                    </Grid>
                </Grid>
            </Grid>
        </Box >
    );
}

interface MenuBarProps {
    items: Array<SidebarSection>
    collapsed: boolean
    onItemClick?: (item: SidebarItem) => void
}

const MenuBar = React.memo<MenuBarProps>((props) => {
    const theme = useTheme();
    const navigate = useNavigate();

    return (
        <>
            {
                props.items.map((section, sectionIdx) => {
                    return (
                        <Grid key={`sidebar-${sectionIdx}`} borderBottom={`1px solid ${theme.sidebar.dividerBg}`}>
                            {
                                !props.collapsed && section.sectionTitle !== "" && (
                                    <Typography sx={{ color: theme.sidebar.textColor, fontFamily: "Roboto", fontWeight: "300", fontVariant: "all-small-caps", padding: "5px 20px", fontSize: "16px" }}>{section.sectionTitle}</Typography>
                                )
                            }
                            {
                                section.sectionItems.map((item, idx) => {
                                    let borderLeftPxls = 0;
                                    if (item.kind === "navigation") {
                                        const navItem = item as SidebarItemNavigation;
                                        // Check if the current location matches the base path of the navigation item
                                        if (sidebarBasePathPattern(navItem.basePath).test(location.pathname)) {
                                            borderLeftPxls = 5;
                                        }
                                    }

                                    return (
                                        <ListItem disableRipple key={idx} button sx={{ borderRadius: 0, borderLeft: `${borderLeftPxls}px solid ${theme.palette.primary.main}`, paddingLeft: `${16 - borderLeftPxls}px` }} onClick={() => {
                                            if (item.kind === "button") {
                                                item.onClick();
                                            } else {
                                                navigate(item.goTo);
                                            }
                                            props.onItemClick && props.onItemClick(item);
                                        }}>
                                            {
                                                React.Children.map(item.icon, (child, key) => React.cloneElement(child, {
                                                    style: {
                                                        color: item.kind === "navigation" && sidebarBasePathPattern(item.basePath).test(location.pathname) ? theme.sidebar.menuItemBgActive : theme.sidebar.menuItemBg,
                                                        fontSize: 22
                                                    },
                                                    key
                                                }))
                                            }
                                            {
                                                !props.collapsed && (
                                                    <Typography style={{
                                                        color: item.kind === "navigation" && sidebarBasePathPattern(item.basePath).test(location.pathname) ? theme.sidebar.menuItemBgActive : theme.sidebar.textColor,
                                                        ...(item.kind === "navigation" && sidebarBasePathPattern(item.basePath).test(location.pathname) && { fontWeight: "bold" }),
                                                        marginLeft: 10,
                                                        width: "100%",
                                                        fontSize: 14
                                                    }}> {item.title} </Typography>
                                                )
                                            }
                                        </ListItem>
                                    );
                                })
                            }
                        </Grid>
                    );
                })
            }
        </>
    );
});

MenuBar.displayName = "MenuBar";

interface MainWrapperProps {
    component: React.ReactNode
}

const MainWrapper = React.memo<MainWrapperProps>((props) => {
    return (
        <>{props.component}</>
    );
});

MainWrapper.displayName = "MainWrapper";
