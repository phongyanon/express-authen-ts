import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IProfileInsert, IProfileUpdate, IProfile, IProfileUpdateByUser } from "./profile.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole, checkRoleUserAccess } from "../middleware/authen";
import { Role, isSingleRole } from "../utils/role";

const router = Router();
let profile = new Controller();

router.get("/profiles", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  let result: IResponse | IProfile[] = await profile.getProfiles();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/profile/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IProfile = await profile.getProfile(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.get("/user/profile/:user_id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), checkRoleUserAccess, async (req: Request, res: Response) => {
  const user_id: string = (req.params.user_id).toString();
  let result: IResponse | IProfile = await profile.getProfileByUserId(user_id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/profile", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const newProfile: IProfileInsert = req.body;
  let result: IResponse | ISuccessResponse = await profile.addProfile(newProfile);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.post("/user/profile/:user_id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), checkRoleUserAccess, async (req: Request, res: Response) => {
  req.body.user_id = (req.params.user_id).toString();
  const newProfile: IProfileInsert = req.body;
  let result: IResponse | ISuccessResponse = await profile.addProfileByUserId(newProfile);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/profile/:id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateProfile: IProfileUpdate = req.body;
  let result: IResponse | ISuccessResponse = await profile.updateProfile(updateProfile);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.put("/user/profile/:user_id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), checkRoleUserAccess, async (req: Request, res: Response) => {
  req.body.user_id = (req.params.user_id).toString();
  const updateProfile: IProfileUpdateByUser = req.body;
  let result: IResponse | ISuccessResponse = await profile.updateProfileByUserId(updateProfile);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/profile/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await profile.deleteProfile(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
