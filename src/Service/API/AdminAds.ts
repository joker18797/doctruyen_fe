import { axiosGET, axiosPOST, axiosPUT, axiosDELETE, axiosPATCH } from "@/Helper/TypeAxios";

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

    trackClick(id: string) {
        return axiosPOST('api_gw', `/admin/ads/${id}/track-click`, {});
    }

    getClickHistory(id: string, limit?: number) {
        const params = limit ? `?limit=${limit}` : '';
        return axiosGET('api_gw', `/admin/ads/${id}/click-history${params}`);
    }
}
