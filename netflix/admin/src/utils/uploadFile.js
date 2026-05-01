import axios from "axios";

export const uploadFile = async (file, onProgress, metadata = {}) => {
  const data = new FormData();
  data.append("file", file);
  Object.entries(metadata).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    data.append(key, String(value));
  });

  const token = JSON.parse(localStorage.getItem("user"))?.accessToken;

  const res = await axios.post("/api/upload", data, {
    headers: {
      "Content-Type": "multipart/form-data",
      token: token ? `Bearer ${token}` : "",
    },
    onUploadProgress: (progressEvent) => {
      if (!onProgress || !progressEvent.total) return;
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(Math.min(percent, 100));
    },
  });

  if (onProgress) onProgress(100);
  return res.data.url;
};
