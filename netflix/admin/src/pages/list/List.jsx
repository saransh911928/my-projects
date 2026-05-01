import { useContext, useEffect, useMemo, useState } from "react";
import { Link, useHistory, useLocation, useParams } from "react-router-dom";
import "./list.css";
import { ListContext } from "../../context/listContext/ListContext";
import { updateList } from "../../context/listContext/apiCalls";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { getMovies } from "../../context/movieContext/apiCalls";

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

export default function List() {
  const history = useHistory();
  const location = useLocation();
  const { listId } = useParams();
  const { lists, dispatch, isFetching, error } = useContext(ListContext);
  const { movies, dispatch: movieDispatch } = useContext(MovieContext);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    genre: "",
    content: [],
  });

  const listFromRouteState = location.state?.list || window.history.state?.state?.list;

  const currentList = useMemo(() => {
    if (listFromRouteState?._id) return listFromRouteState;
    return lists.find((item) => item._id === listId) || null;
  }, [listFromRouteState, lists, listId]);

  const filteredMovies = useMemo(
    () => movies.filter((movie) => matchesListType(formData.type, movie)),
    [movies, formData.type]
  );

  useEffect(() => {
    getMovies(movieDispatch);
  }, [movieDispatch]);

  useEffect(() => {
    if (!currentList) return;
    setFormData({
      title: currentList.title || "",
      type: currentList.type || "",
      genre: currentList.genre || "",
      content: Array.isArray(currentList.content) ? currentList.content : [],
    });
  }, [currentList]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        content: prev.content.filter((id) => {
          const movie = movies.find((item) => item._id === id);
          return movie ? matchesListType(value, movie) : true;
        }),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelect = (e) => {
    const selectedIds = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData((prev) => ({ ...prev, content: selectedIds }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!currentList?._id) {
      setFormError("List not found. Open this page from Lists table.");
      return;
    }

    if (!formData.title.trim()) {
      setFormError("Title is required.");
      return;
    }

    if (!formData.type) {
      setFormError("Type is required.");
      return;
    }

    if (formData.content.length === 0) {
      setFormError("Select at least one movie/series in content.");
      return;
    }

    const mismatchError = getTypeMismatchError(formData.type, formData.content, movies);
    if (mismatchError) {
      setFormError(mismatchError);
      return;
    }

    try {
      await updateList(
        currentList._id,
        {
          title: formData.title.trim(),
          type: formData.type,
          genre: formData.genre.trim(),
          content: formData.content,
        },
        dispatch
      );
      history.push("/lists");
    } catch (err) {
      setFormError(err?.response?.data?.message || "Failed to update list.");
    }
  };

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">List</h1>
        <Link to="/newlist">
          <button className="productAddButton">Create</button>
        </Link>
      </div>

      <div className="productTop">
        <div className="productTopRight">
          <div className="productInfoTop">
            <span className="productName">{currentList?.title || "Unknown list"}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{currentList?._id || "-"}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">genre:</span>
              <span className="productInfoValue">{currentList?.genre || "-"}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">type:</span>
              <span className="productInfoValue">{currentList?.type || "-"}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">items:</span>
              <span className="productInfoValue">{currentList?.content?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="productBottom">
        <form className="productForm" onSubmit={handleUpdate}>
          <div className="productFormLeft">
            <label>List Title</label>
            <input type="text" name="title" value={formData.title} onChange={handleChange} />

            <label>Type</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="">Type</option>
              <option value="movie">Movie</option>
              <option value="series">Series</option>
            </select>

            <label>Genre</label>
            <input type="text" name="genre" value={formData.genre} onChange={handleChange} />

            <label>Content</label>
            <select
              multiple
              name="content"
              value={formData.content}
              onChange={handleSelect}
              className="listContentSelect"
            >
              {filteredMovies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title}
                </option>
              ))}
            </select>
          </div>

          <div className="productFormRight">
            <button className="productButton" type="submit" disabled={isFetching}>
              {isFetching ? "Saving..." : "Update"}
            </button>
          </div>
        </form>
        {formError ? <span>{formError}</span> : null}
        {!formError && error ? <span>Failed to update list. Please try again.</span> : null}
      </div>
    </div>
  );
}
