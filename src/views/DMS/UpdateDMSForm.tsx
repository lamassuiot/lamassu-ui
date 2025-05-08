import React from "react";
import { DMSForm } from "./DMSCreateUpdate";
import { FetchViewer } from "components/FetchViewer";
import { useNavigate, useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import apicalls from "ducks/apicalls";

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

export default UpdateDMSForm;
