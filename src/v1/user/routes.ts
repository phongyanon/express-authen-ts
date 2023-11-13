import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IUserInsert, IUserUpdate, IUser } from "./user.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole } from "../middleware/authen";
import { Role, isSingleRole } from "../utils/role";

const router = Router();
let user = new Controller();

router.get("/users", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  let result: IResponse | IUser[] = await user.getUsers();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/user/:id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IUser = await user.getUser(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/user", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const newUser: IUserInsert = req.body;
  let result: IResponse | ISuccessResponse = await user.addUser(newUser);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Duplicated username') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(201).send(result);
});

router.put("/user/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateUser: IUserUpdate = req.body;
  let result: IResponse | ISuccessResponse = await user.updateUser(updateUser);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/user/:id", auth, checkRole([Role.SuperAdmin, Role.Admin]), async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await user.deleteUser(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

// router.post("/user", (req: Request, res: Response): void => {
//   res.status(201).send({message: 'Successfully create', id: '1'});
// });

export { router };
