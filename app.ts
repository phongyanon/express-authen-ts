import express, { Application, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import cors from 'cors';
import swaggerUi from "swagger-ui-express";

import { router as userRoutes } from "./src/v1/user/routes";
import { router as verificationRoutes } from "./src/v1/verification/routes";
import { router as tokenRoutes } from "./src/v1/token/routes";
import { router as authenRoutes } from "./src/v1/authen/routes";

import { router as roleRoutes } from "./src/v1/role/routes";
import { router as uesrRoleRoutes } from "./src/v1/userRole/routes";
import { router as profileRoutes } from "./src/v1/profile/routes";
import { router as settingRoutes } from "./src/v1/setting/routes";

import { router as fileRoutes } from "./src/v1/file/routes";
import { router as twoFactorAuthenRoutes } from "./src/v1/2factorAuthen/routes";

const app: Application = express();
const corsOptions: cors.CorsOptions = {
  origin: '*',
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  preflightContinue: false,
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'X-Access-Token',
  ],
}

app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use("/v1", userRoutes);
app.use("/v1", verificationRoutes);
app.use("/v1", tokenRoutes);
app.use("/v1", authenRoutes);

app.use("/v1", roleRoutes);
app.use("/v1", uesrRoleRoutes);
app.use("/v1", profileRoutes);
app.use("/v1", settingRoutes);

app.use("/v1", fileRoutes);
app.use("/v1", twoFactorAuthenRoutes);

app.use(express.static("public"));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/swagger.json",
    },
  })
);

app.use("/", (req: Request, res: Response, next: NextFunction): void => {
  res.json({ message: "Hello! Catch-all route." });
});

export default app;