import { Router, Request, Response } from "express";
import { uploadImageProfile } from "../middleware/fileFilter";
import { Controller } from "./controllers";
import { Controller as ProfileController } from "../profile/controllers";
import { IResponse, ISuccessResponse } from "../utils/common.type";
import { auth, checkRole, checkRoleUserAccess } from "../middleware/authen";
import { Role } from "../utils/role";
import { IProfileUpdateByUser } from "../profile/profile.type";

const router = Router();

let fileController = new Controller();
let profileController = new ProfileController();

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
		else {
			
			const updated_data: IProfileUpdateByUser = {
				user_id: user_id, 
				image_profile: `https://lh3.googleusercontent.com/d/${result.message}=s220?authuser=0`
			};
			let profile_result: IResponse | ISuccessResponse = await profileController.updateProfileByUserId(updated_data);
		
			if (profile_result.error) {
				if (profile_result.message) res.status(404).send(profile_result);
				else res.status(500).send(profile_result);
			}
			else res.status(200).send({message: 'success', data: result.message, profile: profile_result});
		}
	}
});

export { router };
