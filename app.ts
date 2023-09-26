import express, { Application, Request, Response, NextFunction } from "express";

import { router as userRoutes } from "./src/v1/user/routes";

const app: Application = express();

app.use("/v1", userRoutes);

app.use("/", (req: Request, res: Response, next: NextFunction): void => {
  res.json({ message: "Hello! Catch-all route." });
});

export default app;