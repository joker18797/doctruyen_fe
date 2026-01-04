import { axiosGET, axiosPOST, axiosPUT, axiosDELETE, axiosPATCH } from "@/Helper/TypeAxios";

export default class AdminAds {
    list() {
        return axiosGET('api_gw', '/admin/ads');
    }

    create(data: any) {
        // Nếu data là FormData, cần set headers
        const config = data instanceof FormData 
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        return axiosPOST('api_gw', '/admin/ads', data, config);
    }

    update(id: string, data: any) {
        // Nếu data là FormData, cần set headers
        const config = data instanceof FormData 
            ? { headers: { 'Content-Type': 'multipart/form-data' } }
            : {};
        return axiosPUT('api_gw', `/admin/ads/${id}`, data, config);
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
