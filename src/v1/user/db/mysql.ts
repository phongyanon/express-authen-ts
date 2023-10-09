import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { IUser } from '../user.interface';
import { resolve } from 'path';

export class Query {
	con: Pool
  constructor(){
		this.con = connectMysql();
	}

	getUsers(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM User;',
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					resolve(rows);
			});
		});
	}

	getUser(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM User WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					if (row.length === 0) resolve({error: true, message: 'User: item does not exist'});
					resolve(row);
			});
		});
	}

	addUser(ctx: IUser){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('INSERT INTO User ( \
				username, email, is_sso_user, sso_user_id, sso_from, status, \
			) VALUES (?, ?, ?, ?, ?, ?); ', [
				ctx.username, ctx.email, ctx.is_sso_user, ctx.sso_user_id, ctx.sso_from, ctx.status
			],
			(err, result) => {
				if (err) resolve({error: err.toString()});
				if(result.affectedRows === 1){
					resolve({status: "success", newId: result.insertId});
				} 
				else resolve({error: true, message: 'User: add item failed'});
			});
		});
	}

	updateUser(ctx: IUser){

	}

	deleteUser(id: string){

	}

	truncateUser() {

	}
}