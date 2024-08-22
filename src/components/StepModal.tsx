import { Box, Breakpoint, Button, Step, StepIconProps, StepLabel, Stepper, Typography, lighten, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useState } from "react";
import { Modal } from "./Modal";

interface StepModalProps {
    title: string,
    open: boolean,
    onClose: () => void,
    steps: StepProps[]
    size?: Breakpoint,
    onFinish: () => void
}

interface StepProps {
    content: React.ReactNode,
    allowNext?: () => boolean,
    title: string,
    subtitle: string
}

const DuiStepIcon = (props: StepIconProps) => {
    const { active, completed, className } = props;
    const theme = useTheme();

    if (completed) {
        return (
            <Box sx={{ background: lighten(theme.palette.primary.main, 0.5), width: "30px", height: "30px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckIcon style={{ color: theme.palette.primary.main, fontSize: "0.9rem" }} />
            </Box>
        );
    } else if (active) {
        return (
            <Box sx={{ background: theme.palette.primary.main, width: "30px", height: "30px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography style={{ color: theme.palette.primary.contrastText, fontSize: "0.9rem" }}>{props.icon}</Typography>
            </Box>
        );
    }
    return (
        <Box sx={{ background: theme.palette.grey[400], width: "30px", height: "30px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography style={{ color: theme.palette.grey[100], fontSize: "0.9rem" }}>{props.icon}</Typography>
        </Box>
    );
    ;
};

const StepModal: React.FC<StepModalProps> = ({ title, open, onClose, steps, size = "md", ...rest }) => {
    const [activeStep, setActiveStep] = useState(0);
    const theme = useTheme();

    return (
        <Modal isOpen={open} onClose={onClose} maxWidth={size} title={title} subtitle="" content={(
            <Grid container spacing={2}>
                <Grid xs={12}>
                    <Stepper activeStep={activeStep} sx={{ overflowX: "hidden" }}>
                        {
                            steps.map((step, idx) => (
                                <Step key={idx} sx={{ width: "fit-content" }}>
                                    <StepLabel StepIconComponent={DuiStepIcon}>{step.title}</StepLabel>
                                </Step>
                            ))
                        }
                    </Stepper>
                </Grid>
                <Grid xs={12} >
                    {steps[activeStep].content}
                </Grid>
            </Grid>
        )} actions={
            <Grid container spacing={2}>
                <Grid xs="auto" md="auto">
                    <Button variant="text" onClick={onClose}>Cancel</Button>
                </Grid>
                <Grid xs="auto">
                    <Button disabled={activeStep === 0} onClick={() => { setActiveStep(activeStep - 1); }}>Back</Button>
                </Grid>
                <Grid xs md="auto">
                    {
                        activeStep < steps.length - 1
                            ? (
                                <Button variant="contained" fullWidth onClick={() => { setActiveStep(activeStep + 1); }}>Next</Button>
                            )
                            : (
                                <Button variant="contained" fullWidth onClick={() => {
                                    rest.onFinish();
                                    onClose();
                                }}>Finish</Button>
                            )
                    }
                </Grid>
            </Grid>
        } />

    );
};

export { StepModal }; export type { StepModalProps };
