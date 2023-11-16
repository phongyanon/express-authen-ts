import { Router, Request, Response } from "express";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { 
  IUserSignIn, 
  IUserSignUp, 
  ISignInResponse, 
  ISignOutResponse, 
  IStatusToken, 
  IAuthRefreshToken, 
  IAuthAccessTokenResp,
  IAuthRefreshTokenResp,
  IUserChangePassword,
  IStatusChangePassword,
  IResetPasswordByEmail,
  INewPassword
 } from "./authen.type";
import { auth, checkRole, checkRoleUserAccess, checkRoleUserUpdate } from "../middleware/authen";
import { Role } from "../utils/role";
import { Controller } from "./controllers";

const router = Router();
let authen = new Controller();

router.post("/signup", async (req: Request, res: Response) => {
  const newUser: IUserSignUp = req.body;
  let result: IResponse | ISuccessResponse = await authen.signUp(newUser);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Duplicated username or email') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/signin", async (req: Request, res: Response) => {
  const signinUser: IUserSignIn = req.body;
  let result: IResponse | ISignInResponse = await authen.signIn(signinUser);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Invalid username or password') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/signout", auth, async (req: Request, res: Response) => {
  // use access token
  let result: IResponse | ISignOutResponse = await authen.signOut(req);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Invalid username or password') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.get("/status/token", auth, async (req: Request, res: Response) => {
  let result: IResponse | IStatusToken = await authen.getTokenStatus(req);
  if (result.hasOwnProperty('error')){
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.get("/test/role/admin", auth, checkRole([Role.Admin]), async (req: Request, res: Response) => {
  res.status(200).send({message: 'ok'});
});

router.get("/test/role/user", auth, checkRole([Role.User]), async (req: Request, res: Response) => {
  res.status(200).send({message: 'ok'});
});

router.get("/test/roles/user/admin", auth, checkRole([Role.User, Role.Admin]), async (req: Request, res: Response) => {
  res.status(200).send({message: 'ok'});
});


router.post("/auth/refresh/token", async (req: Request, res: Response) => {
  const refreshToken: IAuthRefreshToken = req.body;
  let result: IResponse | IAuthAccessTokenResp = await authen.authRefreshToken(refreshToken);
  if (result.hasOwnProperty('error')){
    res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/auth/refresh/tokens", async (req: Request, res: Response) => {
  const refreshToken: IAuthRefreshToken = req.body;
  let result: IResponse | IAuthRefreshTokenResp = await authen.authBothTokens(refreshToken);
  if (result.hasOwnProperty('error')){
    res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/password/change", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), checkRoleUserUpdate, async (req: Request, res: Response) => {
  const newPassword: IUserChangePassword = req.body;
  let result: IResponse | IStatusChangePassword = await authen.changePassword(newPassword);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Invalid password') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/password/reset/generate", async (req: Request, res: Response) => {
  const body: IResetPasswordByEmail = req.body;
  let result: IResponse | IStatusChangePassword = await authen.genResetPasswordToken(body);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Email does not exist') res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.put("/reset/password/:user_id/:token", async (req: Request, res: Response) => {
  const user_id: string = (req.params.user_id).toString();
  const token: string = (req.params.token).toString();
  const body: INewPassword = req.body;

  let result: IResponse | IStatusChangePassword = await authen.resetPasswordByResetPasswordToken(user_id, token, body);
  if (result.hasOwnProperty('error')){
    if (result.error === 'Invalid token or user') res.status(400).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/revoke/token/:user_id", auth, checkRole([Role.SuperAdmin, Role.Admin, Role.User]), checkRoleUserAccess, async (req: Request, res: Response) => {
  const user_id: string = (req.params.user_id).toString();
  let result: IResponse | ISignOutResponse = await authen.revokeToken(user_id);
  if (result.hasOwnProperty('error')){
    res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
