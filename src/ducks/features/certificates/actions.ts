import { createAsyncAction, deprecated } from "typesafe-actions";
import { failed, success } from "ducks/actionTypes";
import { ListRequest, ListResponse } from "ducks/models";
import { Certificate } from "../cav3/models";
const { createStandardAction } = deprecated;

export const actionTypes = {
    GET_CERTIFICATES: "GET_CERTIFICATES"
};

export const getCerts = createAsyncAction(
    actionTypes.GET_CERTIFICATES,
    success(actionTypes.GET_CERTIFICATES),
    failed(actionTypes.GET_CERTIFICATES)
)<ListRequest, ListResponse<Certificate>, Error>();
