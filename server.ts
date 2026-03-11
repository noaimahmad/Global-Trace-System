import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables at the very beginning
dotenv.config();

import authRoutes from "./server/routes/auth.ts";
import apiRoutes from "./server/routes/api.ts";
import adminRoutes from "./server/routes/admin.ts";
import { connectDB } from "./src/lib/mongodb.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

async function configureApp() {
  try {
    // Attempt to connect to MongoDB if URI is provided
    if (process.env.MONGODB_URI) {
      await connectDB();
    } else {
      console.warn("MONGODB_URI not found. Running in SQLite-only mode.");
    }
    
    app.use(express.json());
    app.use(cookieParser());

    // Request logging
    app.use((req, res, next) => {
      if (process.env.NODE_ENV !== 'production') {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
      }
      next();
    });

    // API routes
    app.use("/api/auth", authRoutes);
    app.use("/api", apiRoutes);
    app.use("/api/admin", adminRoutes);

    app.get("/api/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString(), env: process.env.NODE_ENV });
    });

    // Vite middleware for development
    const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
    
    if (!isProd) {
      console.log("Starting Vite in middleware mode...");
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } else {
      // Serve static files from dist in production
      const distPath = path.join(__dirname, "dist");
      app.use(express.static(distPath));
      
      app.get("*", (req, res) => {
        // Only serve index.html if it's not an API route
        if (!req.url.startsWith('/api')) {
          res.sendFile(path.join(distPath, "index.html"));
        } else {
          res.status(404).json({ error: "API route not found" });
        }
      });
    }

    // Error handler
    app.use((err: any, req: any, res: any, next: any) => {
      console.error("Server Error:", err);
      res.status(500).json({ 
        error: "Internal Server Error", 
        message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
      });
    });

  } catch (error) {
    console.error("Failed to configure app:", error);
  }
}

configureApp();

// Only listen if not running as a Vercel function
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
