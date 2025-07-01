import { axiosDELETE, axiosGET, axiosPOST } from "../../Helper/TypeAxios";
import { urlParseParams } from "@/Helper/helpFunction";
export default class Chapter {
    create(data) {
        return axiosPOST("api_gw", '/api/stories/create', data);
    }
    update(id, data) {
        return axiosPOST("api_gw", `/api/stories/update/${id}`, data);
    }
    delete(id, chapterId) {
        return axiosDELETE('api_gw', `/api/stories/${id}/chapters/${chapterId}`);
    }
    list(data){
        const stringUrl = urlParseParams(data);
         return axiosGET("api_gw", `/api/stories/my?${stringUrl}`);
    }
}