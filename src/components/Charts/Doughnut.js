import React from "react"
import { Grid, Paper, Typography } from "@mui/material"
import { Box } from "@mui/system"
import { Doughnut as DoughnutChart } from "react-chartjs-2"
import { Chart, registerables } from "chart.js"
import CachedIcon from '@mui/icons-material/Cached';
import IconButton from '@mui/material/IconButton';
import { numberToHumanReadableString } from "components/utils/NumberToHumanReadableString"

Chart.register(...registerables)

export const Doughnut = ({ dataset, small = true, title, subtitle, primaryStat, percentage = true, statLabel, cardColor, primaryTextColor, secondaryTextColor, ...props }) => {
  const localDataset = dataset.map(dataCategory => dataCategory.value)
  const localLabels = dataset.map(dataCategory => dataCategory.label)
  const localColors = dataset.map(dataCategory => dataCategory.color)

  const data = {
    datasets: [{
      data: localDataset
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: localLabels

  }

  const options = {
    cutout: small ? 90 : 120,
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
  }

  return (
    <Box sx={{ width: small ? "250px" : "360px", height: "fit-content", borderRadius: "15px", padding: "20px", bgcolor: cardColor }} component={Paper} {...props}>
      <Grid container justifyContent="space-between" alignItems="start">
        <Grid item xs="auto" container flexDirection="column">
          <Grid item xs="auto">
            <Typography variant="button" fontWeight="bold" sx={{ color: primaryTextColor }}>{title}</Typography>
          </Grid>
          {
            subtitle !== "" && (
              <Grid item xs="auto">
                <Typography fontSize="13px" fontStyle="italic" sx={{ color: primaryTextColor }}>{subtitle}</Typography>
              </Grid>
            )
          }
        </Grid>
        {/* <Grid item xs="auto">
          <IconButton size="small" sx={{ color: primaryTextColor }} onClick={onRefresh}>
            <CachedIcon />
          </IconButton>
        </Grid> */}
      </Grid>
      <Box sx={{ position: "relative", marginTop: "0px" }} >
        <Box sx={{}} >
          <DoughnutChart data={data} options={options} style={{ zIndex: 10, position: "relative" }} />
        </Box>
        <Box sx={{ marginTop: small ? "-180px" : "-215px", marginBottom: small ? "60px" : "90px", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
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
      <Grid container spacing={1}>
        {
          dataset.map((dataCategory, idx) => {
            return (
              <Grid item xs={6} container alignItems={"center"} key={idx}>
                <Box sx={{ bgcolor: dataCategory.color, height: "10px", width: "10px", borderRadius: "50%", marginRight: "5px" }} />
                <Typography sx={{ fontSize: "13px", color: primaryTextColor }}>{`${dataCategory.label} [${numberToHumanReadableString(dataCategory.value, ".")}]`}</Typography>
              </Grid>
            )
          })
        }
      </Grid>
    </Box>
  )
}
