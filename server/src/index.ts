import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import applicationRoutes from "./routes/applicationRoutes";
import authRoutes from "./routes/authRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(cors({ origin: corsOrigin }));

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

// prefix all resource routes with /api for consistency
app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/managers", managerRoutes);

/* SERVER */
const port = Number(process.env.PORT) || 4000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
