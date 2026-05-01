import axios from "axios";
import {
  getListsFailure,
  getListsStart,
  getListsSuccess,
  deleteListFailure,
  deleteListStart,
  deleteListSuccess,
  createListFailure,
  createListStart,
  createListSuccess,
  updateListFailure,
  updateListStart,
  updateListSuccess,
} from "./ListAction";

export const getLists = async (dispatch) => {
  const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
  if (!token) return dispatch(getListsFailure());

  dispatch(getListsStart());
  try {
    const res = await axios.get("/api/lists/all", {
      headers: {
        token: "Bearer " + token,
      },
    });
    dispatch(getListsSuccess(res.data));
  } catch (err) {
    dispatch(getListsFailure());
  }
};

export const deleteList = async (id, dispatch) => {
  const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
  if (!token) return dispatch(deleteListFailure());

  dispatch(deleteListStart());
  try {
    await axios.delete("/api/lists/" + id, {
      headers: {
        token: "Bearer " + token,
      },
    });
    dispatch(deleteListSuccess(id));
  } catch (err) {
    dispatch(deleteListFailure());
  }
};

export const createList = async (list, dispatch) => {
  const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
  if (!token) {
    dispatch(createListFailure());
    throw new Error("Missing admin token");
  }

  dispatch(createListStart());
  try {
    const res = await axios.post("/api/lists", list, {
      headers: {
        token: "Bearer " + token,
      },
    });
    dispatch(createListSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(createListFailure());
    throw err;
  }
};

export const updateList = async (id, list, dispatch) => {
  const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
  if (!token) {
    dispatch(updateListFailure());
    throw new Error("Missing admin token");
  }

  dispatch(updateListStart());
  try {
    const res = await axios.put("/api/lists/" + id, list, {
      headers: {
        token: "Bearer " + token,
      },
    });
    dispatch(updateListSuccess(res.data));
    return res.data;
  } catch (err) {
    dispatch(updateListFailure());
    throw err;
  }
};
