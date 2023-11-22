import { Router, Request, Response } from "express";
import { uploadImageProfile } from "../middleware/fileFilter";
import { Controller } from "./controllers";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole, checkRoleUserAccess } from "../middleware/authen";
import { Role } from "../utils/role";

const router = Router();

let fileController = new Controller();

router.post("/upload/profile/image/:user_id", 
		auth, 
		checkRole([Role.SuperAdmin, Role.Admin, Role.User]), 
		checkRoleUserAccess, 
		uploadImageProfile,
		async (req: Request, res: Response) => {

	const user_id: string = (req.params.user_id).toString();
	if (!req.file || Object.keys(req.file).length === 0) {
		res.status(500).send({error: true, message: 'No file upload'});
	}
	else {
		let result: IResponse|ISuccessResponse = await fileController.uploadToGoogleDrive(req, user_id);
		if (result.hasOwnProperty('error')) res.status(500).send(result);
		else res.status(200).send(result);
	}
});


export { router };
