import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

import authRoutes from "./routes/auth.ts";
import apiRoutes from "./routes/api.ts";
import adminRoutes from "./routes/admin.ts";
import { connectDB } from "../src/lib/mongodb.ts";

const app = express();

async function configureApp() {
  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn("MONGODB_URI not found. Running in SQLite-only mode.");
    }

    app.use(express.json());
    app.use(cookieParser());

    // API routes
    app.use("/auth", authRoutes);
    app.use("/", apiRoutes);
    app.use("/admin", adminRoutes);

    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
    });
  } catch (error) {
    console.error("Failed to configure app:", error);
  }
}

configureApp();

export default app;
