import { AsymmetricKmsListView } from "./AsymmetricKmsList";
import { Route, Routes } from "react-router-dom";

export const KMSView = () => {
    return (
        <Routes>
            <Route path="/" element={<AsymmetricKmsListView />} />
            {/* <Route path="create" element={<CreateD+evice />} /> */}
        </Routes>
    );
};
