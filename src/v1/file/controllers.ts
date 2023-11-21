import dotenv from 'dotenv';
import { Request as Req } from "express";
import { Query as UserMysqlQuery } from '../user/services/mysql';
import { Query as UserMongoQuery } from '../user/services/mongo';
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
  constructor(){
		let UserQuery;
		switch(process.env.DB_TYPE){
				case('mysql'):
					UserQuery = new UserMysqlQuery();
					break;
				case('mongo'):
					UserQuery = new UserMongoQuery();
					break;
		}
		
		this.userQuery = UserQuery;
	}

	@Post("/upload/profile/image")
	@SuccessResponse("200", "Upload image profile")
	@Example<ISuccessResponse>({
		message: 'success'
  })
	uploadToGoogleDrive(@Request() req: Req ): Promise<IResponse | ISuccessResponse>{
		return new Promise( async resolve => {
			try {
				const { file }: any = req;
				console.log('file: ', file);
				let now = new Date()
				let file_name: string = `${now.valueOf().toString()}_${file.originalname}`;
				let upload_result :any = await googleDrive.uploadFile(file_name, file.path);

				if (upload_result.success === true){
					resolve({message: upload_result.data});
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