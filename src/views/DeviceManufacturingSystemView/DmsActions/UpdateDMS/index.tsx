import React, { useEffect, useState } from "react";
import { Grid, Typography, useTheme, Box } from "@mui/material";

import { LamassuSwitch } from "components/LamassuComponents/Switch";
import { LamassuChip } from "components/LamassuComponents/Chip";
import { useDispatch } from "react-redux";
import { useAppSelector } from "ducks/hooks";
import * as caSelector from "ducks/features/cas/reducer";
import * as caActions from "ducks/features/cas/actions";
import { CertificateAuthority } from "ducks/features/cas/models";
import * as dmsSelector from "ducks/features/dms-enroller/reducer";
import { LamassuTableWithDataControllerConfigProps } from "components/LamassuComponents/Table";
import { FormattedView } from "components/DashboardComponents/FormattedView";
import TagsInput from "components/LamassuComponents/TagsInput";
import { DynamicIcon } from "components/IconDisplayer/DynamicIcon";

interface Props {
    dmsName: string,
}

export const UpdateDMS: React.FC<Props> = ({ dmsName }) => {
    const theme = useTheme();
    const dispatch = useDispatch();

    const caRequestStatus = useAppSelector((state) => caSelector.getRequestStatus(state));
    const caList = useAppSelector((state) => caSelector.getCAs(state));
    const totalCAs = useAppSelector((state) => caSelector.getTotalCAs(state));
    const dms = useAppSelector((state) => dmsSelector.getDMS(state, dmsName)!);

    const [selectedCas, setSelectedCas] = useState<Array<string>>([]);
    const [tempCa, setTempCA] = useState("");
    // const [editableDMS, setEditableDMS] = useState<any>(dms);

    const [tableConfig, setTableConfig] = useState<LamassuTableWithDataControllerConfigProps>(
        {
            filter: {
                enabled: false,
                filters: []
            },
            sort: {
                enabled: true,
                selectedField: "name",
                selectedMode: "asc"
            },
            pagination: {
                enabled: true,
                options: [10, 25, 50],
                selectedItemsPerPage: 10,
                selectedPage: 0
            }
        }
    );

    const refreshAction = () => dispatch(caActions.getCAsAction.request({
        offset: tableConfig.pagination.selectedPage! * tableConfig.pagination.selectedItemsPerPage!,
        limit: tableConfig.pagination.selectedItemsPerPage!,
        sortField: tableConfig.sort.selectedField!,
        sortMode: tableConfig.sort.selectedMode!,
        filterQuery: tableConfig.filter.filters!.map((f: any) => { return f.propertyKey + "[" + f.propertyOperator + "]=" + f.propertyValue; })
    }));

    useEffect(() => {
        refreshAction();
    }, []);

    useEffect(() => {
        if (tableConfig !== undefined) {
            refreshAction();
        }
    }, [tableConfig]);

    const casTableColumns = [
        { key: "actions", title: "", align: "start", size: 1 },
        { key: "name", title: "CA Name", dataKey: "ca_name", align: "center", query: true, type: "string", size: 2 },
        { key: "serialnumber", title: "Serial Number", align: "center", size: 3 },
        { key: "status", title: "Status", align: "center", size: 1 },
        { key: "keystrength", title: "Key Strength", align: "center", size: 1 },
        { key: "keyprops", title: "Key Properties", align: "center", size: 1 }
    ];

    const casRender = (ca: CertificateAuthority) => {
        return {
            actions: (dms.cloud_dms
                ? <LamassuSwitch value={selectedCas.includes(ca.name)} style={{ color: "grey" }} checked={tempCa === ca.name} onChange={() => {
                    const temp = [];
                    temp.push(ca.name);
                    setSelectedCas(temp);
                    setTempCA(ca.name);
                    console.log(temp);
                }} />
                : <LamassuSwitch value={selectedCas.includes(ca.name)} onChange={() => {
                    setSelectedCas(prev => {
                        if (prev.includes(ca.name)) {
                            prev.splice(prev.indexOf(ca.name), 1);
                        } else {
                            prev.push(ca.name);
                        }
                        return prev;
                    });
                }} />),
            name: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{ca.name}</Typography>,
            serialnumber: <Typography style={{ fontWeight: "500", fontSize: 14, color: theme.palette.text.primary }}>{ca.serial_number}</Typography>,
            status: <LamassuChip label={ca.status} color={ca.status_color} />,
            keystrength: <LamassuChip label={ca.key_metadata.strength} color={ca.key_metadata.strength_color} />,
            keyprops: <Typography style={{ fontWeight: "400", fontSize: 14, color: theme.palette.text.primary, textAlign: "center" }}>{`${ca.key_metadata.type} ${ca.key_metadata.bits}`}</Typography>
        };
    };

    return (
        <FormattedView
            title={<span>Update DMS: {<span style={{ color: theme.palette.primary.main }}>{dmsName}</span>}</span>}
            subtitle="Test"
        >
            <Grid item container spacing={4} flexDirection="column">
                <Grid item container spacing={2} flexDirection="column">
                    <Grid item>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "600", fontSize: 20, lineHeight: "24px", fontVariant: "all-small-caps" }}>General Settings</Typography>
                    </Grid>
                    <Grid item container alignItems={"center"}>
                        <Grid item xs={3} md={2}>
                            <Typography>Cloud Hosted DMS</Typography>
                        </Grid>
                        <Grid item xs md>
                            <LamassuSwitch />
                        </Grid>
                    </Grid>
                    <Grid item container>
                        <Grid item xs={3} md={2}>
                            <Typography>Manual tags</Typography>
                        </Grid>
                        <Grid item xs md container spacing={1}>

                            <TagsInput placeholder="Press enter to add a new tag" variant="standard" tags={["TestDMS", "PCOM-Devices"]} onChange={() => { }} />
                            {/* {
                                ["TestDMS", "PCOM-Devices"].map((tag, idx) => <Grid item xs="auto" key={idx}><LamassuChip label={tag}/></Grid>)
                            } */}
                        </Grid>
                    </Grid>
                    <Grid item container>
                        <Grid item xs={3} md={2}>
                            <Typography>Device Icon</Typography>
                        </Grid>
                        <Grid item xs md container spacing={1}>
                            <DynamicIcon icon={"Cg/CgSmartphoneChip"} size={30} />
                            {/* <IconPicker value={editableDMS!.icon_name} onChange={(newIcon: any) => { setEditableDMS((prevData: any) => ({ ...prevData, icon_name: newIcon })); }} /> */}
                        </Grid>
                    </Grid>
                    <Grid item container>
                        <Grid item xs={3} md={2}>
                            <Typography>Device Color</Typography>
                        </Grid>
                        <Grid item xs md container spacing={1}>
                            <Box sx={{ width: 30, height: 30, borderRadius: 30, cursor: "pointer", background: "#25ee32" }} />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item container spacing={2} flexDirection="column">
                    <Grid item>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "600", fontSize: 20, lineHeight: "24px", fontVariant: "all-small-caps" }}>Enrollment Settings</Typography>
                    </Grid>
                    <Grid item container>
                        <Grid item xs={3} md={2}>
                            <Typography>Bootstrap CAs</Typography>
                        </Grid>
                        <Grid item xs md container spacing={1}>
                            {
                                ["BootstrapPCOM"].map((tag, idx) => <Grid item xs="auto" key={idx}><LamassuChip label={tag} /></Grid>)
                            }
                        </Grid>
                    </Grid>
                    <Grid item container>
                        <Grid item xs={3} md={2}>
                            <Typography>Authorized CAs</Typography>
                        </Grid>
                        <Grid item xs md container spacing={1}>
                            {
                                ["FagorPCOM"].map((tag, idx) => <Grid item xs="auto" key={idx}><LamassuChip label={tag} /></Grid>)
                            }
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item container spacing={2} flexDirection="column">
                    <Grid item>
                        <Typography style={{ color: theme.palette.text.primary, fontWeight: "600", fontSize: 20, lineHeight: "24px", fontVariant: "all-small-caps" }}>CA Distribution Settings</Typography>
                    </Grid>
                    <Grid item container alignItems={"center"}>
                        <Grid item xs={3} md={2}>
                            <Typography>Include Authorized CAs</Typography>
                        </Grid>
                        <Grid item xs md>
                            <LamassuSwitch />
                        </Grid>
                    </Grid>
                    <Grid item container alignItems={"center"}>
                        <Grid item xs={3} md={2}>
                            <Typography>Include Bootstrap CAs</Typography>
                        </Grid>
                        <Grid item xs md>
                            <LamassuSwitch />
                        </Grid>
                    </Grid>
                    <Grid item container>
                        <Grid item xs={3} md={2}>
                            <Typography>Static CAs</Typography>
                        </Grid>
                        <Grid item xs md container spacing={1}>
                            {
                                ["AWSIoTCore", "DevoCA"].map((tag, idx) => <Grid item xs="auto" key={idx}><LamassuChip label={tag} /></Grid>)
                            }
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </FormattedView>

    );
};

/* <Grid item container>
    <Grid item xs={12} container sx={{ marginTop: "20px" }}>
        <LamassuTableWithDataController
            data={caList}
            invertContrast={true}
            totalDataItems={totalCAs}
            columnConf={casTableColumns}
            renderDataItem={casRender}
            isLoading={caRequestStatus.isLoading}
            emptyContentComponent={
                <Typography>No CAs</Typography>
            }
            config={tableConfig}
            onChange={(ev: any) => {
                if (!deepEqual(ev, tableConfig)) {
                    console.log(tableConfig);
                    setTableConfig(prev => ({ ...prev, ...ev }));
                    // refreshAction();
                }
            }}
        />
    </Grid>
</Grid> */
