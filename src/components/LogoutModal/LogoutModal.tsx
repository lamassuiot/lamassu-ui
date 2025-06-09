import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

type LogoutModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const LogoutModal: React.FC<LogoutModalProps> = ({ open, onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogContent>
                <Typography>Are you sure you want to sign out?</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={onConfirm} color="error" variant="contained">
                    Sign Out
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default LogoutModal;
