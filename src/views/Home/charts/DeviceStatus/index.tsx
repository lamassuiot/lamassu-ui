import { Doughnut } from "components/Charts/Doughnut";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useTheme } from "@mui/material";
import moment from "moment";

export const DeviceStatusChart = ({ ...props }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    // const deviceManagerStats = useAppSelector((state) => devicesSelector.getDevicesStats(state));
    // const deviceManagerStats = useAppSelector((state) => devicesSelector.getDevicesStats(state));
    const refreshAction = (forceRefresh: boolean) => {
        // dispatch(devicesAction.getStatsAction.request({ force: forceRefresh }));
    };

    useEffect(() => {
        refreshAction(false);
    }, []);

    const totalDevices = 0;
    // deviceManagerStats.devices_stats.forEach((st) => {
    //     totalDevices += st;
    // });

    const enablePrimaryStat = totalDevices !== 0;
    // const primaryStat = enablePrimaryStat ? Math.floor(deviceManagerStats.devices_stats.get(DeviceStatus.Active)! * 100 / totalDevices) : "-";
    const primaryStat = "-";

    const dataset: any = [];
    // deviceManagerStats.devices_stats.forEach((value, key) => {
    //     // dataset.push({
    //     //     label: capitalizeFirstLetter(key),
    //     //     value: value,
    //     //     color: deviceStatusToColorWithTheme(key, theme)
    //     // });
    // });

    return (

        <Doughnut
            small={false}
            dataset={dataset}
            title="Device Provisioning Status"
            subtitle={`Last update: ${moment().format("DD/MM/YYYY HH:mm")}`}
            onRefresh={() => {
                refreshAction(true);
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
