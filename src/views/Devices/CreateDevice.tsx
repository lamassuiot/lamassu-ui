/* eslint-disable no-else-return */
import { Button, useTheme } from "@mui/material";
import { CreateDevicePayload } from "ducks/features/devices/models";
import { DMS } from "ducks/features/dmss/models";
import { DMSSelector } from "components/DMSs/DMSSelector";
import { FormTextField } from "components/forms/Textfield";
import { FormattedView } from "components/FormattedView";
import { Icon } from "components/IconInput";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Unstable_Grid2";
import React from "react";
import apicalls from "ducks/apicalls";
import { enqueueSnackbar } from "notistack";

type FormData = {
    deviceReg: {
        id: string
        icon: Icon
        color: string
        tags: string[]
        dms: DMS | undefined
    },
};

export const CreateDevice: React.FC = () => {
    const editMode = false;

    const theme = useTheme();
    const navigate = useNavigate();

    const { control, setValue, reset, getValues, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
        defaultValues: {
            deviceReg: {
                id: window.crypto.randomUUID(),
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
                dms_id: data.deviceReg.dms!.id,
                tags: data.deviceReg.dms!.settings.enrollment_settings.device_provisioning_profile.tags,
                icon: data.deviceReg.dms!.settings.enrollment_settings.device_provisioning_profile.icon,
                icon_color: data.deviceReg.dms!.settings.enrollment_settings.device_provisioning_profile.icon_color,
                metadata: {}
            };
            onSubmit(actionPayload);
        };
        run();
    });

    const onSubmit = async (device: CreateDevicePayload) => {
        try {
            await apicalls.devices.createDevice(device);
            enqueueSnackbar(`Device ${device.id} registered`, { variant: "success" });
            navigate("/devices");
        } catch (e) {
            enqueueSnackbar(`Failed to register device ${device.id}: ${e}`, { variant: "error" });
        }
    };

    return (
        <FormattedView
            title="Register a new Device"
            subtitle="To register a new Device instance, please provide the appropriate information"
        >
            <form onSubmit={submit} style={{ width: "100%" }}>
                <Grid container sx={{ width: "100%" }}>
                    <Grid md={6} xs={12} container spacing={2}>
                        <Grid xs={12}>
                            <FormTextField label="Device ID" control={control} name="deviceReg.id" disabled={editMode} />
                        </Grid>
                        <Grid xs={12}>
                            <DMSSelector value={getValues("deviceReg.dms")} onSelect={(dms) => {
                                if (!Array.isArray(dms)) {
                                    setValue("deviceReg.dms", dms);
                                }
                            }} multiple={false} label="DMS Owner" />
                        </Grid>
                        <Grid xs={12}>
                            <Button variant="contained" type="submit" disabled={watchAll.deviceReg.id === "" || watchAll.deviceReg.dms === undefined}>Register Device</Button>
                        </Grid>
                    </Grid>
                </Grid>
            </form>
        </FormattedView >

    );
};
