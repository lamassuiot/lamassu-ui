import { DeviceStats, DeviceStatus, deviceStatusToColor } from "ducks/features/devices/models";
import { Doughnut } from "components/Charts/Doughnut";
import { capitalizeFirstLetter } from "utils/string-utils";
import { useNavigate } from "react-router-dom";
import { useMediaQuery, useTheme } from "@mui/material";
import React from "react";

interface Props {
    deviceStats : DeviceStats
    style?: React.CSSProperties
}

export const DeviceStatusChart : React.FC<Props> = ({ deviceStats, ...props }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isMobileScreen = useMediaQuery(theme.breakpoints.down("md"));

    const totalDevices = deviceStats.total;
    const enablePrimaryStat = totalDevices !== 0;
    const primaryStat = enablePrimaryStat ? Math.floor(deviceStats.status_distribution[DeviceStatus.Active] * 100 / totalDevices) : "-";

    const dataset: any = [];
    const status = [
        DeviceStatus.NoIdentity,
        DeviceStatus.Active,
        DeviceStatus.RenewalWindow,
        DeviceStatus.AboutToExpire,
        DeviceStatus.Expired,
        DeviceStatus.Revoked,
        DeviceStatus.Decommissioned
    ];

    status.map((statusKey) => {
        // @ts-ignore
        const color = deviceStatusToColor(statusKey as typeof DeviceStatus);
        dataset.push({
            label: (
                capitalizeFirstLetter(statusKey)
            ),
            value: deviceStats.status_distribution[statusKey],
            color: Array.isArray(color) ? color[1] : color
        });
        return statusKey;
    });

    return (
        <Doughnut
            small={isMobileScreen}
            dataset={dataset}
            title="Device Provisioning Status"
            subtitle={""}
            onClick={(ev) => {
                if (ev.length > 0) {
                    navigate(`/devices?filter=status[equal]${status[ev[0].index]}`);
                }
            }}
            primaryStat={primaryStat}
            statLabel={"Provisioned Devices"}
            percentage={enablePrimaryStat}
            cardColor={theme.palette.primary.main}
            primaryTextColor={theme.palette.primary.contrastText}
            secondaryTextColor={theme.palette.primary.contrastText}
            {...props}
        />
    );
};
