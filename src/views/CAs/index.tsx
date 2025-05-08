import { CAInspector } from "./CAInspector";
import { CAListView } from "./CAListView";
import { Route, Routes } from "react-router-dom";
import { UpdateCA } from "./UpdateCA";
import CACreate from "./CACreate";

export const CAView = () => {
    return (
        <Routes>
            <Route path="/" element={<CAListView />}>
                <Route path=":caName/*" element={<CAInspector />} />
                <Route path="create" element={<CACreate />} />
                <Route path="edit/:caName" element={<UpdateCA />} />
            </Route>
        </Routes>
    );
};
