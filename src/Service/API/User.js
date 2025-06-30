import { axiosGET, axiosPOST, axiosPUT } from "../../Helper/TypeAxios";

export default class User {
    info() {
        return axiosGET('api_gw', '/api/users/detail');
    }
    updateProfile(data) {
        return axiosPUT('api_gw', '/api/users/profile', data)
    }
    uploadAvatar(formData) {
        return axiosPOST('api_gw', '/api/users/upload-avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}