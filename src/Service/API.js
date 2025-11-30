import Auth from "./API/Auth";
import User from "./API/User";
import Story from './API/Story';
import Chapter from './API/Chapter';
import AdminUser from './API/AdminUser';
import AdminBanner from './API/AdminBanner';
import AdminAds from './API/AdminAds';
import Comment from './API/Comment';
import Notification from './API/Notification';
const API = {
    Auth: new Auth(),
    User: new User(),
    Story: new Story(),
    Chapter: new Chapter(),
    AdminUser: new AdminUser(),
    AdminBanner: new AdminBanner(),
    AdminAds: new AdminAds(),
    Comment: new Comment(),
    Notification: new Notification(),
}
export default API;