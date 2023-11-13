import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IVerificationInsert, IVerificationUpdate, IVerification } from "./verification.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole } from "../middleware/authen";
import { Role } from "../utils/role";

const router = Router();
let verification = new Controller();

router.get("/verifications", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  let result: IResponse | IVerification[] = await verification.getVerifications();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/verification/:id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IVerification = await verification.getVerification(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/verification", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const newVerification: IVerificationInsert = req.body;
  let result: IResponse | ISuccessResponse = await verification.addVerification(newVerification);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/verification/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateVerification: IVerificationUpdate = req.body;
  let result: IResponse | ISuccessResponse = await verification.updateVerification(updateVerification);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/verification/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await verification.deleteVerification(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
