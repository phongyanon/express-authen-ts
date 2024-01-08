import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IRoleInsert, IRoleUpdate, IRole } from "./role.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole, checkRoleUserAccess } from "../middleware/authen";
import { Role, isSingleRole } from "../utils/role";

const router = Router();
let role = new Controller();

router.get("/roles", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  let result: IResponse | IRole[] = await role.getRoles();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/role/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IRole = await role.getRole(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.get("/role/user/:user_id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), checkRoleUserAccess, async (req: Request, res: Response) => {
  const user_id: string = (req.params.user_id).toString();
  let result: IResponse | string[] = await role.getRolesByUserId(user_id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/role", auth, checkRole([Role.SuperAdmin]), async (req: Request, res: Response) => {
  const newRole: IRoleInsert = req.body;
  let result: IResponse | ISuccessResponse = await role.addRole(newRole);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/role/:id", auth, checkRole([Role.SuperAdmin]), async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateRole: IRoleUpdate = req.body;
  let result: IResponse | ISuccessResponse = await role.updateRole(updateRole);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/role/:id", auth, checkRole([Role.SuperAdmin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await role.deleteRole(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
