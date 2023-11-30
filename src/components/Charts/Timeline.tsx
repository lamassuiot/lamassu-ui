import React from "react";
import { Typography, Box } from "@mui/material";
import Label from "components/LamassuComponents/dui/typographies/Label";
import Grid from "@mui/material/Unstable_Grid2";

interface Props {
    stages: {
        label: string,
        size: number,
        background: string,
        color: string,
        startLabel: string | React.ReactElement | undefined,
        endLabel: string | React.ReactElement | undefined,
    }[]
}

export const Timeline: React.FC<Props> = ({ stages }) => {
    return (
        <Grid container flexDirection={"column"}>
            <Grid xs container columns={stages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0)} >
                {
                    stages.map((stage, idx) => (
                        <Grid key={idx} xs={stage.size} height={"30px"}>
                            <Box sx={{ background: stage.background, color: stage.color, height: "100%", ...idx === 0 && { borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px" }, ...idx === stages.length - 1 && { borderTopRightRadius: "15px", borderBottomRightRadius: "15px" } }} >
                                <Grid container alignItems={"center"} justifyContent={"center"} width={"100%"} height={"100%"}>
                                    <Grid xs="auto"><Typography fontFamily={"monospace"}>{stage.label}</Typography></Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    ))
                }
            </Grid>
            <Grid container columns={stages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0)} alignItems={"start"}>
                {
                    stages.map((stage, idx) => (
                        <Grid key={idx} xs={stage.size} container alignItems={"flex-start"} justifyContent={"space-between"}>
                            <Grid xs="auto" container flexDirection={"column"}>
                                {
                                    stage.startLabel && (
                                        <>
                                            <Grid><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                            <Grid>
                                                {
                                                    typeof stage.startLabel === "string"
                                                        ? (
                                                            <Label>{stage.startLabel}</Label>
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
                                                            <Label>{stage.endLabel}</Label>
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
        </Grid >
    );
};
