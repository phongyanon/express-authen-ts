import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IUserRoleInsert, IUserRoleUpdate, IUserRole } from "./uesrRole.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole } from "../middleware/authen";
import { Role } from "../utils/role";

const router = Router();
let userRole = new Controller();

router.get("/userRoles", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  let result: IResponse | IUserRole[] = await userRole.getUserRoles();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/UserRole/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IUserRole = await userRole.getUserRole(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/userRole", auth, checkRole([Role.SuperAdmin]), async (req: Request, res: Response) => {
  const newUserRole: IUserRoleInsert = req.body;
  let result: IResponse | ISuccessResponse = await userRole.addUserRole(newUserRole);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/userRole/:id", auth, checkRole([Role.SuperAdmin]), async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateUserRole: IUserRoleUpdate = req.body;
  let result: IResponse | ISuccessResponse = await userRole.updateUserRole(updateUserRole);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/userRole/:id", auth, checkRole([Role.SuperAdmin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await userRole.deleteUserRole(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
