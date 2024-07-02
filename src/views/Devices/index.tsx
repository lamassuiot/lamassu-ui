import { CreateDevice } from "./CerateDevice";
import { CreateDevicePayload } from "ducks/features/devices/models";
import { DevicesListView } from "./DevicesList";
import { Route, Routes, useNavigate } from "react-router-dom";
import { ViewDevice } from "./ViewDevice";
import { enqueueSnackbar } from "notistack";
import React from "react";
import apicalls from "ducks/apicalls";

export const DevicesView = () => {
    const navigate = useNavigate();
    return (
        <Routes>
            <Route path="/" element={<DevicesListView />}/>
            <Route path="create" element={<CreateDevice onSubmit={async (device: CreateDevicePayload) => {
                try {
                    await apicalls.devices.createDevice(device);
                    enqueueSnackbar(`Device ${device.id} registered`, { variant: "success" });
                    navigate("/devices");
                } catch (e) {
                    enqueueSnackbar(`Failed to register device ${device.id}: ${e}`, { variant: "error" });
                }
            }}/>} />
            <Route path=":deviceId/*" element={<ViewDevice />} />
        </Routes>

    );
};
