import dotenv from 'dotenv';
import { Request as Req } from "express";
import { Query as UserMysqlQuery } from '../user/services/mysql';
import { Query as UserMongoQuery } from '../user/services/mongo';
import { Query as ProfileMysqlQuery } from '../profile/services/mysql';
import { Query as ProfileMongoQuery } from '../profile/services/mongo';
import { IResponse, ISuccessResponse, IUploadFileResp } from "../utils/common.type";
import { Get, Post, Put, Delete, Route, SuccessResponse, Example, Path, Body, Request } from "tsoa";
import { GoogleDriveService } from '../utils/googleDriveService';
import pkey from "../../../my-auth-platform-key.json"

dotenv.config();

let googleDrive = new GoogleDriveService(pkey.client_email, pkey.private_key);
googleDrive.authorize();

@Route("v1")
export class Controller {
  userQuery: any
  profileQuery: any
  constructor(){
		let UserQuery;
		let ProfileQuery;
		switch(process.env.DB_TYPE){
				case('mysql'):
					UserQuery = new UserMysqlQuery();
					ProfileQuery = new ProfileMysqlQuery();
					break;
				case('mongo'):
					UserQuery = new UserMongoQuery();
					ProfileQuery = new ProfileMongoQuery();
					break;
		}
		
		this.profileQuery = ProfileQuery;
		this.userQuery = UserQuery;
	}

	@Post("/upload/profile/image/{user_id}")
	@SuccessResponse("200", "Upload image profile")
	@Example<ISuccessResponse>({
		message: 'success'
  })
	uploadToGoogleDrive(@Request() req: Req, @Path() user_id: string ): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			try {
				const { file }: any = req;
				let now = new Date()
				let file_name: string = `${now.valueOf().toString()}_${file.originalname}`;
				let upload_result :any = await googleDrive.uploadFile(file_name, file.path);

				if (upload_result.success === true){
					let user_profile = await this.profileQuery.getProfileByUserId(user_id);
					if (user_profile.hasOwnProperty('error')) resolve(user_profile);
					else {

						let updated_profile = await this.profileQuery.updateProfile({
							id: user_profile.id.toString(),
							image_profile: `https://drive.google.com/uc?export=view&id=${upload_result.data}`
						});

						if (updated_profile.hasOwnProperty('error')) resolve(updated_profile);
						else resolve({message: upload_result.data});

					}
				} else {
					resolve({error: true, message: upload_result.message});
				}
				
			} catch (err) {
				console.log(err);
				resolve({error: true, message: 'Upload: Invalid request'})
			}
		});
	}

}