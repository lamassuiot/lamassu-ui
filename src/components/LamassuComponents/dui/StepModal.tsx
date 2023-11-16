import { Box, Breakpoint, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Step, StepIconProps, StepLabel, Stepper, Typography, useTheme } from "@mui/material";
import React, { useState } from "react";
import { MonoChromaticButton } from "./MonoChromaticButton";
import CheckIcon from "@mui/icons-material/Check";

interface StepModalProps {
    title: string,
    open: boolean,
    onClose: () => void,
    steps: StepProps[]
    size?: Breakpoint
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
            <Box sx={{ background: theme.palette.primary.light, width: "30px", height: "30px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckIcon style={{ color: theme.palette.primary.main, fontSize: "0.9rem" }} />
            </Box>
        );
    } else if (active) {
        return (
            <Box sx={{ background: theme.palette.primary.main, width: "30px", height: "30px", borderRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Typography style={{ color: theme.palette.primary.light, fontSize: "0.9rem" }}>{props.icon}</Typography>
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
const StepModal: React.FC<StepModalProps> = ({ title, open, onClose, steps, size = "md" }) => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <Dialog open={open} onClose={onClose} maxWidth={size}>
            <DialogTitle>
                <Grid container spacing={"40px"}>
                    <Grid item xs="auto">
                        <Typography variant="h2" sx={{ fontWeight: "500", fontSize: "1.25rem" }}>{title}</Typography>
                    </Grid>
                    <Grid item xs>
                        <Stepper activeStep={activeStep}>
                            {
                                steps.map((step, idx) => (
                                    <Step key={idx}>
                                        <StepLabel StepIconComponent={DuiStepIcon}>{step.title}</StepLabel>
                                    </Step>
                                ))
                            }
                        </Stepper>
                    </Grid>
                </Grid>
            </DialogTitle>
            <DialogContent>
                {
                    steps.map((step, idx) => (
                        <Grid container key={idx}>
                            {
                                idx === activeStep && (
                                    step.content
                                )
                            }
                        </Grid>
                    ))
                }
            </DialogContent>
            <DialogActions>
                <Grid container>
                    <Grid item xs>
                        <Button onClick={onClose}>Cancel</Button>

                    </Grid>
                    <Grid item xs="auto" container spacing={1}>
                        <Grid item xs="auto">
                            <Button disabled={activeStep === 0} onClick={() => { setActiveStep(activeStep - 1); }}>Back</Button>
                        </Grid>
                        <Grid item xs="auto">
                            {
                                activeStep < steps.length - 1
                                    ? (
                                        <MonoChromaticButton onClick={() => { setActiveStep(activeStep + 1); }}>Next</MonoChromaticButton>
                                    )
                                    : (
                                        <MonoChromaticButton onClick={onClose}>Finish</MonoChromaticButton>
                                    )
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </DialogActions>
        </Dialog>
    );
};

export { StepModal }; export type { StepModalProps };
