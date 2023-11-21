import { Router, Request, Response } from "express";
// import { Controller } from "./controllers";
// import { IProfileInsert, IProfileUpdate, IProfile, IProfileUpdateByUser } from "./profile.type";
import { uploadImageProfile } from "../middleware/fileFilter";
import { Controller } from "./controllers";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole, checkRoleUserAccess } from "../middleware/authen";

const router = Router();

let fileController = new Controller();

router.post("/upload/profile/image", uploadImageProfile, async (req: Request, res: Response) => {
	if (!req.file || Object.keys(req.file).length === 0) {
		res.status(500).send({error: true, message: 'No file upload'});
	}
	else {
		let result = await fileController.uploadToGoogleDrive(req);
		if (result.hasOwnProperty('error')) res.status(500).send(result);
		else res.status(200).send(result);
	}
});


export { router };
