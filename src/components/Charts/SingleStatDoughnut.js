import React from "react"
import { Grid, Paper, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Doughnut as DoughnutChart } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import { numberToHumanReadableString } from "components/utils/NumberToHumanReadableString"

Chart.register(...registerables)

export const SingleStatDoughnut = ({ statNumber, total, color = "green", label = "", ...props }) => {
  // const localDataset = dataset.map(dataCategory => dataCategory.value)
  // const localLabels = dataset.map(dataCategory => dataCategory.label)
  // const localColors = dataset.map(dataCategory => dataCategory.color)

  let percentageStat = 0;
  if (statNumber > 0) {
    percentageStat = Math.round(statNumber * 100 / total);
  }

  const data = {
    datasets: [{
      data: [statNumber, total - statNumber]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: ["", ""]
  }

  const options = {
    cutout: 25,
    borderWidth: 0,
    backgroundColor: [color, "#EFF0F2"],
    hoverBackgroundColor: [color, "#EFF0F2"],
    hoverBorderColor: [color, "#EFF0F2"],
    borderRadius: 0,
    hoverBorderWidth: 3,
    hoverBorderJoinStyle: "miter",
    layout: {
      padding: {
        left: 3,
        right: 3,
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
  }

  return (
    <Box sx={{ position: "relative", marginTop: "0px" }} >
      <Box sx={{ width: "75px", height: "fit-content" }} {...props}>
        <DoughnutChart data={data} options={options} style={{ zIndex: 10, position: "relative" }} />
      </Box>
      <Box sx={{ marginTop: "-58px", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <Box style={{ display: "flex", alignItems: "center" }}>
          <Typography sx={{ fontSize: "18px", fontWeight: "400"}}>{percentageStat}</Typography>
          <Typography sx={{ fontSize: "14px", fontWeight: "400", lineHeight: "45px" }}>%</Typography>
        </Box>
        <Typography sx={{ marginTop: "12px", fontSize: "12px", fontWeight: "400", width: "auto", textTransform: "uppercase", textAlign: "center" }}>{label}</Typography>
      </Box>
    </Box>


  )
}
