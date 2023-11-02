import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { ITokenInsert, ITokenUpdate } from '../token.type';

export class Query {
	con: Pool
  constructor(){
		this.con = connectMysql();
	}

	getTokens(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Token;',
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					else {
						resolve(rows.map( row => {
							row.user_id = row.user_id.toString(); 
							row.refresh_token_expires_at = row.refresh_token_expires_at.valueOf();
							row.access_token_expires_at = row.access_token_expires_at.valueOf();

							return row;
						}));
					}
			});
		});
	}

	getToken(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Token WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'Token: item does not exist'});
						else {
							row[0].user_id = row[0].user_id.toString();
							row[0].refresh_token_expires_at = row[0].refresh_token_expires_at.valueOf();
							row[0].access_token_expires_at = row[0].access_token_expires_at.valueOf();

							resolve(row[0]);
						}
					}
			});
		});
	}

	getTokenByUserId(user_id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Token WHERE user_id = ?;', [user_id], 
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					else {
						if (rows.length === 0) resolve({error: true, message: 'Token: item does not exist'});
						else {
							resolve(rows.map( row => {
								row.user_id = row.user_id.toString(); 
								row.refresh_token_expires_at = row.refresh_token_expires_at.valueOf();
								row.access_token_expires_at = row.access_token_expires_at.valueOf();
	
								return row;
							}));
						}
					}
			});
		});
	}

	addToken(ctx: ITokenInsert){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('INSERT INTO Token ( \
				user_id, \
				refresh_token, \
				refresh_token_expires_at, \
				access_token, \
				access_token_expires_at, \
				description \
			) VALUES (?, ?, ?, ?, ?, ?); ', [
				ctx.user_id,
				ctx.refresh_token,
				ctx.refresh_token_expires_at !== null ? new Date(ctx.refresh_token_expires_at): null,
				ctx.access_token,
				ctx.access_token_expires_at !== null ? new Date(ctx.access_token_expires_at): null,
				ctx.description
			], (err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully create", id: result.insertId});
						} 
						else resolve({error: true, message: 'Token: add item failed'});
					}
				});
		});
	}

	updateToken(ctx: ITokenUpdate){
		return new Promise( resolve => {
			let props: string[] = [
				"refresh_token",
				"refresh_token_expires_at",
				"access_token",
				"access_token_expires_at",
				"description"
			];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;

					if ((key === 'refresh_token_expires_at') || 
							(key === 'access_token_expires_at')) {
						
						if (ctx[key as keyof ITokenUpdate] !== null) {
							update_data.push(new Date(ctx[key as keyof ITokenUpdate] as number));
						} else {
							update_data.push(ctx[key as keyof ITokenUpdate]);
						}

					} else {
						update_data.push(ctx[key as keyof ITokenUpdate]);
					}

				}
			});
			
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE Token SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'Token: update item failed'});
					}
				});
		});
	}

	deleteToken(id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM Token WHERE id = ?;', [id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully delete", id: id});
						} 
						else resolve({error: true, message: 'Token: delete item failed'});
					}
			});
		});
	}

	deleteTokenByUserId(user_id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM Token WHERE user_id = ?;', [user_id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows > 0){
							resolve({message: "Successfully delete", deletedItems: result.affectedRows});
						} 
						else resolve({error: true, message: 'Token: delete item failed'});
					}
			});
		});
	}

	resetToken() {
		return new Promise( resolve => {
			this.con.execute('DELETE FROM Token;', 
				(err, result) => {
					if (err) throw err
					resolve(result);
			});
		});
	}
}