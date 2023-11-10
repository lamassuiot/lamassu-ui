import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box, Breakpoint } from "@mui/material";

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
    return (
        <Dialog open={isOpen} onClose={() => onClose()} maxWidth={maxWidth} sx={{ width: "100%" }} PaperProps={{ sx: { width: "100%" } }}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{subtitle}</DialogContentText>
                <Box> {content}</Box>
            </DialogContent>
            <DialogActions>{actions}</DialogActions>
        </Dialog>
    );
};
