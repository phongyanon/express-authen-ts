import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { ISettingInsert, ISettingUpdate } from '../setting.type';

export class Query {
	con: Pool
  constructor(){
		this.con = connectMysql();
	}

	getSettings(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Setting;',
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					else {
						resolve(rows.map( row => {
							row.enable_reset_password_interval = row.enable_reset_password_interval === 0 ? false: true;
							row.enable_verify_email = row.enable_verify_email === 0 ? false: true;
							return row;
						}));
					}
			});
		});
	}

	getSetting(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Setting WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'Setting: item does not exist'});
						else {
							row[0].enable_reset_password_interval = row[0].enable_reset_password_interval === 0 ? false: true;
							row[0].enable_verify_email = row[0].enable_verify_email === 0 ? false: true;

							resolve(row[0]);
						}
					}
			});
		});
	}

	addSetting(ctx: ISettingInsert){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('INSERT INTO Setting ( \
				reset_password_interval, \
				enable_reset_password_interval, \
				enable_verify_email \
			) VALUES (?, ?, ?); ', [
				ctx.reset_password_interval,
				ctx.enable_reset_password_interval,
				ctx.enable_verify_email
			], (err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully create", id: result.insertId});
						} 
						else resolve({error: true, message: 'Setting: add item failed'});
					}
				});
		});
	}

	updateSetting(ctx: ISettingUpdate){
		return new Promise( resolve => {
			let props: string[] = [
				"reset_password_interval",
				"reset_password_interval",
				"enable_verify_email"
			];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;
					update_data.push(ctx[key as keyof ISettingUpdate]);
				}
			});
			
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE Setting SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'Setting: update item failed'});
					}
				});
		});
	}

	deleteSetting(id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM Setting WHERE id = ?;', [id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully delete", id: id});
						} 
						else resolve({error: true, message: 'Setting: delete item failed'});
					}
			});
		});
	}

	resetSetting() {
		return new Promise( resolve => {
			this.con.execute('DELETE FROM Setting;', 
				(err, result) => {
					if (err) throw err
					resolve(result);
			});
		});
	}
}