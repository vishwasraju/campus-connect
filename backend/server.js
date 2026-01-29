require("dotenv").config();
const express = require("express");
const connectDB = require("./db");
const authRoutes = require("./authRoutes");
const routes = require("./routes");
const cors = require('cors');

const app = express();
app.use(express.json());

// app.use(cors({
//   origin: "http://localhost:8080"
// }));

app.use(cors());

//connectDB();

app.use("/auth", authRoutes);
app.use("/api", routes);

/* -------- TEST PROTECTED ROUTES -------- */

app.get("/", (req, res) => {
  res.json({ message: "Server is"});
});

app.listen(process.env.PORT || 3000, (req, res) => {
  console.log("Server running on port 3000");
});