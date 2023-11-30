import { failed, success } from "ducks/actionTypes";
import { ListRequest, ListResponse } from "ducks/models";
import { createAsyncAction, createAction } from "typesafe-actions";

import { DMS } from "./models";

export const actionTypes = {
    GET_DMSS: "GET_DMSS",
    GET_DMS_BY_ID: "GET_DMS_BY_ID",

    CREATE_DMS_SUCCESS: "CREATE_DMS_SUCCESS",
    UPDATE_DMS_SUCCESS: "UPDATE_DMS_SUCCESS"
};

export const getDMSs = createAsyncAction(
    actionTypes.GET_DMSS,
    success(actionTypes.GET_DMSS),
    failed(actionTypes.GET_DMSS)
)<ListRequest, ListResponse<DMS>, Error>();

export const getDMSByID = createAsyncAction(
    actionTypes.GET_DMS_BY_ID,
    success(actionTypes.GET_DMS_BY_ID),
    failed(actionTypes.GET_DMS_BY_ID)
)<string, DMS, Error>();

export const createDMS = createAction(actionTypes.CREATE_DMS_SUCCESS)();
export const updateDMS = createAction(actionTypes.UPDATE_DMS_SUCCESS)();
