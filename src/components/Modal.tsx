import { Box, Breakpoint, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { Sheet } from "react-modal-sheet";

interface Props {
    isOpen: boolean
    onClose: any,
    title: string,
    subtitle: string,
    content: React.ReactElement
    actions: React.ReactElement
    maxWidth?: Breakpoint | false | undefined
}

export const Modal: React.FC<Props> = ({ isOpen, onClose, title, subtitle, content, actions, maxWidth = "xl" }) => {
    const theme = useTheme();

    const isMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

    if (isMediumScreen) {
        return (
            <Sheet isOpen={isOpen} onClose={() => onClose()} detent="content-height">
                <Sheet.Container style={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px", display: "flex", flexDirection: "column" }}>
                    {
                        title !== ""
                            ? (
                                <Sheet.Header style={{ padding: "15px", fontSize: "18px", fontWeight: "bold" }}>
                                    {title}
                                </Sheet.Header>
                            )
                            : (
                                <Sheet.Header />
                            )
                    }
                    <Sheet.Content style={{ padding: "15px", flex: "auto", overflowY: "auto" }}>{content}</Sheet.Content>
                    <Sheet.Content style={{ padding: "15px 15px 25px 15px", display: "block", flexGrow: "unset" }}>{actions}</Sheet.Content>
                </Sheet.Container>
                <Sheet.Backdrop />
            </Sheet >
        );
    }

    return (
        <Dialog open={isOpen} onClose={() => onClose()} maxWidth={maxWidth} sx={{ width: "100%" }} PaperProps={{ sx: { width: "100%" } }}>
            <DialogTitle variant="h4" color={theme.palette.primary.main}> {title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{subtitle}</DialogContentText>
                <Box> {content}</Box>
            </DialogContent>
            <DialogActions>{actions}</DialogActions>
        </Dialog>
    );
};
