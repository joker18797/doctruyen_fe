import { axiosGET, axiosPOST } from "../../Helper/TypeAxios";

export default class Auth {
    login(data) {
        return axiosPOST("api_gw", '/api/auth/login' ,data);
    }
    register(data) {
        return axiosPOST("api_gw", '/api/auth/register' ,data);
    }
    forgotPassword(data) {
        return axiosPOST("api_gw", '/api/auth/forgot-password', data);
    }
    resetPassword(token, data) {
        return axiosPOST("api_gw", `/api/auth/reset-password/${token}`, data);
    }
}