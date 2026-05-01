const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const movieRoute = require("./routes/movies");
const listRoute = require("./routes/lists");
const uploadRoute = require("./routes/upload");

const app = express();
const dns = require('dns');

if (process.env.MONGO_DNS_SERVERS) {
  const servers = process.env.MONGO_DNS_SERVERS.split(',').map(s => s.trim());
  try {
    dns.setServers(servers);
    console.log('Using custom DNS servers for Node DNS:', servers);
  } catch (e) {
    console.log('Failed to set custom DNS servers:', e.message || e);
  }
}

const mongoUrl = process.env.MONGO_URL_STANDARD || process.env.MONGO_URL;
const mongoDbName = process.env.MONGO_DB_NAME || "netflix";

if (!mongoUrl) {
  throw new Error("Mongo connection string is missing. Set MONGO_URL in .env");
}

mongoose
  .connect(mongoUrl, { dbName: mongoDbName })
  .then(() => console.log(`MongoDB connected to database: ${mongoDbName}`))
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/movies", movieRoute);
app.use("/api/lists", listRoute);
app.use("/api/upload", uploadRoute);

app.listen(process.env.PORT || 9000, () => {
  console.log("Server is running on port 9000");
});
