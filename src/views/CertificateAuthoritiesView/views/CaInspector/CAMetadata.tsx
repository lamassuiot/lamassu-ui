import React from "react";
import { useTheme } from "@mui/system";
import { Grid } from "@mui/material";
import { SubsectionTitle } from "components/LamassuComponents/dui/typographies";
import { MultiKeyValueInput } from "components/LamassuComponents/dui/MultiKeyValueInput";
import deepEqual from "fast-deep-equal/es6";
import { CertificateAuthority } from "ducks/features/cav3/models";
import { apicalls } from "ducks/apicalls";
import { useDispatch } from "react-redux";
import { actions } from "ducks/actions";

interface Props {
    caData: CertificateAuthority
}

export const CAMetadata: React.FC<Props> = ({ caData }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    return (
        <Grid item container sx={{ width: "100%" }} spacing={0} flexDirection={"column"}>
            <Grid item>
                <SubsectionTitle>Metadata</SubsectionTitle>
            </Grid>
            <Grid item container flexDirection={"column"}>
                <MultiKeyValueInput label="" value={caData.metadata} onChange={async (meta) => {
                    if (!deepEqual(caData.metadata, meta)) {
                        await apicalls.cas.updateCAMetadata(caData.id, meta);
                        dispatch(actions.caActionsV3.updateCAMetadata(caData.id));
                    }
                }} />
            </Grid>
        </Grid >
    );
};
