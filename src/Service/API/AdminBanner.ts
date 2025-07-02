import { axiosGET, axiosPOST, axiosPUT, axiosDELETE } from "@/Helper/TypeAxios";

export default class AdminBanner {
    list() {
        return axiosGET('api_gw', '/admin/banners');
    }

    create(data: any) {
        return axiosPOST('api_gw', '/admin/banners', data);
    }

    update(id: string, data: any) {
        return axiosPUT('api_gw', `/admin/banners/${id}`, data);
    }

    delete(id: string) {
        return axiosDELETE('api_gw', `/admin/banners/${id}`);
    }
}
