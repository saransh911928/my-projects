import axios from "axios";
import { getMoviesFailure, getMoviesStart, getMoviesSuccess } from "./MovieAction";
import { deleteMoviesFailure, deleteMoviesStart, deleteMoviesSuccess } from "./MovieAction";
import { createMovieFailure, createMovieStart, createMovieSuccess } from "./MovieAction";
import { updateMovieFailure, updateMovieStart, updateMovieSuccess } from "./MovieAction";

export const getMovies = async (dispatch) => {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) return dispatch(getMoviesFailure());

    dispatch(getMoviesStart());
    try {
        const res = await axios.get("/api/movies", {
            headers: {
                token: "Bearer " + token,
            },
        });
        dispatch(getMoviesSuccess(res.data));
    } catch (err) {
        dispatch(getMoviesFailure());
    }   
};

//delete
export const deleteMovie = async (id, dispatch) => {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) return dispatch(deleteMoviesFailure());

    dispatch(deleteMoviesStart());
    try {
        await axios.delete("/api/movies/" + id, {
            headers: {
                token: "Bearer " + token,
            },
        });
        dispatch(deleteMoviesSuccess(id));
    } catch (err) {
        dispatch(deleteMoviesFailure());
    }   
};

export const createMovie = async (movie, dispatch) => {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) {
        dispatch(createMovieFailure());
        throw new Error("Missing admin token");
    }

    dispatch(createMovieStart());
    try {
        const res = await axios.post("/api/movies", movie, {
            headers: {
                token: "Bearer " + token,
            },
        });
        dispatch(createMovieSuccess(res.data));
        return res.data;
    } catch (err) {
        dispatch(createMovieFailure());
        throw err;
    }
};

export const updateMovie = async (id, movie, dispatch) => {
    const token = JSON.parse(localStorage.getItem("user"))?.accessToken;
    if (!token) {
        dispatch(updateMovieFailure());
        throw new Error("Missing admin token");
    }

    dispatch(updateMovieStart());
    try {
        const res = await axios.put("/api/movies/" + id, movie, {
            headers: {
                token: "Bearer " + token,
            },
        });
        dispatch(updateMovieSuccess(res.data));
        return res.data;
    } catch (err) {
        dispatch(updateMovieFailure());
        throw err;
    }
};
