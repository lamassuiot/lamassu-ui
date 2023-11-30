import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material";
import Label from "components/LamassuComponents/dui/typographies/Label";
import * as duration from "components/utils/duration";
import moment, { Moment } from "moment";
import * as assert from "assert";
import { Timeline } from "components/Charts/Timeline";

interface Props {
    issuanceDuration: string | Moment
    caExpiration: string | Moment
}

export const CATimeline: React.FC<Props> = ({ issuanceDuration, caExpiration }) => {
    const theme = useTheme();
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
            assert.ok(expDurSplit !== null);
            assert.ok(expDurSplit!.length === 2);
            // @ts-ignore
            expDate.add(parseInt(expDurSplit![0]) * duration.unitConverterToSeconds[expDurSplit[1]], "seconds");
        } else if (moment.isMoment(caExpiration)) {
            expDate = caExpiration;
        } else {
            expDate = moment("99991231T235959Z");
        }

        if (typeof issuanceDuration === "string" && duration.validDurationRegex(issuanceDuration)) {
            const expDurSplit = issuanceDuration.match(duration.durationValueUnitSplitRegex);
            assert.ok(expDurSplit !== null);
            assert.ok(expDurSplit!.length === 2);
            // @ts-ignore
            inactiveDate = expDate.clone().subtract(parseInt(expDurSplit![0]) * duration.unitConverterToSeconds[expDurSplit[1]], "seconds");
        } else if (moment.isMoment(issuanceDuration)) {
            inactiveDate = issuanceDuration;
        }

        const timelineStages = [
            {
                label: "Issuable Period",
                size: inactiveDate.diff(now),
                background: theme.palette.chartsColors.green,
                color: "#fff",
                startLabel: <>
                    <Label>{now.format("DD/MM/YYYY")}</Label>
                    <Label>(now)</Label>
                </>,
                endLabel: undefined
            },
            {
                label: "Inactive",
                size: expDate.diff(now) - inactiveDate.diff(now),
                background: theme.palette.chartsColors.yellow,
                color: "#333",
                startLabel: inactiveDate.format("DD/MM/YYYY"),
                endLabel: expDate.format("DD/MM/YYYY")
            }
        ];

        setTimelineStages(timelineStages);
    }, [issuanceDuration, caExpiration]);

    return (
        <Timeline stages={timelineStages} />
    );
};
