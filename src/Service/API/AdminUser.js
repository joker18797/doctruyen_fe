import { axiosGET, axiosPOST, axiosPUT, axiosDELETE, axiosPATCH } from "../../Helper/TypeAxios";

export default class AdminUser {
    list() {
        return axiosGET('api_gw', '/admin/users');
    }

    delete(id) {
        return axiosDELETE('api_gw', `/admin/users/${id}`);
    }

    update(id, data) {
        return axiosPUT('api_gw',`/admin/users/${id}`, data);
    }

    block(id) {
        return axiosPATCH('api_gw', `/admin/users/${id}/block`);
    }
}
