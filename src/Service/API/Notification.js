import { axiosGET, axiosPOST } from "../../Helper/TypeAxios";
import { urlParseParams } from "@/Helper/helpFunction";

export default class Notification {
    list(data) {
        const stringUrl = urlParseParams(data);
        return axiosGET("api_gw", `/api/notifications?${stringUrl}`);
    }
    unreadCount() {
        return axiosGET("api_gw", `/api/notifications/unread-count`);
    }
    markRead(data) {
        return axiosPOST("api_gw", '/api/notifications/mark-read', data);
    }
    markAllRead() {
        return axiosPOST("api_gw", '/api/notifications/mark-all-read', {});
    }
}

