import axios from "axios";
import { loginStart, loginFailure, loginSuccess } from "./AuthAction";


export const login = async (user, dispatch) => {

    dispatch(loginStart());
    try {
        const res = await axios.post("/api/auth/login", user);
        if (res.data.isAdmin) {
          dispatch(loginSuccess(res.data));
        } else {
          dispatch(loginFailure());
        }
    } catch (err) {
        dispatch(loginFailure());
    }
};
