import { axiosDELETE, axiosGET, axiosPOST, axiosPUT } from "../../Helper/TypeAxios";
import { urlParseParams } from "@/Helper/helpFunction";
export default class Chapter {
    create( id,data) {
        return axiosPOST("api_gw", `/api/stories/${id}/chapters`, data);
    }
    update(id, chapterId, data) {
        return axiosPUT("api_gw", `/api/stories/${id}/chapters/${chapterId}`, data);
    }
    delete(id, chapterId) {
        return axiosDELETE('api_gw', `/api/stories/${id}/chapters/${chapterId}`);
    }
    list(id,data){
        const stringUrl = urlParseParams(data);
         return axiosGET("api_gw", `/api/stories/${id}/chapters?${stringUrl}`);
    }
}