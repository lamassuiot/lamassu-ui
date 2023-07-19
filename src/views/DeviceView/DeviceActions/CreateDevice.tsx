/* eslint-disable no-else-return */
import React, { useEffect, useState } from "react";
import { Button, Divider, FormControl, Grid, IconButton, InputLabel, Menu, MenuItem, Paper, Select, Skeleton, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { IconPicker } from "components/IconDisplayer/IconPicker";
import TagsInput from "components/LamassuComponents/TagsInput";
import { BlockPicker } from "react-color";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import * as devicesSelector from "ducks/features/devices/reducer";
import * as devicesAction from "ducks/features/devices/actions";
import * as dmsActions from "ducks/features/dms-enroller/actions";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import { Device } from "ducks/features/devices/models";
import CachedIcon from "@mui/icons-material/Cached";
import { ORequestStatus, ORequestType } from "ducks/reducers_utils";
import { useNavigate } from "react-router-dom";

interface Props {
}

export const CreateDevice: React.FC<Props> = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const requestStatus = useAppSelector((state) => devicesSelector.getRequestStatus(state));
    const dmsRequestStatus = useAppSelector((state) => dmsSelector.getRequestStatus(state));
    const dmsList = useAppSelector((state) => dmsSelector.getDMSs(state));

    useEffect(() => {
        dispatch(dmsActions.getDMSListAction.request({
            offset: 0,
            limit: 5,
            sortField: "id",
            sortMode: "asc",
            filterQuery: []
        }));
    }, []);

    const [device, setDevice] = useState<Device>(new Device({ id: "", icon_name: "Cg/CgSmartphoneChip", icon_color: "#0068D1", alias: "", tags: [], description: "" }));
    const [anchorElColorPicker, setAnchorElColorPicker] = useState(null);

    useEffect(() => {
        if (requestStatus.status === ORequestStatus.Success && requestStatus.type === ORequestType.Create) {
            navigate("/devmanager");
        }
    }, [requestStatus]);

    const handleClickColorPicker = (event: any) => {
        if (anchorElColorPicker !== event.currentTarget) {
            setAnchorElColorPicker(event.currentTarget);
        }
    };

    const handleCloseColorPicker = (event: any) => {
        setAnchorElColorPicker(null);
    };

    return (
        <Box sx={{ height: "100%" }} component={Paper}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "40px 40px 0 40px" }}>
                    <Grid item container spacing={2} justifyContent="flex-start">
                        <Grid item xs={12}>
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Register a new Device</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>To register a new Device instance, please provide the apropiate information</Typography>
                    </Grid>
                </Box>
                <Divider sx={{ marginTop: "15px" }} />
                <Box style={{ padding: "20px 40px", flexGrow: 1, overflowY: "auto", height: "100%" }}>
                    <Grid item xs={12} container spacing={2}>
                        <Grid item xs={12} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <TextField
                                            variant="standard"
                                            required={true}
                                            error={device.id === ""}
                                            label="Device ID"
                                            fullWidth
                                            value={device.id}
                                            onChange={(ev: any) => { setDevice((prevData: any) => ({ ...prevData, id: ev.target.value })); }}
                                            InputProps={{
                                                endAdornment: (
                                                    <Tooltip title="Generate UUID">
                                                        <IconButton onClick={(ev) => {
                                                            setDevice((prevData: any) => ({ ...prevData, id: uuidv4() }));
                                                        }}>
                                                            <CachedIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )
                                            }} />
                                    )
                            }
                        </Grid>
                        <Grid item xs={6} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <TextField
                                            variant="standard"
                                            label="Device Alias"
                                            value={device!.alias}
                                            fullWidth
                                            onChange={(ev: any) => { setDevice((prevData: any) => ({ ...prevData, alias: ev.target.value })); }}
                                        />
                                    )
                            }
                        </Grid>

                        <Grid item xs={6} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <FormControl
                                            variant="standard"
                                            fullWidth
                                            required={true}
                                            error={device.dms_name === ""}
                                        >
                                            <InputLabel>DMS</InputLabel>
                                            <Select
                                                label="Operand"
                                                value={device.dms_name}
                                                onChange={(ev: any) => { setDevice((prevData: any) => ({ ...prevData, dms_name: ev.target.value })); }}
                                                renderValue={(dmsName) => <Box sx={{ display: "flex", alignItems: "center" }}>
                                                    <Typography>{`${dmsList.filter(dms => dms.name === dmsName)[0].name}`}</Typography>
                                                    <Typography sx={{ marginLeft: "5px", fontSize: "12px", lineHeight: "10px" }}>{`#${dmsName}`}</Typography>
                                                </Box>}
                                            >
                                                {
                                                    dmsList.map(dms =>
                                                        <MenuItem key={dms.name} value={dms.name} sx={{ display: "flex" }}>
                                                            <Typography>{`${dms.name}`}</Typography>
                                                            <Typography sx={{ marginLeft: "5px", fontSize: "12px" }}>{`#${dms.name}`}</Typography>
                                                        </MenuItem>
                                                    )
                                                }
                                            </Select>
                                        </FormControl>
                                    )
                            }
                        </Grid>
                        <Grid item xs={12} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <TextField
                                            variant="standard"
                                            value={device!.description}
                                            fullWidth
                                            label="Description"
                                            onChange={(ev: any) => { setDevice((prevData: any) => ({ ...prevData, description: ev.target.value })); }}
                                        />
                                    )
                            }
                        </Grid>
                        <Grid item xs={12} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <TagsInput
                                            tags={device!.tags}
                                            placeholder=""
                                            label=""
                                            onChange={(tags: any) => { setDevice((prevData: any) => ({ ...prevData, tags: tags })); }}
                                        />
                                    )
                            }
                        </Grid>
                        <Grid item xs={12} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <IconPicker value={device!.icon_name} onChange={(newIcon: any) => { setDevice((prevData: any) => ({ ...prevData, icon_name: newIcon })); }} />
                                    )
                            }
                        </Grid>
                        <Grid item xs={12} container alignItems={"center"}>
                            {
                                dmsRequestStatus.isLoading
                                    ? (
                                        <Skeleton variant="rectangular" width={"100%"} height={22} />
                                    )
                                    : (
                                        <>
                                            <Box onClick={ev => handleClickColorPicker(ev)} sx={{ width: 30, height: 30, borderRadius: 30, cursor: "pointer", background: device!.icon_color }} />
                                            <Menu
                                                sx={{ marginTop: 1, width: "770px", borderRadius: 0 }}
                                                MenuListProps={{ style: { padding: 0 } }}
                                                id="simple-menu"
                                                anchorEl={anchorElColorPicker}
                                                open={Boolean(anchorElColorPicker)}
                                                onClose={handleCloseColorPicker}
                                            >
                                                <BlockPicker triangle="hide" color={device!.icon_color} onChange={(newColor: any) => { setDevice((prevState: any) => ({ ...prevState, icon_color: newColor.hex })); }} />
                                            </Menu>
                                        </>
                                    )
                            }
                        </Grid>
                        <Grid item xs={12} container>
                            <Box sx={{ marginTop: "20px" }}>
                                <Button
                                    variant="contained"
                                    disabled={
                                        device.id === "" || device.dms_name === undefined
                                    }
                                    onClick={() => {
                                        dispatch(devicesAction.registerDeviceAction.request({
                                            deviceID: device.id,
                                            deviceAlias: device.alias,
                                            deviceDescription: device.description,
                                            tags: device.tags,
                                            icon: device.icon_name,
                                            color: device.icon_color,
                                            dmsName: device.dms_name
                                        }));
                                    }}
                                >Register Device</Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>

    );
};

function uuidv4 () {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0; const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
