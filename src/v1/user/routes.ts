import { Router, Request, Response } from "express";

const router = Router();

router.get("/users", (req: Request, res: Response): void => {
  let users = [
    {
      id: 'test',
      username: 'test',
      email: 'test@test.com',
      is_sso_user: false,
      sso_user_id: null,
      sso_from: null,
      status: 'active'
    },
    {
      id: 'joe',
      username: 'joe',
      email: 'joe@test.com',
      is_sso_user: false,
      sso_user_id: null,
      sso_from: null,
      status: 'active'
    },
];
  res.status(200).send(users);
});

router.post("/user", (req: Request, res: Response): void => {
  res.status(201).send({message: 'Successfully create', id: '1'});
});

export { router };
