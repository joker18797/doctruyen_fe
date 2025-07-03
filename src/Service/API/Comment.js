import { axiosDELETE, axiosGET, axiosPOST, axiosPUT } from "../../Helper/TypeAxios";
import { urlParseParams } from "@/Helper/helpFunction";
export default class Comment {
    create(id, data) {
        return axiosPOST("api_gw", `/api/comment/${id}`, data);
    }
    delete(id) {
        return axiosDELETE('api_gw', `/api/comment/${id}`);
    }
    list(id) {
        return axiosGET("api_gw", `/api/comment/${id}`);
    }
    
}