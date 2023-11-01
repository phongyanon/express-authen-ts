import { Router, Request, Response } from "express";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { IUserSignIn, IUserSignUp, ISignInResponse, ISignOutResponse } from "./authen.type";

const router = Router();
// let user = new Controller();

router.post("/signup", async (req: Request, res: Response) => {
  const newUser: IUserSignUp = req.body;
  // let result: IResponse | ISuccessResponse = await user.addUser(newUser);
  let result: ISuccessResponse = { message: 'Successfully signup' };
  if (result.hasOwnProperty('error')){
    if (result.error === 'Duplicated username') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/signin", async (req: Request, res: Response) => {
  const signinUser: IUserSignIn = req.body;
  // let result: IResponse | ISuccessResponse = await user.addUser(signinUser);
  let result: ISignInResponse = { access_token: 'test', refresh_token: 'test' };
  if (result.hasOwnProperty('error')){
    if (result.error === 'Invalid username or password') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/signout", async (req: Request, res: Response) => {
  // use access token
  // const signinUser: IUserSignIn = req.body;
  // let result: IResponse | ISuccessResponse = await user.addUser(signinUser);
  let result: ISignOutResponse = { message: 'signout' };
  if (result.hasOwnProperty('error')){
    if (result.error === 'Invalid username or password') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.get("/token/status", async (req: Request, res: Response) => {
  // let result: IResponse | ISuccessResponse = await user.addUser(signinUser);
  let result: IResponse | ISuccessResponse = { message: 'ok' };
  if (result.hasOwnProperty('error')){
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
