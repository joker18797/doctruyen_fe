import { axiosGET, axiosPOST, axiosPUT, axiosDELETE, axiosPATCH } from "../../Helper/TypeAxios";

export default class AdminUser {
    list(params = {}) {
        const qs = new URLSearchParams(
            Object.entries(params).filter(([, v]) => v != null && v !== '')
        ).toString();
        const suffix = qs ? `?${qs}` : '';
        return axiosGET('api_gw', `/admin/users${suffix}`);
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

    activate(id) {
        return axiosPATCH('api_gw', `/admin/users/${id}/activate`);
    }
}
