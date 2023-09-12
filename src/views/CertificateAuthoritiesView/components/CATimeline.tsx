import React, { useEffect, useState } from "react";
import { Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import Label from "components/LamassuComponents/dui/typographies/Label";
import * as duration from "components/utils/duration";
import moment, { Moment } from "moment";
import assert from "assert";

interface Props {
    issuanceDuration: string | Moment
    caExpiration: string | Moment
}

export const CATimeline: React.FC<Props> = ({ issuanceDuration, caExpiration }) => {
    const [timelineStages, setTimelineStages] = useState<{
        label: string,
        size: number,
        background: string,
        color: string,
        startLabel: string | React.ReactElement | undefined,
        endLabel: string | React.ReactElement | undefined,
    }[]>([]);

    useEffect(() => {
        const now = moment();

        let inactiveDate = now.clone();
        let expDate = now.clone();

        if (typeof caExpiration === "string" && duration.validDurationRegex(caExpiration)) {
            const expDurSplit = caExpiration.match(duration.durationValueUnitSplitRegex);
            assert(expDurSplit !== null);
            assert(expDurSplit!.length === 2);
            // @ts-ignore
            expDate.add(parseInt(expDurSplit![0]) * duration.unitConverterToSeconds[expDurSplit[1]], "seconds");
        } else if (moment.isMoment(caExpiration)) {
            expDate = caExpiration;
        } else {
            expDate = moment("99991231T235959Z");
        }

        if (typeof issuanceDuration === "string" && duration.validDurationRegex(issuanceDuration)) {
            const expDurSplit = issuanceDuration.match(duration.durationValueUnitSplitRegex);
            assert(expDurSplit !== null);
            assert(expDurSplit!.length === 2);
            // @ts-ignore
            inactiveDate = expDate.clone().subtract(parseInt(expDurSplit![0]) * duration.unitConverterToSeconds[expDurSplit[1]], "seconds");
        } else if (moment.isMoment(issuanceDuration)) {
            inactiveDate = issuanceDuration;
        }

        const timelineStages = [
            {
                label: "Issuable Period",
                size: inactiveDate.diff(now),
                background: "#333",
                color: "#ddd",
                startLabel: <>
                    <Label>{now.format("DD/MM/YYYY")}</Label>
                    <Label>(now)</Label>
                </>,
                endLabel: undefined
            },
            {
                label: "Inactive",
                size: expDate.diff(now) - inactiveDate.diff(now),
                background: "#ddd",
                color: "#555",
                startLabel: inactiveDate.format("DD/MM/YYYY"),
                endLabel: expDate.format("DD/MM/YYYY")
            }
        ];

        setTimelineStages(timelineStages);
    }, [issuanceDuration, caExpiration]);

    return (
        <Grid item container flexDirection={"column"}>
            <Grid container columns={timelineStages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0)} spacing={1}>
                {
                    timelineStages.map((stage, idx) => (
                        <Grid key={idx} item xs={stage.size} height={"50px"}>
                            <Box sx={{ background: stage.background, color: stage.color, borderRadius: "3px", height: "100%" }}>
                                <Grid container alignItems={"center"} justifyContent={"center"} width={"100%"} height={"100%"}>
                                    <Grid item xs="auto"><Typography>{stage.label}</Typography></Grid>
                                </Grid>
                            </Box>
                        </Grid>
                    ))
                }
            </Grid>
            <Grid item container columns={timelineStages.reduce((accumulator, currentValue) => accumulator + currentValue.size, 0)} spacing={1} alignItems={"start"}>
                {
                    timelineStages.map((stage, idx) => (
                        <Grid key={idx} item xs={stage.size} container alignItems={"flex-start"} justifyContent={"space-between"}>
                            <Grid item xs="auto" container flexDirection={"column"}>
                                {
                                    stage.startLabel && (
                                        <>
                                            <Grid item><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                            <Grid item>
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
                            <Grid item xs="auto" container flexDirection={"column"} alignItems={"end"}>
                                {
                                    stage.endLabel && (
                                        <>
                                            <Grid item><Box height={"20px"} borderLeft={"1px solid #aaa"} /></Grid>
                                            <Grid item>
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
        </Grid>
    );
};
