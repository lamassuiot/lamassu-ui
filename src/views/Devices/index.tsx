import { DevicesListView } from "./DevicesList";
import { Route, Routes } from "react-router-dom";
import { ViewDevice } from "./ViewDevice";
import { CreateDevice } from "./CreateDevice";

export const DevicesView = () => {
    return (
        <Routes>
            <Route path="/" element={<DevicesListView />}/>
            <Route path="create" element={<CreateDevice />} />
            <Route path=":deviceId/*" element={<ViewDevice />} />
        </Routes>
    );
};
