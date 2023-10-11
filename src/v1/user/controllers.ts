import dotenv from 'dotenv';
import { Query as MysqlQuery } from './services/mysql';
import { Query as MongoQuery } from './services/mongo';
import { IUserInsert, IUserUpdate } from './user.type';

dotenv.config();

export class Controller {
	query: any
  constructor(){
		let Query;
		switch(process.env.DB_TYPE){
				case('mysql'):
					Query = new MysqlQuery();
					break;
				case('mongo'):
					Query = new MongoQuery();
					break;
		}
		
		this.query = Query;
	}

	getUsers(){
		return new Promise( async resolve => {
			let result = await this.query.getUsers();
			resolve(result);
		});
	}

	getUser(id: string){
		return new Promise( async resolve => {
			let result = await this.query.getUser(id);
			resolve(result);
		});
	}

	addUser(ctx: IUserInsert){
		return new Promise( async resolve => {
			let result = await this.query.addUser(ctx);
			resolve(result);
		});
	}

	updateUser(ctx: IUserUpdate){
		return new Promise( async resolve => {
			let result = await this.query.updateUser(ctx);
			resolve(result);
		});
	}

	deleteUser(id: string){
		return new Promise( async resolve => {
			let result = await this.query.updateUser(id);
			resolve(result);
		});
	}

	truncateUser(){
		return new Promise( async resolve => {
			let result = await this.query.truncateUser();
			resolve(result);
		});
	}

}