import React from "react";
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Box } from "@mui/material";

interface Props {
    isOpen: boolean
    onClose: any,
    title: string,
    subtitle: string,
    content: React.ReactElement
    actions: React.ReactElement
}

export const Modal: React.FC<Props> = ({ isOpen, onClose, title, subtitle, content, actions }) => {
    return (
        <Dialog open={isOpen} onClose={() => onClose()} maxWidth={"xl"}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{subtitle}</DialogContentText>
                <Box> {content}</Box>
            </DialogContent>
            <DialogActions>{actions}</DialogActions>
        </Dialog>
    );
};
