import dotenv from 'dotenv';
import express from 'express';
import connectDB from './db.js';
import authRoutes from './authRoutes.js';
import routes from './routes.js';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: "http://localhost:8080"
}));

connectDB();

app.use("/auth", authRoutes);
app.use("/api", routes);

/* -------- TEST PROTECTED ROUTES -------- */

app.get("/", (req, res) => {
  res.json({ message: "Server is running."});
});

app.listen(3000, (req, res) => {
  console.log("Server running on port 3000");
});

export default app;