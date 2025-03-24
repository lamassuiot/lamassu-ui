import { Box, Grid, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
    makeStyles,
    shorthands,
    tokens,
    Text,
    Body1,
    mergeClasses,
    Card,
    CardHeader,
    Avatar,
    Caption1,
    InteractionTag,
    InteractionTagPrimary,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    OverlayDrawer,
    Button,
    Select,
    Label,
    Body1Strong,
    Input,
    Textarea,
    MessageBar,
    MessageBarBody,
    MessageBarTitle

} from "@fluentui/react-components";
import { ArrowCircleUpRegular, ArrowSyncRegular, DismissRegular, ServerRegular, SettingsRegular } from "@fluentui/react-icons";
import apicalls from "ducks/apicalls";
import { Editor } from "@monaco-editor/react";
import { helmYaml } from "./test";
import lamassuLogoSquare from "assets/lamassu/lamassu-logo-square.svg";

type ServiceInfo = {
    name: string
    version: string
    build_time: string
    build: string
    loading: boolean
}
const useStyles = makeStyles({
    main: {
        ...shorthands.gap("36px"),
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap"
    },

    title: {
        ...shorthands.margin(0, 0, "12px")
    },

    description: {
        ...shorthands.margin(0, 0, "12px")
    },

    card: {
        width: "100%",
        maxWidth: "100%",
        height: "fit-content"
    },

    caption: {
        color: tokens.colorNeutralForeground3
    },

    logo: {
        ...shorthands.borderRadius("4px"),
        width: "48px",
        height: "48px"
    },

    text: {
        ...shorthands.margin(0)
    }
});

export const InfoView = () => {
    const theme = useTheme();
    const styles = useStyles();

    const [servicesInfo, setServicesInfo] = useState<Array<ServiceInfo>>([]);
    const [updateDrawerOpen, setUpdateDrawerOpen] = useState(false);
    const [viewConfigDrawerOpen, setViewConfigDrawerOpen] = useState(false);

    const refreshAction = async () => {
        const services = [
            { name: "CA", fetcher: apicalls.cas.getApiInfo },
            { name: "DMS Manager", fetcher: apicalls.dmss.getApiInfo },
            { name: "Device Manager", fetcher: apicalls.devices.getApiInfo },
            { name: "Alerts", fetcher: apicalls.alerts.getApiInfo }
        ];

        const initSvc: Array<ServiceInfo> = [];
        for (let i = 0; i < services.length; i++) {
            const svc = services[i];
            initSvc.push({
                name: svc.name,
                build: "-",
                build_time: "-",
                version: "-",
                loading: true
            });
        }

        setServicesInfo([...initSvc]);

        for (let i = 0; i < services.length; i++) {
            const svc = services[i];
            const fetcher = svc.fetcher;
            const apiInfo = await fetcher();
            initSvc[i] = {
                name: initSvc[i].name,
                build: apiInfo.build,
                build_time: apiInfo.build_time,
                version: apiInfo.version,
                loading: false
            };

            setServicesInfo([...initSvc]);
        }
    };

    useEffect(() => {
        refreshAction();
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <Grid sx={{ overflowY: "auto", flexGrow: 1, height: "300px" }} >
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box style={{ padding: "40px" }}>
                        <Grid container spacing={3}>
                            <Grid item container xs={12}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                image={{ src: lamassuLogoSquare }}
                                                color="blue"
                                            />
                                        }
                                        header={<Text weight="semibold">Deployment Version</Text>}
                                        description={<Body1 className={styles.caption}>{window._env_.INFO.CHART_VERSION}</Body1>}
                                        action={
                                            <>
                                                {
                                                    false && (
                                                        <InteractionTag appearance="brand" onClick={() => setUpdateDrawerOpen(true)}>
                                                            <InteractionTagPrimary icon={<ArrowCircleUpRegular />}>
                                                            Upgrade Ready
                                                            </InteractionTagPrimary>
                                                        </InteractionTag>

                                                    )
                                                }
                                            </>
                                        }
                                    />
                                    <Grid container>
                                        <Grid xs container flexDirection={"column"}>
                                            <Grid item container>
                                                <Grid item xs={6} md={2}>
                                                    <Body1 className={styles.caption}>Helm Chart Version</Body1>
                                                </Grid>
                                                <Grid item xs md>
                                                    <Caption1 className={styles.caption}>2.6.1</Caption1>
                                                </Grid>
                                            </Grid>
                                            <Grid item container>
                                                <Grid item xs={6} md={2}>
                                                    <Body1 className={styles.caption}>App Version</Body1>
                                                </Grid>
                                                <Grid item xs md>
                                                    <Caption1 className={styles.caption}>2.5.2</Caption1>
                                                </Grid>
                                            </Grid>
                                            <Grid item container>
                                                <Grid item xs={6} md={2}>
                                                    <Body1 className={styles.caption}>Release Number</Body1>
                                                </Grid>
                                                <Grid item xs md>
                                                    <Caption1 className={styles.caption}>{52}</Caption1>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                        {
                                            false && (
                                                <Grid item xs="auto">
                                                    <InteractionTag appearance="filled" onClick={() => setViewConfigDrawerOpen(true)}>
                                                        <InteractionTagPrimary icon={<SettingsRegular />}>
                                                    View Config
                                                        </InteractionTagPrimary>
                                                    </InteractionTag>
                                                </Grid>
                                            )
                                        }
                                    </Grid>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                initials="UI"
                                                color="blue"
                                            />
                                        }
                                        header={<Text weight="semibold">UI</Text>}
                                        description={<Body1 className={styles.caption}>{window._env_.INFO.UI_VERSION}</Body1>}
                                    />

                                    <Grid container flexDirection={"column"}>
                                        <Grid item container>
                                            <Grid item xs={4} md={4}>
                                                <Body1 className={styles.caption}>Build ID</Body1>
                                            </Grid>
                                            <Grid item xs md>
                                                <Caption1 className={styles.caption}>{window._env_.INFO.BUILD_ID}</Caption1>
                                            </Grid>
                                        </Grid>
                                        <Grid item container>
                                            <Grid item xs md>
                                                <Body1 className={styles.caption}>Build Timestamp</Body1>
                                            </Grid>
                                            <Grid item xs md>
                                                <Caption1 className={styles.caption}>
                                                    {moment(window._env_.INFO.BUILD_TIME).format("DD-MM-YYYY HH:mm")}
                                                </Caption1>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                            {
                                servicesInfo.map((si, idx) => (
                                    <Grid item key={idx} xs={12} md={6}>
                                        <Card
                                            className={mergeClasses(styles.card)}
                                            onClick={() => { }}
                                        >
                                            <CardHeader
                                                image={
                                                    <Avatar
                                                        shape="square"
                                                        aria-label="square avatar"
                                                        initials=""
                                                        icon={<ServerRegular />}
                                                        color="anchor"
                                                    />
                                                }
                                                header={<Text weight="semibold">{si.name}</Text>}
                                                description={<Body1 className={styles.caption}>{si.version}</Body1>}
                                            />

                                            <Grid container flexDirection={"column"}>
                                                <Grid item container>
                                                    <Grid item xs={4} md={4}>
                                                        <Body1 className={styles.caption}>Build ID</Body1>
                                                    </Grid>
                                                    <Grid item xs md>
                                                        <Caption1 className={styles.caption}>{si.build}</Caption1>
                                                    </Grid>
                                                </Grid>
                                                <Grid item container>
                                                    <Grid item xs={4} md={4}>
                                                        <Body1 className={styles.caption}>Build Timestamp</Body1>
                                                    </Grid>
                                                    <Grid item xs md>
                                                        <Caption1 className={styles.caption}>
                                                            {moment(si.build_time).format("DD-MM-YYYY HH:mm")}
                                                        </Caption1>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Card>
                                    </Grid>
                                ))
                            }
                            {/* <Grid item xs={6}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                initials=""
                                                icon={<TimelineRegular />}
                                                color="peach"
                                            />
                                        }
                                        header={<Text weight="semibold">Event Bus</Text>}
                                        description={<Body1 className={styles.caption}>RabbitMQ: v16.0</Body1>}
                                    />
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                initials=""
                                                icon={<DatabaseRegular />}
                                                color="steel"
                                            />
                                        }
                                        header={<Text weight="semibold">Storage Engine</Text>}
                                        description={<Body1 className={styles.caption}>Postgres: v13.1.0</Body1>}
                                    />
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                initials=""
                                                image={{ src: "/assets/AWS.png" }}
                                                color="steel"
                                            />
                                        }
                                        header={<Text weight="semibold">IoT Connector</Text>}
                                        description={<Body1 className={styles.caption}>AWS IoT Connector: v2.5.0</Body1>}
                                    />

                                    <Grid container flexDirection={"column"}>
                                        <Grid item container>
                                            <Grid item xs={4}>
                                                <Body1 className={styles.caption}>Region</Body1>
                                            </Grid>
                                            <Grid item xs>
                                                <Caption1 className={styles.caption}>eu-west-1</Caption1>
                                            </Grid>
                                        </Grid>
                                        <Grid item container>
                                            <Grid item xs={4}>
                                                <Body1 className={styles.caption}>Account ID</Body1>
                                            </Grid>
                                            <Grid item xs>
                                                <Caption1 className={styles.caption}>
                                                    7889465613
                                                </Caption1>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                initials=""
                                                image={{ src: "/assets/AZURE.png" }}
                                                color="steel"
                                            />
                                        }
                                        header={<Text weight="semibold">IoT Connector</Text>}
                                        description={<Body1 className={styles.caption}>Azure IoT Connector: v2.5.0</Body1>}
                                    />

                                    <Grid container flexDirection={"column"}>
                                        <Grid item container>
                                            <Grid item xs={4}>
                                                <Body1 className={styles.caption}>Region</Body1>
                                            </Grid>
                                            <Grid item xs>
                                                <Caption1 className={styles.caption}>eu-west-1</Caption1>
                                            </Grid>
                                        </Grid>
                                        <Grid item container>
                                            <Grid item xs={4}>
                                                <Body1 className={styles.caption}>Account ID</Body1>
                                            </Grid>
                                            <Grid item xs>
                                                <Caption1 className={styles.caption}>
                                                    7889465613
                                                </Caption1>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid>
                            <Grid item xs={6}>
                                <Card
                                    className={mergeClasses(styles.card)}
                                    onClick={() => { }}
                                >
                                    <CardHeader
                                        image={
                                            <Avatar
                                                shape="square"
                                                aria-label="square avatar"
                                                initials=""
                                                image={{ src: "/assets/emqx.svg", style: {} }}
                                                color="steel"
                                            />
                                        }
                                        header={<Text weight="semibold">IoT Connector</Text>}
                                        description={<Body1 className={styles.caption}>EMQX Connector: v2.5.0</Body1>}
                                    />

                                    <Grid container flexDirection={"column"}>
                                        <Grid item container>
                                            <Grid item xs={4}>
                                                <Body1 className={styles.caption}>Region</Body1>
                                            </Grid>
                                            <Grid item xs>
                                                <Caption1 className={styles.caption}>eu-west-1</Caption1>
                                            </Grid>
                                        </Grid>
                                        <Grid item container>
                                            <Grid item xs={4}>
                                                <Body1 className={styles.caption}>Account ID</Body1>
                                            </Grid>
                                            <Grid item xs>
                                                <Caption1 className={styles.caption}>
                                                    7889465613
                                                </Caption1>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Card>
                            </Grid> */}
                        </Grid>
                    </Box>
                </Box>
            </Grid>
            <UpgradeHelmLamassuDrawer
                open={updateDrawerOpen}
                setOpen={setUpdateDrawerOpen}
            />
            <ViewHelmConfigDrawer
                open={viewConfigDrawerOpen}
                setOpen={setViewConfigDrawerOpen}
            />
        </Box>
    );
};

type UpgradeHelmLamassuDrawerProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const UpgradeHelmLamassuDrawer: React.FC<UpgradeHelmLamassuDrawerProps> = ({
    open,
    setOpen
}) => {
    return (
        <OverlayDrawer position={"end"} size={"medium"} open={open}>
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<DismissRegular />}
                            onClick={() => setOpen(false)}
                        />
                    }
                >
                    Update Lamassu Deployment
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody>
                <Grid container spacing={3} flexDirection={"column"}>
                    <Grid item >
                        <MessageBar intent={"warning"} layout="multiline">
                            <MessageBarBody>
                                <MessageBarTitle>Warning</MessageBarTitle>
                                Changing and applying new configuration properties will cause the Helm chart to be updated. Some services, including the UI may experience some downtime while the changes are applied. Proceed with caution.
                            </MessageBarBody>
                        </MessageBar>
                    </Grid>
                    <Grid item container spacing={1}>
                        <Grid item xs={12}>
                            <Body1Strong>General</Body1Strong>
                        </Grid>
                        <Grid item xs={12}>
                            <Label>Helm Chart Version</Label>
                            <Grid container spacing={1}>
                                <Grid item xs>
                                    <Select>
                                        <option>v2.5.0</option>
                                        <option>v2.4.9</option>
                                        <option>v2.4.8</option>
                                    </Select>
                                </Grid>
                                <Grid item xs="auto">
                                    <Button icon={<ArrowSyncRegular />} iconPosition="after">
                                        Check Updates
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Button appearance="primary">
                                Apply & Update
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item container spacing={1}>
                        <Grid item xs={12}>
                            <Body1Strong>Parametrization</Body1Strong>
                        </Grid>
                        <Grid item xs={12}>
                            <Label>Domain</Label>
                            <Input style={{ width: "100%" }} value="lab.lamassu.io" />
                        </Grid>
                        <Grid item xs={12}>
                            <Label>Certificate monitoring frequency</Label>
                            <Input style={{ width: "100%" }} value="* * * * *" />
                        </Grid>
                        <Grid item xs={12}>
                            <Button appearance="primary">
                                Save & Apply
                            </Button>
                        </Grid>
                    </Grid>
                    <Grid item container spacing={1}>
                        <Grid item xs={12}>
                            <Body1Strong>TLS</Body1Strong>
                        </Grid>
                        <Grid item xs={12}>
                            <Label>TLS Provider</Label>
                            <Select>
                                <option>Self Managed</option>
                                <option>CertManager: Self Signed</option>
                                <option>CertManager: Cluster Issuer</option>
                                <option>CertManager: Issuer</option>
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <Label>TLS Certificate</Label>
                            <Textarea resize="vertical" textarea={{ style: { fontFamily: "monospace", lineHeight: "12px", fontSize: "12px", minHeight: "100px", maxHeight: "150px" }, spellCheck: false, placeholder: "PEM encoded certificate" }} style={{ width: "100%", fontFamily: "monospace" }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Label>TLS Key</Label>
                            <Textarea resize="vertical" textarea={{ style: { fontFamily: "monospace", lineHeight: "12px", fontSize: "12px", minHeight: "100px", maxHeight: "150px" }, spellCheck: false, placeholder: "PEM encoded PKCS1 o PKCS8 private key" }} style={{ width: "100%", fontFamily: "monospace" }} />
                        </Grid>
                        <Grid item xs={12}>
                            <Button appearance="primary">
                                Save & Apply
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>
            </DrawerBody>
        </OverlayDrawer>
    );
};

type ViewHelmConfigDrawerProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};

const ViewHelmConfigDrawer: React.FC<ViewHelmConfigDrawerProps> = ({
    open,
    setOpen
}) => {
    return (
        <OverlayDrawer position={"end"} size={"large"} open={open}>
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={
                        <Button
                            appearance="subtle"
                            aria-label="Close"
                            icon={<DismissRegular />}
                            onClick={() => setOpen(false)}
                        />
                    }
                >
                    Lamassu Deployment Configuration
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody>
                <Grid container spacing={3} flexDirection={"column"}>
                    <Grid item container spacing={1}>
                        <Grid item xs={12}>
                            <Body1Strong>Helm Chart</Body1Strong>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item xs={2}>
                                    <Body1>Helm Chart Version</Body1>
                                </Grid>
                                <Grid item xs={10}>
                                    <Body1>v2.6.1</Body1>
                                </Grid>
                                <Grid item xs={2}>
                                    <Body1>App Version</Body1>
                                </Grid>
                                <Grid item xs={10}>
                                    <Body1>v2.5.1</Body1>
                                </Grid>
                                <Grid item xs={2}>
                                    <Body1>Release Number</Body1>
                                </Grid>
                                <Grid item xs={10}>
                                    <Body1>52</Body1>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item container spacing={1}>
                        <Grid item xs={12}>
                            <Body1Strong>Values</Body1Strong>
                        </Grid>
                        <Grid item xs={12}>
                            <Editor
                                theme="vs-dark"
                                defaultLanguage="yaml"
                                height="50vh"
                                value={helmYaml}
                                defaultValue="{}"
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </DrawerBody>
        </OverlayDrawer>
    );
};
