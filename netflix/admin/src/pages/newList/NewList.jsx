import { useContext, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import "./newList.css";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { getMovies } from "../../context/movieContext/apiCalls";
import { ListContext } from "../../context/listContext/ListContext";
import { createList } from "../../context/listContext/apiCalls";

const matchesListType = (type, movie) => {
  if (type === "movie") return !movie.isSeries;
  if (type === "series") return Boolean(movie.isSeries);
  return true;
};

const getTypeMismatchError = (type, selectedIds, allMovies) => {
  if (!type || !selectedIds.length || !allMovies.length) return "";

  const selectedMovies = allMovies.filter((movie) => selectedIds.includes(movie._id));
  const mismatchedMovies = selectedMovies.filter((movie) => !matchesListType(type, movie));
  if (!mismatchedMovies.length) return "";

  const preview = mismatchedMovies
    .slice(0, 3)
    .map((movie) => movie.title)
    .join(", ");
  const suffix = mismatchedMovies.length > 3 ? ", ..." : "";

  return `List type is "${type}" but selected content contains mismatched items: ${preview}${suffix}.`;
};

export default function NewList() {
  const history = useHistory();
  const { movies, dispatch: movieDispatch } = useContext(MovieContext);
  const { dispatch, isFetching, error } = useContext(ListContext);
  const [formError, setFormError] = useState("");
  const [list, setList] = useState({
    title: "",
    genre: "",
    type: "",
    content: [],
  });

  useEffect(() => {
    getMovies(movieDispatch);
  }, [movieDispatch]);

  const filteredMovies = useMemo(
    () => movies.filter((movie) => matchesListType(list.type, movie)),
    [movies, list.type]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setList((prev) => ({
        ...prev,
        type: value,
        content: prev.content.filter((id) => {
          const movie = movies.find((item) => item._id === id);
          return movie ? matchesListType(value, movie) : true;
        }),
      }));
      return;
    }

    setList((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
    setList((prev) => ({ ...prev, content: selectedIds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!list.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!list.type) {
      setFormError("Type is required.");
      return;
    }

    if (list.content.length === 0) {
      setFormError("Select at least one movie/series in content.");
      return;
    }

    const mismatchError = getTypeMismatchError(list.type, list.content, movies);
    if (mismatchError) {
      setFormError(mismatchError);
      return;
    }

    try {
      await createList(
        {
          title: list.title.trim(),
          genre: list.genre.trim(),
          type: list.type,
          content: list.content,
        },
        dispatch
      );
      history.push("/lists");
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to create list.");
    }
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New List</h1>
      <form className="addProductForm" onSubmit={handleSubmit}>
        <div className="formLeft">
          <div className="addProductItem">
            <label>Title</label>
            <input
              type="text"
              placeholder="Popular Movies"
              name="title"
              value={list.title}
              onChange={handleChange}
            />
          </div>
          <div className="addProductItem">
            <label>Genre</label>
            <input
              type="text"
              placeholder="action"
              name="genre"
              value={list.genre}
              onChange={handleChange}
            />
          </div>
          <div className="addProductItem">
            <label>Type</label>
            <select name="type" value={list.type} onChange={handleChange}>
              <option value="">Type</option>
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>
          </div>
        </div>

        <div className="formRight">
          <div className="addProductItem">
            <label>Content</label>
            <select
              multiple
              name="content"
              value={list.content}
              onChange={handleSelect}
              className="contentSelect"
            >
              {filteredMovies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {formError ? <span>{formError}</span> : null}
        {!formError && error ? <span>Failed to create list. Please try again.</span> : null}

        <button className="addProductButton" type="submit" disabled={isFetching}>
          {isFetching ? "Creating..." : "Create"}
        </button>
      </form>
    </div>
  );
}
