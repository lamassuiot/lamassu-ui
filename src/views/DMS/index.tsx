import { CreateUpdateDMSPayload } from "ducks/features/dmss/models";
import { DMSCACertificates } from "./CACerts";
import { DMSForm } from "./DMSCreateUpdate";
import { DMSListView } from "./DMSList";
import { FetchViewer } from "components/FetchViewer";
import { FormattedView } from "components/FormattedView";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { enqueueSnackbar, useSnackbar } from "notistack";
import React from "react";
import apicalls from "ducks/apicalls";

export const DMSView = () => {
    const navigate = useNavigate();
    return (
        <Routes>
            <Route path="/" element={<DMSListView />} />
            <Route path="create" element={<DMSForm onSubmit={async (dms: CreateUpdateDMSPayload) => {
                try {
                    await apicalls.dmss.createDMS(dms);
                    enqueueSnackbar(`DMS ${dms.name} registered`, { variant: "success" });
                    navigate("/dms");
                } catch (e) {
                    enqueueSnackbar(`Failed to register DMS ${dms.name}: ${e}`, { variant: "error" });
                }
            }} />} />
            <Route path=":dmsID/cacerts" element={
                <FormattedView
                    title="CA Certificates"
                    subtitle="Obtain the list of trusted CAs that are configured for this DMS Instance"
                >
                    <DMSCACertificatesWrapper />
                </FormattedView>

            } />
            <Route path=":dmsID/edit" element={
                <UpdateDMSForm />
            }
            />
        </Routes >

    );
};

const DMSCACertificatesWrapper = () => {
    const params = useParams();

    return (
        <DMSCACertificates dmsID={params.dmsID!} />
    );
};

const UpdateDMSForm: React.FC = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { enqueueSnackbar } = useSnackbar();

    return (
        <FetchViewer
            fetcher={() => apicalls.dmss.getDMSByID(params.dmsID!)}
            renderer={(dms) => (
                <DMSForm
                    dms={dms}
                    actionLabel="Update"
                    onSubmit={async (dms) => {
                        try {
                            await apicalls.dmss.updateDMS(dms.id, dms);
                            enqueueSnackbar(`DMS ${dms.name} updated`, { variant: "success" });
                            navigate("/dms");
                        } catch (e) {
                            enqueueSnackbar(`Failed to update DMS ${dms.name}: ${e}`, { variant: "error" });
                        }
                    }}
                />
            )}
        />
    );
};
