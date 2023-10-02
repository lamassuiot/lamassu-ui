import React from "react";

import { Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { DeviceInspector } from "./DeviceInspector";
import { DeviceList } from "./DevicesList";
import { CreateDevice } from "./DeviceActions/DeviceForm";
import * as devicesApiCall from "ducks/features/devices/apicalls";

const RoutedDeviceInspector = () => {
    const params = useParams();
    const location = useLocation();
    return (
        <DeviceInspector deviceID={params.deviceId!} slotID={params.slotId!} />
    );
};

export const DeviceView = () => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route path="create" element={
                    <CreateDevice onSubmit={async (device) => {
                        await devicesApiCall.registerDevice(device.id, device.alias, device.description, device.tags, device.icon_name, device.icon_color, device.dms_name);
                        navigate("/devmanager");
                    }} />
                } />
                <Route path=":deviceId/:slotId/*" element={<RoutedDeviceInspector />} />
                <Route path=":deviceId/*" element={<RoutedDeviceInspector />} />
                <Route index element={<DeviceList />} />
            </Route>
        </Routes>
    );
};
