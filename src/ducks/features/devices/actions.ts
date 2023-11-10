import { failed, success } from "ducks/actionTypes";
import { ListRequest, ListResponse } from "ducks/models";
import { createAction, createAsyncAction } from "typesafe-actions";
import { Device } from "./models";

export const actionTypes = {
    GET_DEVICES: "GET_DEVICES",
    GET_DEVICE_BY_ID: "GET_DEVICE_BY_ID",

    CREATE_DEVICE_SUCCESS: "CREATE_DEVICE_SUCCESS",
    UPDATE_ID_SLOT_SUCCESS: "UPDATE_ID_SLOT_SUCCESS",
    UPDATE_DEVICE_METADATA_SUCCESS: "UPDATE_DEVICE_METADATA_SUCCESS",
    DECOMMISSION_DEVICE_SUCCESS: "DECOMMISSION_DEVICE_SUCCESS"
};

export const getDevices = createAsyncAction(
    actionTypes.GET_DEVICES,
    success(actionTypes.GET_DEVICES),
    failed(actionTypes.GET_DEVICES)
)<ListRequest, ListResponse<Device>, Error>();

export const getDeviceByID = createAsyncAction(
    actionTypes.GET_DEVICE_BY_ID,
    success(actionTypes.GET_DEVICE_BY_ID),
    failed(actionTypes.GET_DEVICE_BY_ID)
)<string, Device, Error>();

export const createDevice = createAction(actionTypes.CREATE_DEVICE_SUCCESS)();
export const updateIDSlot = createAction(actionTypes.UPDATE_ID_SLOT_SUCCESS)();
export const updateDeviceMetadata = createAction(actionTypes.UPDATE_DEVICE_METADATA_SUCCESS)();
export const decommissionDevice = createAction(actionTypes.DECOMMISSION_DEVICE_SUCCESS)();
