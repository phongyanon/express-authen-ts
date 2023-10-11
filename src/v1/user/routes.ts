import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { IUserInsert, IUserUpdate } from "./user.type";

const router = Router();
let user = new Controller();

router.get("/users", async (req: Request, res: Response) => {
  let result: any = await user.getUsers();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send([]);
});

router.get("/user/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: any = await user.getUser(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/user", async (req: Request, res: Response) => {
  const newUser: IUserInsert = req.body;
  let result: any = await user.addUser(newUser);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/user", async (req: Request, res: Response) => {
  const updateUser: IUserUpdate = req.body;
  let result: any = await user.updateUser(updateUser);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/user/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: any = await user.deleteUser(id);
  
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
