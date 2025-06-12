import { Box } from "@mui/system";
import { Chart, registerables } from "chart.js";
import { Doughnut as DoughnutChart, getElementAtEvent } from "react-chartjs-2";
import { Paper, Typography } from "@mui/material";
import { numberToHumanReadableString } from "utils/string-utils";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import React, { useRef } from "react";

Chart.register(...registerables);

interface DoughnutProps {
    dataset: { label: string, value: number, color: string }[]
    small?: boolean
    title: string
    subtitle: string
    primaryStat: string | number
    statLabel: string
    cardColor: string
    primaryTextColor: string
    secondaryTextColor: string
    percentage?: boolean
    onClick: (ev: any) => void
}

export const Doughnut: React.FC<DoughnutProps> = ({ dataset, small = true, title, subtitle, primaryStat, percentage = true, statLabel, cardColor, primaryTextColor, secondaryTextColor, onClick = (ev) => { }, ...props }) => {
    const localDataset = dataset.map(dataCategory => dataCategory.value);
    const localLabels = dataset.map(dataCategory => dataCategory.label);
    const localColors = dataset.map(dataCategory => dataCategory.color);
    const chartRef = useRef();

    const data = {
        datasets: [{
            data: localDataset
        }],

        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: localLabels

    };

    // const options: ChartOptions<"doughnut"> = {
    const options: any = {
        cutout: "90%",
        borderWidth: 0,
        backgroundColor: localColors,
        hoverBackgroundColor: localColors,
        hoverBorderColor: localColors,
        borderRadius: 0,
        hoverBorderWidth: 10,
        hoverBorderJoinStyle: "miter",
        layout: {
            padding: {
                left: small ? 20 : 40,
                right: small ? 20 : 40
            }
        },
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: false
            },
            tooltip: {
                enabled: true
            }
        }
    };

    return (
        <Box sx={{ width: "calc(100% - 40px)", height: "fit-content", borderRadius: "15px", padding: "20px", bgcolor: cardColor }} component={Paper} {...props}>
            <Grid container justifyContent="space-between" alignItems="start">
                <Grid xs="auto" container flexDirection="column">
                    <Grid xs="auto">
                        <Typography variant="button" fontWeight="bold" sx={{ color: primaryTextColor }}>{title}</Typography>
                    </Grid>
                    {
                        subtitle !== "" && (
                            <Grid xs="auto">
                                <Typography fontSize="13px" fontStyle="italic" sx={{ color: primaryTextColor }}>{subtitle}</Typography>
                            </Grid>
                        )
                    }
                </Grid>
            </Grid>
            <Box sx={{ position: "relative", marginTop: "0px" }} >
                <Box sx={{ display: "flex", justifyContent: "center" }} >
                    <DoughnutChart ref={chartRef} data={data} options={options} style={{ zIndex: 10, position: "relative" }} onClick={ev => {
                        onClick(getElementAtEvent(chartRef.current!, ev));
                    }} />
                </Box>
                <Box sx={{ marginTop: small ? "-180px" : "-55%", marginBottom: "35%", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <Box style={{ display: "flex", alignItems: "end" }}>
                        <Typography sx={{ fontSize: "35px", fontWeight: "600", color: primaryTextColor }}>{primaryStat}</Typography>
                        {
                            percentage && (
                                <Typography sx={{ fontSize: "22px", fontWeight: "600", color: secondaryTextColor, lineHeight: "45px" }}>%</Typography>
                            )
                        }
                    </Box>
                    <Typography sx={{ fontSize: "18px", fontWeight: "400", width: "50%", textTransform: "uppercase", color: secondaryTextColor, textAlign: "center" }}>{statLabel}</Typography>
                </Box>
            </Box>
            <Grid container spacing={1} padding={"20px"}>
                {
                    dataset.map((dataCategory, idx) => {
                        return (
                            <Grid xs={6} container alignItems={"center"} key={idx}>
                                <Box sx={{ bgcolor: dataCategory.color, height: "10px", width: "10px", borderRadius: "50%", marginRight: "5px" }} />
                                <Typography sx={{ fontSize: "13px", color: primaryTextColor }}>{`${dataCategory.label} [${numberToHumanReadableString(dataCategory.value, ".")}]`}</Typography>
                            </Grid>
                        );
                    })
                }
            </Grid>
        </Box>
    );
};
