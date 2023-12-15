import React, { useEffect } from "react";

import { Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { DeviceInspector } from "./DeviceInspector";
import { DeviceList } from "./DevicesList";
import { CreateDevice } from "./DeviceActions/DeviceForm";
import { apicalls } from "ducks/apicalls";
import { useAppSelector } from "ducks/hooks";
import { useDispatch } from "react-redux";
import { actions } from "ducks/actions";
import { selectors } from "ducks/reducers";
import { RequestStatus } from "ducks/reducers_utils";
import { Skeleton, Box } from "@mui/material";

const RoutedDeviceInspector = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const location = useLocation();

    const deviceID = params.deviceId!;
    const requestStatus = useAppSelector(state => selectors.devices.getDeviceListRequestStatus(state));
    const device = useAppSelector(state => selectors.devices.getDevice(state, deviceID));

    const refreshAction = () => {
        dispatch(actions.devicesActions.getDeviceByID.request(deviceID));
    };

    useEffect(() => {
        refreshAction();
    }, []);

    if (requestStatus.isLoading) {
        return (
            <Box padding={"20px"}>
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </Box>
        );
    }

    if (requestStatus.status === RequestStatus.Success && device !== undefined) {
        return (
            <DeviceInspector device={device} />
        );
    }

    return (
        <>something went wrong</>
    );
};

export const DeviceView = () => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route path="create" element={
                    <CreateDevice onSubmit={async (device) => {
                        console.log(device);
                        await apicalls.devices.createDevice({
                            id: device.id,
                            tags: device.tags,
                            metadata: {},
                            dms_id: device.dms_id,
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
