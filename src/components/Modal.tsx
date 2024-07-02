import { Box, Breakpoint, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, useTheme } from "@mui/material";
import React from "react";

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
