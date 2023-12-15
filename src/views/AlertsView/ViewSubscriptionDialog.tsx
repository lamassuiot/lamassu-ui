import React from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import { SubChannelType, Subscription } from "ducks/features/alerts/models";
import { materialLight, materialOceanic } from "react-syntax-highlighter/dist/esm/styles/prism";
import SyntaxHighlighter from "react-syntax-highlighter";

interface Props {
    subscription: Subscription | undefined,
    isOpen: boolean,
    onClose: any
}

export const ViewSubscriptionDialog: React.FC<Props> = ({ subscription, isOpen, onClose }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    return (
        <Dialog open={isOpen} onClose={() => onClose()} maxWidth={"md"}>
            {
                subscription && (
                    <>
                        <DialogTitle>Subscription to event: {subscription.channel.type}</DialogTitle>
                        <DialogContent>
                            <Grid container spacing={2}>
                                <Grid item xs={12} container spacing={2}>
                                    <Grid item xs="auto">
                                        <Typography variant="button">Subscription Name:</Typography>
                                    </Grid>
                                    <Grid item xs="auto">
                                        <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>
                                            {subscription.channel.type === SubChannelType.Email
                                                ? (
                                                    subscription.channel.config.email
                                                )
                                                : (
                                                    subscription.channel.name
                                                )}
                                        </Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} container spacing={2}>
                                    <Grid item xs="auto">
                                        <Typography variant="button">Subscription ID:</Typography>
                                    </Grid>
                                    <Grid item xs="auto">
                                        <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{subscription.id}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} container spacing={2}>
                                    <Grid item xs="auto">
                                        <Typography variant="button">Type:</Typography>
                                    </Grid>
                                    <Grid item xs="auto">
                                        <Typography variant="button" style={{ background: theme.palette.background.darkContrast, padding: 5, fontSize: 12 }}>{subscription.channel.type}</Typography>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} container spacing={2}>
                                    <Grid item xs="auto">
                                        <Typography variant="button">Channel Configuration:</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SyntaxHighlighter language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ margin: 0, padding: 10, fontSize: 12, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                            {JSON.stringify(subscription.channel.config, null, 2)}
                                        </SyntaxHighlighter>
                                    </Grid>
                                </Grid>
                                <Grid item xs={12} container spacing={2}>
                                    <Grid item xs="auto">
                                        <Typography variant="button">Filters:</Typography>
                                    </Grid>
                                    <Grid item xs={12} container>
                                        {
                                            subscription.conditions.map((condition, index) => (
                                                <Grid key={index} item xs={6} container>
                                                    <Grid item xs={12} container sx={{ background: theme.palette.mode === "light" ? "#fafafa" : "#263238", borderRadius: "10px", padding: "5px", overflowX: "auto", maxHeight: "320px" }}>
                                                        <SyntaxHighlighter language="json" style={theme.palette.mode === "light" ? materialLight : materialOceanic} customStyle={{ margin: 0, padding: 10, fontSize: 12, width: "fit-content", height: "fit-content" }} wrapLines={true} lineProps={{ style: { color: theme.palette.text.primaryLight } }}>
                                                            {JSON.stringify(JSON.parse(condition.condition), null, 2)}
                                                        </SyntaxHighlighter>
                                                    </Grid>
                                                </Grid>
                                            ))
                                        }
                                    </Grid>
                                </Grid>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => onClose()} variant="outlined">Close</Button>
                        </DialogActions>
                    </>
                )
            }
        </Dialog>
    );
};
