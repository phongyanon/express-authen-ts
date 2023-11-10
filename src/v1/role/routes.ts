import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IRoleInsert, IRoleUpdate, IRole } from "./role.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";

const router = Router();
let role = new Controller();

router.get("/roles", async (req: Request, res: Response) => {
  let result: IResponse | IRole[] = await role.getRoles();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/role/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IRole = await role.getRole(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/role", async (req: Request, res: Response) => {
  const newRole: IRoleInsert = req.body;
  let result: IResponse | ISuccessResponse = await role.addRole(newRole);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/role/:id", async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateRole: IRoleUpdate = req.body;
  let result: IResponse | ISuccessResponse = await role.updateRole(updateRole);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/Role/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await role.deleteRole(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };