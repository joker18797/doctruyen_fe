import { axiosGET, axiosPOST, axiosPUT, axiosDELETE } from "@/Helper/TypeAxios";

export default class AdminAds {
    list() {
        return axiosGET('api_gw', '/admin/ads');
    }

    create(data: any) {
        return axiosPOST('api_gw', '/admin/ads', data);
    }

    update(id: string, data: any) {
        return axiosPUT('api_gw', `/admin/ads/${id}`, data);
    }

    delete(id: string) {
        return axiosDELETE('api_gw', `/admin/ads/${id}`);
    }
}
