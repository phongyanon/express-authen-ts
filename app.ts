import express, { Application, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import cors from 'cors';
import swaggerUi from "swagger-ui-express";

import { router as userRoutes } from "./src/v1/user/routes";
import { router as verificationRoutes } from "./src/v1/verification/routes";
import { router as tokenRoutes } from "./src/v1/token/routes";
import { router as authenRoutes } from "./src/v1/authen/routes";

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