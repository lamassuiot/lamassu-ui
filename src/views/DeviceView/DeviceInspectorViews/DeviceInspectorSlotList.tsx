import { Box, useTheme } from "@mui/system";
import React from "react";
import { useAppSelector } from "ducks/hooks";
import * as devicesSelector from "ducks/features/devices/reducer";

interface Props {
    deviceID: string,
    onSlotClick: Function
}

export const DeviceInspectorSlotList: React.FC<Props> = ({ deviceID, onSlotClick }) => {
    const theme = useTheme();
    const device = useAppSelector((state) => devicesSelector.getDevice(state, deviceID));

    return (
        <Box>
            {/* <Grid container sx={{ padding: "20px" }} spacing={4}>
                {
                    device?.slots.map((slot, idx) => {
                        return (
                            <Grid key={idx} item xl={4} xs={6}>
                                <Box component={Paper} padding="20px" sx={{ cursor: "pointer" }} onClick={() => { onSlotClick(slot.id); }}>
                                    <Grid flexDirection={"column"} >
                                        <Grid item xs sx={{ margin: "20px" }}>
                                            <Typography variant="h6" fontSize="25px" textAlign={"center"}>Slot {slot.id}</Typography>
                                            <Typography fontSize="12px" textAlign={"center"}>{slot.active_certificate.serial_number}</Typography>
                                        </Grid>
                                        <Grid item xs container spacing={8}>
                                            <Grid item xs container flexDirection="column" justifyContent={"center"} alignItems="center">
                                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Status</Typography>
                                                <LamassuChip label={slot!.active_certificate.status} color={slot!.active_certificate.status_color} compact/>
                                            </Grid>
                                            <Grid item xs container flexDirection="column" justifyContent={"center"} alignItems="center">
                                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>Expiration Date</Typography>
                                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{moment(slot.active_certificate.valid_to).format("DD-MM-YYYY HH:mm")}</Typography>
                                            </Grid>
                                            <Grid item xs container flexDirection="column" justifyContent={"center"} alignItems="center">
                                                <Typography style={{ color: theme.palette.text.secondary, fontWeight: "500", fontSize: 14 }}>CA Name</Typography>
                                                <Typography textAlign="center" style={{ color: theme.palette.text.primary, fontWeight: "400", fontSize: 14 }}>{slot.active_certificate.ca_name}</Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Grid>
                        );
                    })
                }
            </Grid> */}
        </Box>
    );
};
