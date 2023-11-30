import { Doughnut } from "components/Charts/Doughnut";
import React from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material";
import { DeviceStats, DeviceStatus, deviceStatusToColor } from "ducks/features/devices/models";
import { capitalizeFirstLetter } from "ducks/reducers_utils";

interface Props {
    deviceStats : DeviceStats
    style?: React.CSSProperties
}

export const DeviceStatusChart : React.FC<Props> = ({ deviceStats, ...props }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const totalDevices = deviceStats.total;

    const enablePrimaryStat = totalDevices !== 0;

    const primaryStat = enablePrimaryStat ? Math.floor(deviceStats.status_distribution[DeviceStatus.Active] * 100 / totalDevices) : "-";

    const dataset: any = [];
    [
        DeviceStatus.NoIdentity,
        DeviceStatus.Active,
        DeviceStatus.RenewalWindow,
        DeviceStatus.AboutToExpire,
        DeviceStatus.Expired,
        DeviceStatus.Revoked,
        DeviceStatus.Decommissioned
    ].map((statusKey) => {
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

    console.log(dataset);

    return (

        <Doughnut
            small={false}
            dataset={dataset}
            title="Device Provisioning Status"
            subtitle={""}
            onRefresh={() => {
            }}
            primaryStat={primaryStat}
            statLabel={"Provisioned Devices"}
            percentage={enablePrimaryStat}
            cardColor={theme.palette.homeCharts.deviceStatusCard.primary}
            primaryTextColor={theme.palette.homeCharts.deviceStatusCard.text}
            secondaryTextColor={theme.palette.homeCharts.deviceStatusCard.textSecondary}
            {...props}
        />
    );
};
