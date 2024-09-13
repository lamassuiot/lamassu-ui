import { Box, Typography, darken, useTheme } from "@mui/material";
import { Device, DeviceEvent, DeviceEventType, DeviceStatus, deviceStatusToColor } from "ducks/features/devices/models";
import { Stage, Timeline } from "components/Charts/Timeline";
import React, { useEffect, useState } from "react";
import apicalls from "ducks/apicalls";
import moment from "moment";

interface Props {
    device: Device,
}

const stageMinSize = 10;

export const DeviceTimeline: React.FC<Props> = ({ device }) => {
    const theme = useTheme();
    const [stages, setStages] = useState<Stage[]>([]);

    const canForecast = (event: DeviceEvent) => {
        switch (event.type) {
        case DeviceEventType.Decommissioned:
        case DeviceEventType.StatusUpdated:
            // eslint-disable-next-line no-case-declarations
            const forecastableStates = [
                DeviceStatus.Active,
                DeviceStatus.AboutToExpire,
                DeviceStatus.RenewalWindow
            ];

            for (let i = 0; i < forecastableStates.length; i++) {
                if (event.description.includes(`to '${forecastableStates[i]}'`)) {
                    return true;
                }
            }

            return false;
        default:
            return true;
        }
    };

    useEffect(() => {
        const run = async () => {
            const eventKeysTs = Object.keys(device.events);
            for (let i = 0; i < eventKeysTs.length; i++) {
                const event = device.events[eventKeysTs[i]];

                let bg = "#ffffff";
                let fg = "#000000";
                let label = "";

                const startDate = moment(eventKeysTs[i]);
                let endDate = moment();
                if (i < eventKeysTs.length - 1) {
                    endDate = moment(eventKeysTs[i + 1]);
                }

                switch (event.type) {
                case DeviceEventType.Created:
                    bg = deviceStatusToColor(DeviceStatus.NoIdentity)[1];
                    fg = deviceStatusToColor(DeviceStatus.NoIdentity)[0];
                    label = "No Identity";
                    break;
                case DeviceEventType.Decommissioned:
                    bg = deviceStatusToColor(DeviceStatus.Decommissioned)[1];
                    fg = deviceStatusToColor(DeviceStatus.Decommissioned)[0];
                    label = "Decommissioned";
                    break;
                case DeviceEventType.StatusUpdated:
                    if (event.description.includes(`to '${DeviceStatus.Active}'`)) {
                        bg = deviceStatusToColor(DeviceStatus.Active)[1];
                        fg = deviceStatusToColor(DeviceStatus.Active)[0];
                        label = "Active";
                    } else if (event.description.includes(`to '${DeviceStatus.RenewalWindow}'`)) {
                        bg = deviceStatusToColor(DeviceStatus.RenewalWindow)[1];
                        fg = deviceStatusToColor(DeviceStatus.RenewalWindow)[0];
                        label = "Pending Renewal";
                    } else if (event.description.includes(`to '${DeviceStatus.AboutToExpire}'`)) {
                        bg = deviceStatusToColor(DeviceStatus.AboutToExpire)[1];
                        fg = deviceStatusToColor(DeviceStatus.AboutToExpire)[0];
                        label = "About To Expire";
                    } else if (event.description.includes(`to '${DeviceStatus.Revoked}'`)) {
                        bg = deviceStatusToColor(DeviceStatus.Revoked)[1];
                        fg = deviceStatusToColor(DeviceStatus.Revoked)[0];
                        label = "Revoked";
                    } else if (event.description.includes(`to '${DeviceStatus.Expired}'`)) {
                        bg = deviceStatusToColor(DeviceStatus.Expired)[1];
                        fg = deviceStatusToColor(DeviceStatus.Expired)[0];
                        label = "Expired";
                    }
                    break;

                default:
                    break;
                }

                if (event.type !== DeviceEventType.Created) {
                    const crt = await apicalls.cas.getCertificate(device.identity.versions[device.identity.active_version]);
                    endDate = moment(crt.valid_to);
                    const datesDiff = moment.duration(endDate.diff(startDate));
                    if (datesDiff.asMilliseconds() > 0 && i === eventKeysTs.length - 1) {
                        // divide in two. Stage until now. and "expected" until cert expiration
                        const now = moment();
                        const sizeUntilNow = moment.duration(now.diff(startDate));
                        const sizeFromNotToExpiration = moment.duration(endDate.diff(now));
                        stages.push({
                            background: bg,
                            color: fg,
                            label: <span style={{ textAlign: "center" }}>
                                <Typography fontSize={"10px"} fontWeight={"bold"}>{label}</Typography>
                                <Typography fontFamily={"monospace"} fontSize={"10px"}>{`(${sizeUntilNow.humanize()})`}</Typography>
                            </span>,
                            size: sizeUntilNow.asDays() < stageMinSize ? stageMinSize : sizeUntilNow.asDays(),
                            startLabel: <Typography fontSize={"10px"}>{startDate.format("DD/MM/YYYY HH:mm")}</Typography>,
                            endLabel: undefined
                        });
                        if (canForecast(event)) {
                            stages.push({
                                background: `repeating-linear-gradient(
                                     45deg,
                                     ${bg},
                                     ${bg} 10px,
                                     ${darken(bg, 0.4)} 10px,
                                     ${darken(bg, 0.4)} 30px
                                   );`,
                                color: fg,
                                label: <span style={{ textAlign: "center" }}>
                                    <Typography fontSize={"10px"} fontWeight={"bold"}>{label}</Typography>
                                    <Typography fontFamily={"monospace"} fontSize={"10px"}>{`(${sizeFromNotToExpiration.humanize()})`}</Typography>
                                </span>,
                                size: sizeFromNotToExpiration.asDays() < stageMinSize ? stageMinSize : sizeFromNotToExpiration.asDays(),
                                startLabel: <p style={{ fontWeight: "bold", color: theme.palette.primary.main, margin: 0, fontSize: "0.85rem" }}>now</p>,
                                endLabel: i !== eventKeysTs.length - 1 ? undefined : <Typography fontSize={"10px"}>{endDate.format("DD/MM/YYYY HH:mm")}</Typography>
                            });
                        }
                    } else {
                        stages.push({
                            background: bg,
                            color: fg,
                            label: <span style={{ textAlign: "center" }}>
                                <Typography fontSize={"10px"} fontWeight={"bold"}>{label}</Typography>
                                <Typography fontFamily={"monospace"} fontSize={"10px"}>{`(${datesDiff.humanize()})`}</Typography>
                            </span>,
                            size: datesDiff.asDays() < stageMinSize ? stageMinSize : datesDiff.asDays(),
                            startLabel: <Typography fontSize={"10px"}>{startDate.format("DD/MM/YYYY HH:mm")}</Typography>,
                            endLabel: i !== eventKeysTs.length - 1 ? undefined : <Typography fontSize={"10px"}>{endDate.format("DD/MM/YYYY HH:mm")}</Typography>
                        });
                    }
                } else {
                    const datesDiff = moment.duration(endDate.diff(startDate));

                    stages.push({
                        background: bg,
                        color: fg,
                        label: <span style={{ textAlign: "center" }}>
                            <Typography fontSize={"10px"} fontWeight={"bold"}>{label}</Typography>
                            <Typography fontFamily={"monospace"} fontSize={"10px"}>{`(${datesDiff.humanize()})`}</Typography>
                        </span>,
                        size: datesDiff.asDays() < stageMinSize ? stageMinSize : datesDiff.asDays(),
                        startLabel: <Typography fontSize={"10px"}>{startDate.format("DD/MM/YYYY HH:mm")}</Typography>,
                        endLabel: undefined
                    });
                }
            }

            const getBaseLog = (x: number, y: number) => {
                return Math.log(y) / Math.log(x);
            };
            // apply logarithmic scale
            for (let i = 0; i < stages.length; i++) {
                const logSize = getBaseLog(1.4, stages[i].size);
                if (logSize > stageMinSize) {
                    stages[i].size = logSize;
                }
            }

            setStages([...stages]);
        };
        run();
    }, []);

    const events = [];

    console.log(stages);

    return (
        <Box sx={{ display: "flex", flexDirection: "row-reverse", width: "100%" }}>
            <Box sx={{ width: "100px", flex: 1, overflowX: "auto" }}>
                <Timeline stages={stages} useColumns={false} />
            </Box>
        </Box>
    );
};
