import React, { useState } from "react"
import * as Cg from "react-icons/cg"
import { DynamicIcon } from "./DynamicIcon"
import { Button, Grid, Menu, Paper, TextField } from "@mui/material"

import { Box } from "@mui/system"
import { useTheme } from "@emotion/react"

const iconsFamily = [
  // { prefix: "Ai", import: Ai },
  // { prefix: "Bs", import: Bs },
  // { prefix: "Bi", import: Bi },
  // { prefix: "Di", import: Di },
  // { prefix: "Fi", import: Fi },
  // // { prefix: "Fc", import: Fc },
  // { prefix: "Fa", import: Fa },
  // { prefix: "Gi", import: Gi },
  // { prefix: "Go", import: Go },
  // { prefix: "Gr", import: Gr },
  // { prefix: "Hi", import: Hi },
  // { prefix: "Io", import: Io },
  // { prefix: "Io", import: Io5 },
  // { prefix: "Md", import: Md },
  // { prefix: "Ri", import: Ri },
  // // { prefix: "Si", import: Si },
  // { prefix: "Ti", import: Ti },
  // { prefix: "Vsc", import: Vsc },
  { prefix: "Cg", import: Cg }
]

var iconStrings = []
iconsFamily.forEach(iconFamily => {
  const icons = Object.keys(iconFamily.import)
  icons.forEach(icon => iconStrings.push(iconFamily.prefix + "/" + icon))
})

var iconStrings = iconStrings.filter(function (str) { return str.toLowerCase().includes("smart".toLowerCase()) })

export function IconPicker({ value, onChange, enableSearchBar = false, ...props }) {
  const theme = useTheme()

  const [query, setQuery] = useState(null)
  const [filteredIcons, setFilteredIcons] = useState(iconStrings)
  const [typingTimer, setTypingTimer] = useState(null)
  const [doneTypingInterval, setDoneTypingInterval] = useState(2000)
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClick = (event) => {
    if (anchorEl !== event.currentTarget) {
      setAnchorEl(event.currentTarget)
    }
  }

  const handleClose = (event) => {
    setAnchorEl(null)
  }

  const handleIconClick = (iconName) => {
    if (onChange) {
      onChange(iconName)
    }
  }

  const filterIcons = () => {
    if (query === "" || query === null) {
      setFilteredIcons(iconStrings)
    } else {
      const filtered = iconStrings.filter(function (str) { return str.toLowerCase().includes(query.toLowerCase()) })
      setFilteredIcons(filtered)
    }
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {
        value && (
          <DynamicIcon size={30} icon={value} color={theme.palette.mode === "light" ? "#555" : "#fff"}/>
        )
      }
      <Menu
        style={{ marginTop: 1, width: "770px", borderRadius: 0 }}
        id="simple-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <div style={{ padding: 20 }}>
          {
            enableSearchBar && (
              <div style={{ marginBottom: 20 }}>
                <TextField
                  id="query"
                  label=""
                  value={query}
                  style={{ width: "100%" }}
                  // inputProps={{ style: { color: theme.palette.dashboard.card.contrast } }}
                  onKeyDown={clearTimeout(typingTimer)}
                  onKeyUp={() => {
                    clearTimeout(typingTimer)
                    setTypingTimer(setTimeout(filterIcons(), doneTypingInterval))
                  }}
                  onChange={(ev) => { setQuery(ev.target.value) }}
                />
              </div>
            )
          }
          <Grid container gap={2}>
            {filteredIcons.map((iconName) => {
              return (
                <Grid key={iconName} item xs="auto" sx={{ padding: "10px", cursor: "pointer", background: theme.palette.background.lightContrast }} container alighItems="center" justifyContent="center" onClick={() => { handleIconClick(iconName); handleClose() }} component={Paper}>
                  <DynamicIcon icon={iconName} size={30}/>
                </Grid>
              )
            })}
          </Grid>
        </div>
      </Menu>
      <Button variant="text" onClick={ev => handleClick(ev)} sx={{ marginLeft: "15px" }}>
        Icon Selector
      </Button>
    </Box>
  )
}
