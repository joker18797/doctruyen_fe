import { axiosDELETE, axiosGET, axiosPOST } from "../../Helper/TypeAxios";
import { urlParseParams } from "@/Helper/helpFunction";
export default class Story {
    create(data) {
        return axiosPOST("api_gw", '/api/story/create', data);
    }
    myStory(data) {
        const stringUrl = urlParseParams(data);
        return axiosGET("api_gw", `/api/story/my?${stringUrl}`);
    }
    detail(id) {
        return axiosGET("api_gw", `/api/story/${id}`);
    }
    update(id, data) {
        return axiosPOST("api_gw", `/api/story/update/${id}`, data);
    }
    delete(id) {
        return axiosDELETE('api_gw', `/api/story/${id}`);
    }
}