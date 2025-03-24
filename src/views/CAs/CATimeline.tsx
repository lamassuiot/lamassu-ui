import * as duration from "utils/duration";
import { Timeline } from "components/Charts/Timeline";
import { Typography, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import moment, { Moment } from "moment";

interface Props {
    issuanceDuration: string | Moment
    caIssuedAt: Moment
    caExpiration: string | Moment
}

export const CATimeline: React.FC<Props> = ({ issuanceDuration, caIssuedAt, caExpiration }) => {
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
        let inactiveDate = caIssuedAt.clone();
        let expDate = caIssuedAt.clone();

        if (typeof caExpiration === "string" && duration.validDurationRegex(caExpiration)) {
            const expDurSplit = caExpiration.match(duration.durationValueUnitSplitRegex);

            if (expDurSplit === null) throw new Error("expDurSplit no debe ser null");
            if (expDurSplit.length % 2 !== 0) throw new Error("expDurSplit debe tener una longitud par");

            for (let i = 0; i < expDurSplit.length; i = i + 2) {
                const tupleV = expDurSplit[i];
                const tupleU = expDurSplit[i + 1];
                // @ts-ignore
                expDate.add(parseInt(tupleV) * duration.unitConverterToSeconds[tupleU], "seconds");
            }
        } else if (moment.isMoment(caExpiration)) {
            expDate = caExpiration;
        } else {
            expDate = moment("99991231T235959Z");
        }

        if (typeof issuanceDuration === "string" && duration.validDurationRegex(issuanceDuration)) {
            const expDurSplit = issuanceDuration.match(duration.durationValueUnitSplitRegex);
            inactiveDate = expDate.clone();

            if (expDurSplit === null) throw new Error("expDurSplit no debe ser null");
            if (expDurSplit.length % 2 !== 0) throw new Error("expDurSplit debe tener una longitud par");

            for (let i = 0; i < expDurSplit.length; i = i + 2) {
                const tupleV = expDurSplit[i];
                const tupleU = expDurSplit[i + 1];
                // @ts-ignore
                inactiveDate.subtract(parseInt(tupleV) * duration.unitConverterToSeconds[tupleU], "seconds");
            }
        } else if (moment.isMoment(issuanceDuration)) {
            inactiveDate = issuanceDuration;
        }

        const timelineStages = [
            {
                label: "Issuable Period",
                size: inactiveDate.diff(caIssuedAt, "year"),
                background: theme.palette.success.main,
                color: "#fff",
                startLabel: <>
                    <Typography>{caIssuedAt.format("DD/MM/YYYY")}</Typography>
                </>,
                endLabel: undefined
            },
            {
                label: "Inactive",
                size: expDate.diff(caIssuedAt, "year") - inactiveDate.diff(caIssuedAt, "year"),
                background: theme.palette.warning.main,
                color: "#333",
                startLabel: inactiveDate.format("DD/MM/YYYY"),
                endLabel: expDate.format("DD/MM/YYYY")
            }
        ];

        const stageMinSize = 15;

        const getBaseLog = (x: number, y: number) => {
            return Math.log(y) / Math.log(x);
        };
        // apply logarithmic scale
        for (let i = 0; i < timelineStages.length; i++) {
            const logSize = getBaseLog(1.1, timelineStages[i].size);
            // console.log(timelineStages[i].size, logSize);

            if (logSize > stageMinSize) {
                timelineStages[i].size = logSize;
            } else {
                timelineStages[i].size = stageMinSize;
            }
        }
        setTimelineStages(timelineStages);
    }, [issuanceDuration, caExpiration]);

    return (
        <Timeline stages={timelineStages} />
    );
};
