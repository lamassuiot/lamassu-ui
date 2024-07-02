import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";

export interface Stage {
    label: string | React.ReactElement,
    size: number,
    background: string,
    color: string,
    startLabel: string | React.ReactElement | undefined,
    endLabel: string | React.ReactElement | undefined,
}
export interface Event {
    label: string | React.ReactElement,
    position: number,
}
interface Props {
    stages: Stage[]
    events?: Event[]
    useColumns?: boolean
}

export const Timeline: React.FC<Props> = ({ stages, useColumns = true, events = [] }) => {
    return (
        <Grid container flexDirection={"column"} {...!useColumns && { sx: { width: "max-content" } }}>
            <Grid container {...useColumns ? { columns: stages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0) } : { sx: { width: "max-width", flexWrap: "nowrap" } }} alignItems={"start"}>
                {
                    events.map((event, idx) => {
                        let evSize = event.position;
                        if (idx > 0) {
                            evSize = event.position - events[idx - 1].position;
                        }
                        return (
                            (
                                <Grid key={idx} {...useColumns ? { xs: evSize } : { sx: { width: evSize * 20 } }} container alignItems={"flex-start"} justifyContent={"space-between"}>
                                    <Grid xs="auto" container flexDirection={"column"}></Grid>
                                    <Grid xs="auto" container flexDirection={"column"} alignItems={"end"}>
                                        {
                                            event.label && (
                                                <>
                                                    <Grid>
                                                        {
                                                            typeof event.label === "string"
                                                                ? (
                                                                    <Typography>{event.label}</Typography>
                                                                )
                                                                : (
                                                                    event.label
                                                                )
                                                        }
                                                    </Grid>
                                                    <Grid><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                                </>
                                            )
                                        }
                                    </Grid>
                                </Grid>
                            )
                        );
                    })
                }
            </Grid>
            <Grid xs container {...useColumns ? { columns: stages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0) } : { sx: { width: "max-width", flexWrap: "nowrap" } }} >
                {
                    stages.map((stage, idx) => (
                        <Grid key={idx} {...useColumns ? { xs: stage.size } : { sx: { width: stage.size * 20 } }} height={"30px"}>
                            <Box sx={{ background: stage.background, color: stage.color, height: "100%", ...idx === 0 && { borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px" }, ...idx === stages.length - 1 && { borderTopRightRadius: "15px", borderBottomRightRadius: "15px" } }} >
                                <Grid container alignItems={"center"} justifyContent={"center"} width={"100%"} height={"100%"}>
                                    <Grid xs="auto">
                                        {
                                            typeof stage.label === "string"
                                                ? (
                                                    <Typography fontFamily={"monospace"}>{stage.label}</Typography>
                                                )
                                                : (
                                                    stage.label
                                                )
                                        }
                                    </Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    ))
                }
            </Grid>
            <Grid container {...useColumns ? { columns: stages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0) } : { sx: { width: "max-width", flexWrap: "nowrap" } }} alignItems={"start"}>
                {
                    stages.map((stage, idx) => (
                        <Grid key={idx} {...useColumns ? { xs: stage.size } : { sx: { width: stage.size * 20 } }} container alignItems={"flex-start"} justifyContent={"space-between"}>
                            <Grid xs="auto" container flexDirection={"column"}>
                                {
                                    stage.startLabel && (
                                        <>
                                            <Grid><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                            <Grid>
                                                {
                                                    typeof stage.startLabel === "string"
                                                        ? (
                                                            <Typography>{stage.startLabel}</Typography>
                                                        )
                                                        : (
                                                            stage.startLabel
                                                        )
                                                }
                                            </Grid>
                                        </>
                                    )
                                }
                            </Grid>
                            <Grid xs="auto" container flexDirection={"column"} alignItems={"end"}>
                                {
                                    stage.endLabel && (
                                        <>
                                            <Grid><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                            <Grid>
                                                {
                                                    typeof stage.endLabel === "string"
                                                        ? (
                                                            <Typography>{stage.endLabel}</Typography>
                                                        )
                                                        : (
                                                            stage.endLabel
                                                        )
                                                }
                                            </Grid>
                                        </>
                                    )
                                }
                            </Grid>
                        </Grid>
                    ))
                }
            </Grid>
        </Grid>
    );
};
