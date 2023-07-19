/* eslint-disable no-else-return */
import React, { useEffect, useState } from "react";
import { Button, Divider, Grid, Menu, Paper, Skeleton, TextField, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import { IconPicker } from "components/IconDisplayer/IconPicker";
import TagsInput from "components/LamassuComponents/TagsInput";
import { BlockPicker } from "react-color";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import * as devicesAction from "ducks/features/devices/actions";
import * as devicesSelector from "ducks/features/devices/reducer";
import { Device } from "ducks/features/devices/models";

interface Props {
    deviceID: string
}
export const EditDevice: React.FC<Props> = ({ deviceID }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const requestStatus = useAppSelector((state) => devicesSelector.getRequestStatus(state));
    const device = useAppSelector((state) => devicesSelector.getDevice(state, deviceID));

    useEffect(() => {
        dispatch(devicesAction.getDeviceByIDAction.request({ deviceID: deviceID }));
    }, []);

    const [editableDevice, setEditableDevice] = useState<Device>();
    const [anchorElColorPicker, setAnchorElColorPicker] = useState(null);

    const handleClickColorPicker = (event: any) => {
        if (anchorElColorPicker !== event.currentTarget) {
            setAnchorElColorPicker(event.currentTarget);
        }
    };

    const handleCloseColorPicker = (event: any) => {
        setAnchorElColorPicker(null);
    };
    useEffect(() => {
        setEditableDevice(device);
    }, [device]);

    if (!requestStatus.isLoading && editableDevice === undefined) {
        return <Typography sx={{ marginTop: "10px", fontStyle: "italic" }}>Device with ID {deviceID} does not exist</Typography>;
    } else {
        return (
            <Box sx={{ height: "100%" }} component={Paper}>
                <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box style={{ padding: "40px 40px 0 40px" }}>
                        <Grid item container spacing={2} justifyContent="flex-start">
                            <Grid item xs={12}>
                                <Box style={{ display: "flex", alignItems: "center" }}>
                                    <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>Edit Device</Typography>
                                </Box>
                            </Grid>
                        </Grid>
                        <Grid>
                            <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>Edit the apropiate information and save your changes</Typography>
                        </Grid>
                    </Box>
                    <Divider sx={{ marginTop: "15px" }}/>
                    <Box style={{ padding: "20px", flexGrow: 1, overflowY: "auto", height: "100%" }}>
                        <Grid container>
                            <Grid item xs={6} container sx={{ padding: "20px" }} spacing={2}>
                                <Grid item xs={12} container alignItems={"center"}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"100%"} height={22} />
                                            )
                                            : (
                                                <TextField
                                                    variant="standard"
                                                    label="Device ID"
                                                    value={editableDevice!.id}
                                                    fullWidth
                                                    disabled
                                                />
                                            )
                                    }
                                </Grid>
                                <Grid item xs={12} container alignItems={"center"}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"100%"} height={22} />
                                            )
                                            : (
                                                <TextField
                                                    variant="standard"
                                                    value={editableDevice!.alias}
                                                    fullWidth
                                                    label="Device Alias"
                                                    onChange={(ev: any) => { setEditableDevice((prevData: any) => ({ ...prevData, alias: ev.target.value })); }}
                                                />
                                            )
                                    }
                                </Grid>
                                <Grid item xs={12} container alignItems={"center"}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"100%"} height={22} />
                                            )
                                            : (
                                                <TextField
                                                    variant="standard"
                                                    value={editableDevice!.description}
                                                    fullWidth
                                                    label={"Description"}
                                                    onChange={(ev: any) => { setEditableDevice((prevData: any) => ({ ...prevData, description: ev.target.value })); }}

                                                />
                                            )
                                    }
                                </Grid>
                                <Grid item xs={12} container alignItems={"center"}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"100%"} height={22} />
                                            )
                                            : (
                                                <TagsInput
                                                    tags={editableDevice!.tags}
                                                    placeholder=""
                                                    label=""
                                                    onChange={(tags: any) => { setEditableDevice((prevData: any) => ({ ...prevData, tags: tags })); }}
                                                />
                                            )
                                    }
                                </Grid>
                                <Grid item xs={12} container alignItems={"center"}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"100%"} height={22} />
                                            )
                                            : (
                                                <IconPicker value={editableDevice!.icon_name} onChange={(newIcon: any) => { setEditableDevice((prevData: any) => ({ ...prevData, icon_name: newIcon })); }} />
                                            )
                                    }
                                </Grid>
                                <Grid item xs={12} container alignItems={"center"}>
                                    {
                                        requestStatus.isLoading
                                            ? (
                                                <Skeleton variant="rectangular" width={"100%"} height={22} />
                                            )
                                            : (
                                                <>
                                                    <Box onClick={ev => handleClickColorPicker(ev)} sx={{ width: 30, height: 30, borderRadius: 30, cursor: "pointer", background: editableDevice!.icon_color }} />
                                                    <Menu
                                                        sx={{ marginTop: 1, width: "770px", borderRadius: 0 }}
                                                        MenuListProps={{ style: { padding: 0 } }}
                                                        id="simple-menu"
                                                        anchorEl={anchorElColorPicker}
                                                        open={Boolean(anchorElColorPicker)}
                                                        onClose={handleCloseColorPicker}
                                                    >
                                                        <BlockPicker triangle="hide" color={editableDevice!.icon_color} onChange={(newColor: any) => { setEditableDevice((prevState: any) => ({ ...prevState, icon_color: newColor.hex })); }} />
                                                    </Menu>
                                                </>
                                            )
                                    }
                                </Grid>
                                <Grid item xs={12} container>
                                    <Box sx={{ marginTop: "20px" }}>
                                        <Button variant="outlined" sx={{ marginRight: "15px" }}>Cancel</Button>
                                        <Button variant="contained">Save</Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </Box>
        );
    }
};
