import { axiosGET, axiosPOST } from "../../Helper/TypeAxios";

export default class Auth {
    login(data) {
        return axiosPOST("api_gw", '/api/auth/login' ,data);
    }
    register(data) {
        return axiosPOST("api_gw", '/api/auth/register' ,data);
    }
}