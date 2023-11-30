import { Skeleton } from "@mui/material";
import React, { useEffect } from "react";

import { Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { DmsList } from "./DmsList";
import { DMSForm } from "./DmsActions/DMSForm";

import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import StandardWrapperView from "views/StandardWrapperView";
import { DMSCACertificates } from "./DmsActions/CACertificates";
import { RequestStatus } from "ducks/reducers_utils";
import { apicalls } from "ducks/apicalls";
import { selectors } from "ducks/reducers";
import { actions } from "ducks/actions";

export const DMSView = () => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route path=":dmsName/edit" element={<StandardWrapperView
                    title="Update Device Manufacturing System"
                    subtitle=""
                    tabs={[
                        {
                            element: <UpdateDMSFormWrapper />,
                            label: "default"
                        }
                    ]}
                />} >
                </Route>
                <Route path=":dmsName/cacerts" element={<StandardWrapperView
                    title="CA Certificates"
                    subtitle="Obtain the list of trusted CAs that are configured for this DMS Instance"
                    tabs={[
                        {
                            element: <DMSCACertificatesWrapper />,
                            label: "default"
                        }
                    ]}
                />} >
                    <Route index element={<UpdateDMSFormWrapper />} />
                </Route>
                <Route path="create" element={<StandardWrapperView
                    title="Create a new Device Manufacturing System"
                    subtitle="To create a new DMS instance, please provide the appropriate information"
                    tabs={[
                        {
                            element: <DMSForm onSubmit={async (dms) => {
                                await apicalls.dms.createDMS(dms);
                                navigate("/dms");
                            }} />,
                            label: "default"
                        }
                    ]}

                />} >
                </Route>
                <Route index element={<DmsList />} />
            </Route>
        </Routes>
    );
};

const UpdateDMSFormWrapper = () => {
    const params = useParams();

    return (
        <UpdateDMSForm dmsName={params.dmsName!} />
    );
};

const DMSCACertificatesWrapper = () => {
    const params = useParams();

    return (
        <DMSCACertificates dmsName={params.dmsName!} />
    );
};

interface UpdateDMSFormProps {
    dmsName: string
}

const UpdateDMSForm: React.FC<UpdateDMSFormProps> = ({ dmsName }) => {
    const dms = useAppSelector((state) => selectors.dms.getDMS(state, dmsName)!);
    const requestStatus = useAppSelector((state) => selectors.dms.getDMSListRequestStatus(state)!);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        dispatch(actions.dmsActions.getDMSByID.request(dmsName));
    }, []);

    if (requestStatus.isLoading) {
        return (
            <>
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
                <Skeleton variant="rectangular" width={"100%"} height={25} sx={{ borderRadius: "5px", marginBottom: "20px" }} />
            </>
        );
    }

    if (requestStatus.status === RequestStatus.Success && dms !== undefined) {
        return <DMSForm
            dms={dms}
            actionLabel="Update"
            onSubmit={async (dms) => {
                await apicalls.dms.updateDMS(dms.id, dms);
                navigate("/dms");
            }} />;
    }

    return <>something went wrong</>;
};
