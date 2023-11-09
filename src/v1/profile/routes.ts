import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IProfileInsert, IProfileUpdate, IProfile } from "./profile.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";

const router = Router();
let profile = new Controller();

router.get("/profiles", async (req: Request, res: Response) => {
  let result: IResponse | IProfile[] = await profile.getProfiles();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/profile/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IProfile = await profile.getProfile(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/profile", async (req: Request, res: Response) => {
  const newProfile: IProfileInsert = req.body;
  let result: IResponse | ISuccessResponse = await profile.addProfile(newProfile);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/profile/:id", async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateProfile: IProfileUpdate = req.body;
  let result: IResponse | ISuccessResponse = await profile.updateProfile(updateProfile);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/profile/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await profile.deleteProfile(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
