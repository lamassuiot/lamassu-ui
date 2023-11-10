import React from "react";

import { Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { DeviceInspector } from "./DeviceInspector";
import { DeviceList } from "./DevicesList";
import { CreateDevice } from "./DeviceActions/DeviceForm";
import { apicalls } from "ducks/apicalls";

const RoutedDeviceInspector = () => {
    const params = useParams();
    const location = useLocation();
    return (
        <DeviceInspector deviceID={params.deviceId!} />
    );
};

export const DeviceView = () => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route path="create" element={
                    <CreateDevice onSubmit={async (device) => {
                        await apicalls.devices.createDevice({
                            id: device.id,
                            alias: device.alias,
                            tags: device.tag,
                            metadata: {},
                            dms_id: device.dms_name,
                            icon: device.icon_name,
                            icon_color: device.icon_color
                        });
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
