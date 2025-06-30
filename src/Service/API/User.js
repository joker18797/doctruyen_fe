import { axiosGET, axiosPOST } from "../../Helper/TypeAxios";

export default class User {
    info() {
        return axiosGET('api_gw', '/api/users/detail');
    }
}