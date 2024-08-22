import React from "react";
import { Button, Typography, useTheme } from "@mui/material";
import { SubChannelType, Subscription } from "ducks/features/alerts/models";
import { Editor } from "@monaco-editor/react";
import { Modal } from "components/Modal";
import Label from "components/Label";
import Grid from "@mui/material/Unstable_Grid2";

interface Props {
    subscription: Subscription,
    isOpen: boolean,
    onClose: any
}

export const ViewSubscriptionDialog: React.FC<Props> = ({ subscription, isOpen, onClose }) => {
    const theme = useTheme();

    return (
        <Modal isOpen={isOpen} onClose={() => onClose()} maxWidth={"md"} title={"Subscription to event"} subtitle="" content={
            <>
                <Grid container spacing={2}>
                    <Grid xs={12} container spacing={2}>
                        <Grid xs="auto">
                            <Typography variant="h6">Subscription ID:</Typography>
                        </Grid>
                        <Grid xs="auto">
                            <Label>{subscription.id}</Label>
                        </Grid>
                    </Grid>
                    <Grid xs={12} container spacing={2}>
                        <Grid xs="auto">
                            <Typography variant="h6">Subscription Name:</Typography>
                        </Grid>
                        <Grid xs="auto">
                            <Label>
                                {subscription.channel.type === SubChannelType.Email
                                    ? (
                                        subscription.channel.config.email
                                    )
                                    : (
                                        subscription.channel.name
                                    )}
                            </Label>
                        </Grid>
                    </Grid>
                    <Grid xs={12} container spacing={2}>
                        <Grid xs="auto">
                            <Typography variant="h6">Event type:</Typography>
                        </Grid>
                        <Grid xs="auto">
                            <Label>{subscription.event_type}</Label>
                        </Grid>
                    </Grid>
                    <Grid xs={12} container spacing={2}>
                        <Grid xs="auto">
                            <Typography variant="h6">Notification Channel:</Typography>
                        </Grid>
                        <Grid xs="auto">
                            <Label>{subscription.channel.type}</Label>
                        </Grid>
                    </Grid>
                    <Grid xs={12} container spacing={2}>
                        <Grid xs="auto">
                            <Typography variant="h6">Channel Configuration:</Typography>
                        </Grid>
                        <Grid xs={12}>
                            <Editor
                                theme="vs-dark"
                                defaultLanguage="json"
                                height="50vh"
                                value={JSON.stringify(subscription.channel.config, null, 4)}
                                defaultValue="{}"
                            />
                        </Grid>
                    </Grid>
                    <Grid xs={12} container spacing={2}>
                        <Grid xs="auto">
                            <Typography variant="h6">Filters:</Typography>
                        </Grid>
                        <Grid xs={12} container>
                            {
                                subscription.conditions.length === 0
                                    ? (
                                        <Grid xs={12}>
                                            <Label>No filters</Label>
                                        </Grid>
                                    )
                                    : (
                                        subscription.conditions.map((condition, index) => (
                                            <Grid key={index} xs={6} container>
                                                <Grid xs={12} container sx={{ background: theme.palette.mode === "light" ? "#fafafa" : "#263238", borderRadius: "10px", padding: "5px", overflowX: "auto", maxHeight: "320px" }}>
                                                    <Editor
                                                        theme="vs-dark"
                                                        defaultLanguage="json"
                                                        value={JSON.stringify(JSON.parse(condition.condition), null, 4)}
                                                        defaultValue="{}"
                                                    />
                                                </Grid>
                                            </Grid>
                                        ))
                                    )
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </>
        }
        actions={
            <Grid container spacing={2}>
                <Grid xs md="auto">
                    <Button variant="contained" fullWidth onClick={async () => {
                        onClose();
                    }}>Close</Button>
                </Grid>
            </Grid>
        }
        />
    );
};
