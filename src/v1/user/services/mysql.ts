import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { IUserInsert, IUserUpdate } from '../user.type';

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
					else {
						resolve(rows.map( row => {
							row.is_sso_user = row.is_sso_user === 0 ? false: true;
							return row;
						}));
					}
			});
		});
	}

	getUser(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM User WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'User: item does not exist'});
						else {
							row[0].is_sso_user = row[0].is_sso_user === 0 ? false: true;
							resolve(row[0]);
						}
					}
			});
		});
	}

	getUserByUsername(username: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM User WHERE username = ?;', [username], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'User: item does not exist'});
						else {
							row[0].is_sso_user = row[0].is_sso_user === 0 ? false: true;
							resolve(row[0]);
						}
					}
			});
		});
	}

	getUserByEmail(email: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM User WHERE email = ?;', [email], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'User: item does not exist'});
						else {
							row[0].is_sso_user = row[0].is_sso_user === 0 ? false: true;
							resolve(row[0]);
						}
					}
			});
		});
	}

	getUserPagination(limit: number, offset: number){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM User ORDER BY username, id LIMIT ? OFFSET ?;', [limit.toString(), offset.toString()], 
				(err, row) => {
					if (err) resolve({error: err.toString(), message: 'User: Invalid request'});
					else {
						if (row.length === 0) resolve({error: true, message: 'User: Invalid request'});
						else {
							row[0].is_sso_user = row[0].is_sso_user === 0 ? false: true;
							resolve(row[0]);
						}
					}
			});
		});
	}

	getUserCount(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT COUNT(id) AS userCount FROM User;',
				(err, row) => {
					if (err) resolve({error: err.toString(), message: 'User: Invalid request'});
					else {
						resolve(row[0]);
					}
			});
		});
	}

	getUserProfileByUserId(user_id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT \
					User.id as user_id, \
					Profile.id as profile_id, \
					User.username, \
  				User.email, \
  				User.is_sso_user, \
  				User.sso_user_id, \
  				User.sso_from, \
  				User.status, \
					Profile.first_name_EN, \
  				Profile.last_name_EN, \
  				Profile.first_name_TH, \
  				Profile.last_name_TH, \
  				Profile.gender, \
  				Profile.date_of_birth, \
  				Profile.address_EN, \
  				Profile.address_TH, \
  				Profile.zip_code, \
  				Profile.phone, \
  				Profile.image_profile \
					 FROM User \
					 INNER JOIN Profile ON User.id=Profile.user_id WHERE Profile.user_id=?;', [user_id],
				(err, row) => {
					if (err) resolve({error: err.toString(), message: 'User: Invalid request'});
					else {
						if (row.length === 0) resolve({error: true, message: 'User: item does not exist'});
						else {
							row[0].user_id = row[0].user_id.toString();
							row[0].profile_id = row[0].profile_id.toString();
							row[0].date_of_birth = row[0].date_of_birth.valueOf();
							resolve(row[0]);
						}
					}
			});
		});
	}

	searchUser(name: string, limit: number){
		return new Promise( resolve => {
			let keyword: string = `%${name}%`
			this.con.execute<RowDataPacket[]>("SELECT * FROM User WHERE username LIKE ? LIMIT ?;", [keyword, limit.toString()],
				(err, rows) => {
					if (err) resolve({error: err.toString(), message: 'User: Invalid request'});
					else {
						resolve(rows);
					}
			});
		});
	}

	addUser(ctx: IUserInsert){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('INSERT INTO User ( \
				username, password, password_salt, email, is_sso_user, sso_user_id, sso_from, status \
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?); ', [
				ctx.username, ctx.password, ctx.password_salt, ctx.email, ctx.is_sso_user, ctx.sso_user_id, ctx.sso_from, ctx.status
			], (err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully create", id: result.insertId});
						} 
						else resolve({error: true, message: 'User: add item failed'});
					}
				});
		});
	}

	updateUser(ctx: IUserUpdate){
		return new Promise( resolve => {
			let props: string[] = ['username', 'email', 'is_sso_user', 'sso_user_id', 'sso_from', 'status'];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;
					update_data.push(ctx[key as keyof IUserUpdate]);

				}
			});
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE User SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'User: update item failed'});
					}
				});
		});
	}

	updatePasswordUser(ctx: IUserUpdate){
		return new Promise( resolve => {
			let props: string[] = ['password', 'password_salt'];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;
					update_data.push(ctx[key as keyof IUserUpdate]);

				}
			});
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE User SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'User: update item failed'});
					}
				});
		});
	}

	deleteUser(id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM User WHERE id = ?;', [id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully delete", id: id});
						} 
						else resolve({error: true, message: 'User: delete item failed'});
					}
			});
		});
	}

	resetUser() {
		return new Promise( resolve => {
			this.con.execute('DELETE FROM User;', 
				(err, result) => {
					if (err) throw err
					resolve(result);
			});
		});
	}
}