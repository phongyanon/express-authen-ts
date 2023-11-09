import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { IUserRoleInsert, IUserRoleUpdate } from '../uesrRole.type';

export class Query {
	con: Pool
  constructor(){
		this.con = connectMysql();
	}

	getUserRoles(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM UserRole;',
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					else {
						resolve(rows.map( row => {
							row.user_id = row.user_id.toString();
							row.role_id = row.role_id.toString();

							return row;
						}));
					}
			});
		});
	}

	getUserRole(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM UserRole WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'UserRole: item does not exist'});
						else {
							row[0].user_id = row[0].user_id.toString();
							row[0].role_id = row[0].role_id.toString();

							resolve(row[0]);
						}
					}
			});
		});
	}

	addUserRole(ctx: IUserRoleInsert){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('INSERT INTO UserRole ( \
				user_id, \
				role_id \
			) VALUES (?, ?); ', [
				ctx.user_id,
				ctx.role_id
			], (err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully create", id: result.insertId});
						} 
						else resolve({error: true, message: 'UserRole: add item failed'});
					}
				});
		});
	}

	updateUserRole(ctx: IUserRoleUpdate){
		return new Promise( resolve => {
			let props: string[] = [
				"user_id",
				"role_id"
			];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;
					update_data.push(ctx[key as keyof IUserRoleUpdate]);
				}
			});
			
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE UserRole SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'UserRole: update item failed'});
					}
				});
		});
	}

	deleteUserRole(id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM UserRole WHERE id = ?;', [id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully delete", id: id});
						} 
						else resolve({error: true, message: 'UserRole: delete item failed'});
					}
			});
		});
	}

	resetUserRole() {
		return new Promise( resolve => {
			this.con.execute('DELETE FROM UserRole;', 
				(err, result) => {
					if (err) throw err
					resolve(result);
			});
		});
	}
}