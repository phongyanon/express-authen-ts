import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { ITokenInsert, ITokenUpdate, IToken } from "./token.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";

const router = Router();
let token = new Controller();

router.get("/tokens", async (req: Request, res: Response) => {
  let result: IResponse | IToken[] = await token.getTokens();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/token/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | IToken = await token.getToken(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/token", async (req: Request, res: Response) => {
  const newToken: ITokenInsert = req.body;
  let result: IResponse | ISuccessResponse = await token.addToken(newToken);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/token/:id", async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updateToken: ITokenUpdate = req.body;
  let result: IResponse | ISuccessResponse = await token.updateToken(updateToken);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/token/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await token.deleteToken(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
