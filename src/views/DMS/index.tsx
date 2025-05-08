import { DMSCACertificates } from "./CACerts";
import { DMSForm } from "./DMSCreateUpdate";
import { DMSListView } from "./DMSList";
import { Route, Routes } from "react-router-dom";
import UpdateDMSForm from "./UpdateDMSForm";

export const DMSView = () => {
    return (
        <Routes>
            <Route path="/" element={<DMSListView />} />
            <Route path="create" element={<DMSForm />} />
            <Route path=":dmsID/cacerts" element={ <DMSCACertificates />} />
            <Route path=":dmsID/edit" element={ <UpdateDMSForm /> } />
        </Routes >
    );
};
