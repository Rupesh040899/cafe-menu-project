import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import menuRoutes from "./src/routes/menuRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(",").map(url => url.trim()) : true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type"]
}));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Cafe API is running", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" });
});

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Cafe Menu & Order API", version: "1.0.0", description: "REST API for cafe menu and customer orders." },
    servers: [{ url: `http://localhost:${PORT}`, description: "Local server" }]
  },
  apis: ["./src/routes/*.js"]
};
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc(swaggerOptions)));

app.use("/api/menu", menuRoutes);
app.use("/api/orders", orderRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Something went wrong" });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Add it to backend/.env");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}`));
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}
startServer();
