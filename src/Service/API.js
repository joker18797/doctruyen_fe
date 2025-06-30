import Auth from "./API/Auth";
import User from "./API/User";
import Story from './API/Story';
const API = {
    Auth: new Auth(),
    User: new User(),
    Story: new Story(),
}
export default API;