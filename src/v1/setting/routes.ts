import { Router, Request, Response } from "express";
import { Controller } from "./controllers";
import { ISettingInsert, ISettingUpdate, ISetting } from "./setting.type";
import { IResponse, ISuccessResponse } from "../utils/common.type";

const router = Router();
let setting = new Controller();

router.get("/settings", async (req: Request, res: Response) => {
  let result: IResponse | ISetting[] = await setting.getSettings();
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(200).send(result);
});

router.get("/setting/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISetting = await setting.getSetting(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.post("/setting", async (req: Request, res: Response) => {
  const newsetting: ISettingInsert = req.body;
  let result: IResponse | ISuccessResponse = await setting.addSetting(newsetting);
  if (result.hasOwnProperty('error')) res.status(500).send(result);
  else res.status(201).send(result);
});

router.put("/setting/:id", async (req: Request, res: Response) => {
  req.body.id = (req.params.id).toString();
  const updatesetting: ISettingUpdate = req.body;
  let result: IResponse | ISuccessResponse = await setting.updateSetting(updatesetting);

  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

router.delete("/setting/:id", async (req: Request, res: Response) => {
  const id: string = (req.params.id).toString();
  let result: IResponse | ISuccessResponse = await setting.deleteSetting(id);
  
  if (result.hasOwnProperty('error')) {
    if (result.hasOwnProperty('message')) res.status(404).send(result);
    else res.status(500).send(result);
  }
  else res.status(200).send(result);
});

export { router };
