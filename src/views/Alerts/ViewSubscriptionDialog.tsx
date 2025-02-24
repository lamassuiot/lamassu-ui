import React from "react";
import { Button, Typography, useTheme } from "@mui/material";
import { SubChannelType, Subscription, SubscriptionConditionType } from "ducks/features/alerts/models";
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
                                height="20vh"
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
                                        subscription.conditions.map((condition, index) => {
                                            let language = "json";
                                            let expression = "";
                                            if (condition.type === SubscriptionConditionType.Javascript) {
                                                language = "javascript";
                                                expression = condition.condition;
                                            } else {
                                                expression = JSON.stringify(JSON.parse(condition.condition), null, 4);
                                            }
                                            return (
                                                <Grid key={index} xs={12} container>
                                                    <Editor
                                                        theme="vs-dark"
                                                        defaultLanguage={language}
                                                        height="20vh"
                                                        value={expression}
                                                        defaultValue="{}"
                                                    />
                                                </Grid>
                                            );
                                        })
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
