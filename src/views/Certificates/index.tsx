import { Routes, Route } from "react-router-dom";
import { CertificateListView } from "./CertificatesList";
import React from "react";

export const CertificatesView = () => {
    return (
        <Routes>
            <Route path="*" element={<CertificateListView />} />
        </Routes>
    );
};
