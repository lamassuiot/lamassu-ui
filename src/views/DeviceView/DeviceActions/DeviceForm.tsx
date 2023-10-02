/* eslint-disable no-else-return */
import React from "react";
import { Button, Grid, useTheme } from "@mui/material";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import StandardWrapperView from "views/StandardWrapperView";
import { Icon } from "components/LamassuComponents/dui/IconInput";
import { useForm } from "react-hook-form";
import { FormTextField } from "components/LamassuComponents/dui/form/TextField";
import DMSSelector from "components/LamassuComponents/lamassu/DMSSelector";
import { DMS } from "ducks/features/dms-enroller/models";
import { Device } from "ducks/features/devices/models";

type FormData = {
    deviceReg: {
        id: string
        icon: Icon
        color: string
        tags: string[]
        alias: string
        dms: DMS | undefined
    },
};
interface Props {
    device?: Device,
    onSubmit: (dms: any) => void
}

export const CreateDevice: React.FC<Props> = ({ onSubmit }) => {
    const editMode = false;

    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            deviceReg: {
                id: window.crypto.randomUUID(),
                alias: "",
                dms: undefined,
                icon: {
                    bg: "#25eee2",
                    fg: "#333333",
                    name: "CgSmartphoneChip"
                },
                tags: []
            }
        }
    });

    const watchAll = watch();

    const submit = handleSubmit(data => {
        const run = async () => {
            const actionPayload = {
                id: data.deviceReg.id,
                alias: data.deviceReg.alias,
                dms_name: data.deviceReg.dms?.name,
                tags: data.deviceReg.dms?.identity_profile.enrollment_settings.tags,
                description: "",
                icon_name: data.deviceReg.dms?.identity_profile.enrollment_settings.icon,
                icon_color: data.deviceReg.dms?.identity_profile.enrollment_settings.color

            };
            onSubmit(actionPayload);
        };
        run();
    });

    return (
        <StandardWrapperView
            title="Register a new Device"
            subtitle="To register a new Device instance, please provide the appropriate information"
            tabs={[
                {
                    label: "default",
                    element: (
                        <form onSubmit={submit}>
                            <Grid item container spacing={2}>
                                <Grid item xs={12}>
                                    <FormTextField label="Device ID" control={control} name="deviceReg.id" disabled={editMode} />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormTextField label="Alias" control={control} name="deviceReg.alias" disabled={editMode} />
                                </Grid>
                                <Grid item xs={12}>
                                    <DMSSelector selectLabel="Select DMS Owner" onSelect={(dms) => {
                                        if (!Array.isArray(dms)) {
                                            setValue("deviceReg.dms", dms);
                                        }
                                    }} multiple={false} label="DMS Owner" />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" type="submit" disabled={watchAll.deviceReg.id === "" || watchAll.deviceReg.dms === undefined}>Register Device</Button>
                                </Grid>
                            </Grid>
                        </form>
                    )
                }
            ]}
        />

    );
};
