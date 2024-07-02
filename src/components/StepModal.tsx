import { Box, Breakpoint, Button, Dialog, DialogActions, DialogContent, DialogTitle, Step, StepIconProps, StepLabel, Stepper, Typography, lighten, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useState } from "react";

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

const StepModal: React.FC<StepModalProps> = ({ title, open, onClose, steps, size = "md" }) => {
    const [activeStep, setActiveStep] = useState(0);
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth={size}>
            <DialogTitle>
                <Grid container spacing={"40px"} alignItems={"center"}>
                    <Grid xs="auto">
                        <Typography variant="h4" color={theme.palette.primary.main} >{title}</Typography>
                    </Grid>
                    <Grid xs>
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
                        idx === activeStep && (
                            <Grid key={idx} container flexDirection={"column"} spacing={2}>
                                <Grid>
                                    <Typography variant="h5">{step.subtitle}</Typography>
                                </Grid>
                                <Grid>{step.content}</Grid>
                            </Grid>
                        )
                    ))
                }
            </DialogContent>
            <DialogActions>
                <Grid container>
                    <Grid xs>
                        <Button onClick={onClose}>Cancel</Button>
                    </Grid>
                    <Grid xs="auto" container spacing={1}>
                        <Grid xs="auto">
                            <Button disabled={activeStep === 0} onClick={() => { setActiveStep(activeStep - 1); }}>Back</Button>
                        </Grid>
                        <Grid xs="auto">
                            {
                                activeStep < steps.length - 1
                                    ? (
                                        <Button variant="contained" onClick={() => { setActiveStep(activeStep + 1); }}>Next</Button>
                                    )
                                    : (
                                        <Button variant="contained" onClick={onClose}>Finish</Button>
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
