import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { IRoleInsert, IRoleUpdate } from '../role.type';

export class Query {
	con: Pool
  constructor(){
		this.con = connectMysql();
	}

	getRoles(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Role;',
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					else {
						resolve(rows);
					}
			});
		});
	}

	getRole(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Role WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'Role: item does not exist'});
						else {
							resolve(row[0]);
						}
					}
			});
		});
	}

	addRole(ctx: IRoleInsert){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('INSERT INTO Role ( \
				name \
			) VALUES (?); ', [
				ctx.name
			], (err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully create", id: result.insertId});
						} 
						else resolve({error: true, message: 'Role: add item failed'});
					}
				});
		});
	}

	updateRole(ctx: IRoleUpdate){
		return new Promise( resolve => {
			let props: string[] = [
				"name"
			];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;
					update_data.push(ctx[key as keyof IRoleUpdate]);
				}
			});
			
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE Role SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'Role: update item failed'});
					}
				});
		});
	}

	deleteRole(id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM Role WHERE id = ?;', [id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully delete", id: id});
						} 
						else resolve({error: true, message: 'Role: delete item failed'});
					}
			});
		});
	}

	resetRole() {
		return new Promise( resolve => {
			this.con.execute('DELETE FROM Role;', 
				(err, result) => {
					if (err) throw err
					resolve(result);
			});
		});
	}
}