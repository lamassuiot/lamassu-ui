import { Divider, Grid, Paper, Skeleton, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";

import { Link, Outlet, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { DmsList } from "./DmsList";
import { DMSForm } from "./DmsActions/DMSForm";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import * as dmsApicalls from "ducks/features/dms-enroller/apicalls";
import * as dmsActions from "ducks/features/dms-enroller/actions";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import { ORequestStatus } from "ducks/reducers_utils";

export const DMSView = () => {
    const navigate = useNavigate();

    return (
        <Routes>
            <Route path="/" element={<Outlet />}>
                <Route path=":dmsName/edit" element={<DMSViewWrapper
                    title="Update Device Manufacturing System"
                    subtitle=""
                />} >
                    <Route index element={<UpdateDMSFormWrapper />} />
                </Route>
                <Route path="create" element={<DMSViewWrapper
                    title="Create a new Device Manufacturing System"
                    subtitle="To create a new DMS instance, please provide the appropriate information"
                />} >
                    <Route index element={<DMSForm onSubmit={async (dms) => {
                        await dmsApicalls.createDMS(dms);
                        await dmsApicalls.updateDMS({ ...dms, status: "APPROVED" });
                        navigate("/dms");
                    }} />} />
                </Route>
                <Route index element={<DmsList />} />
            </Route>
        </Routes>
    );
};

const UpdateDMSFormWrapper = () => {
    const params = useParams();

    return (
        <UpdateDMSForm dmsName={params.dmsName!}/>
    );
};

interface UpdateDMSFormProps {
    dmsName: string
}

const UpdateDMSForm: React.FC<UpdateDMSFormProps> = ({ dmsName }) => {
    const dms = useAppSelector((state) => dmsSelector.getDMS(state, dmsName)!);
    const requestStatus = useAppSelector((state) => dmsSelector.getRequestStatus(state)!);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    console.log(dms);

    useEffect(() => {
        dispatch(dmsActions.getDMSAction.request({ name: dmsName }));
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

    if (requestStatus.status === ORequestStatus.Success && dms !== undefined) {
        return <DMSForm
            dms={dms}
            onSubmit={async (dms) => {
                await dmsApicalls.updateDMS({ ...dms });
                navigate("/dms");
            }} />;
    }
    return <>something went wrong</>;
};

interface Props {
    title: string
    subtitle: string
}

const DMSViewWrapper: React.FC<Props> = ({ title, subtitle }) => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);

    return (
        <Box sx={{ height: "100%" }} component={Paper}>
            <Box style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Box style={{ padding: "40px 40px 0 40px" }}>
                    <Grid item container spacing={2} justifyContent="flex-start">
                        <Grid item xs={12}>
                            <Box style={{ display: "flex", alignItems: "center" }}>
                                <Typography style={{ color: theme.palette.text.primary, fontWeight: "500", fontSize: 26, lineHeight: "24px", marginRight: "10px" }}>{title}</Typography>
                            </Box>
                        </Grid>
                    </Grid>
                    <Grid>
                        <Typography style={{ color: theme.palette.text.secondary, fontWeight: "400", fontSize: 13, marginTop: "10px" }}>{subtitle}</Typography>
                    </Grid>
                    <Box style={{ marginTop: 15, position: "relative", left: "-15px" }}>
                        <Tabs value={selectedTab} onChange={(ev, newValue) => setSelectedTab(newValue)}>
                            <Tab component={Link} to="create" label="Default Provision" />
                        </Tabs>
                    </Box>
                </Box>
                <Divider />
                <Box style={{ padding: "20px 40px 20px 40px", /* flexGrow: 1, */ overflowY: "auto", /* height: "100%", */ display: "flex" }}>
                    <Grid container style={{ width: "300px", flexGrow: 1 }}>
                        <Outlet />
                    </Grid>
                </Box>
            </Box>
        </Box>
    );
};
