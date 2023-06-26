import React from "react";

import { Outlet, Route, Routes, useLocation, useParams } from "react-router-dom";
import { DeviceInspector } from "./DeviceInspector";
import { DeviceList } from "./DevicesList";
import { EditDevice } from "./DeviceActions/EditDevice";
import { CreateDevice } from "./DeviceActions/CreateDevice";

const RoutedDeviceInspector = () => {
    const params = useParams();
    const location = useLocation();
    return (
        <DeviceInspector deviceID={params.deviceId!} slotID={params.slotId!}/>
    );
};

const RoutedEditDevice = () => {
    const params = useParams();
    const location = useLocation();
    // console.log(params, location);
    return (
        <EditDevice deviceID={params.deviceId!}/>
    );
};

export const DeviceView = () => {
    return (
        <Routes>
            <Route path="/" element={<Outlet/>}>
                <Route path="create" element={<CreateDevice />} />
                <Route path=":deviceId/edit" element={<RoutedEditDevice />} />
                <Route path=":deviceId/:slotId/*" element={<RoutedDeviceInspector />} />
                <Route path=":deviceId/*" element={<RoutedDeviceInspector />} />
                <Route index element={<DeviceList />} />
            </Route>
        </Routes>
    );
};
