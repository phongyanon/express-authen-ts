import { Pool, RowDataPacket, ResultSetHeader } from 'mysql2';
import { connectMysql } from "../../utils/dbConnection";
import { IProfileInsert, IProfileUpdate } from '../profile.type';

export class Query {
	con: Pool
  constructor(){
		this.con = connectMysql();
	}

	getProfiles(){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Profile;',
				(err, rows) => {
					if (err) resolve({error: err.toString()});
					else {
						resolve(rows.map( row => {
							row.user_id = row.user_id.toString();
							row.date_of_birth = row.date_of_birth.valueOf();
							return row;
						}));
					}
			});
		});
	}

	getProfile(id: string){
		return new Promise( resolve => {
			this.con.execute<RowDataPacket[]>('SELECT * FROM Profile WHERE id = ?;', [id], 
				(err, row) => {
					if (err) resolve({error: err.toString()});
					else {
						if (row.length === 0) resolve({error: true, message: 'Profile: item does not exist'});
						else {
							row[0].user_id = row[0].user_id.toString();
							row[0].date_of_birth = row[0].date_of_birth.valueOf();
							resolve(row[0]);
						}
					}
			});
		});
	}

	addProfile(ctx: IProfileInsert){
		return new Promise( resolve => {
			let dateOfBirth = new Date(ctx.date_of_birth);
			this.con.execute<ResultSetHeader>('INSERT INTO Profile ( \
				user_id, \
				first_name_EN, \
				last_name_EN, \
				first_name_TH, \
				last_name_TH, \
				gender, \
				date_of_birth, \
				address_EN, \
				address_TH, \
				zip_code, \
				phone, \
				image_profile \
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?); ', [
				ctx.user_id,
				ctx.first_name_EN,
				ctx.last_name_EN,
				ctx.first_name_TH,
				ctx.last_name_TH,
				ctx.gender,
				dateOfBirth,
				ctx.address_EN,
				ctx.address_TH,
				ctx.zip_code,
				ctx.phone,
				ctx.image_profile
			], (err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully create", id: result.insertId});
						} 
						else resolve({error: true, message: 'Profile: add item failed'});
					}
				});
		});
	}

	updateProfile(ctx: IProfileUpdate){
		return new Promise( resolve => {
			let props: string[] = [
				"user_id",
				"first_name_EN",
				"last_name_EN",
				"first_name_TH",
				"last_name_TH",
				"gender",
				"date_of_birth",
				"address_EN",
				"address_TH",
				"zip_code",
				"phone",
				"image_profile"
			];
			let set_field: string = '';
			let update_data: any = [];

			props.forEach( (field: string) => {
				if (ctx.hasOwnProperty(field)) {

					set_field += `${field} = ?,`;
					let key = field as string;
					if (key === 'date_of_birth'){
						let dateOfBirth = new Date(ctx[key as keyof IProfileUpdate] as number); 
						update_data.push(dateOfBirth);
					} else {
						update_data.push(ctx[key as keyof IProfileUpdate]);
					}
				}
			});
			
			update_data.push(ctx.id);

			this.con.execute<ResultSetHeader>(`UPDATE Profile SET ${set_field.slice(0, -1)} WHERE id = ?; `, update_data,
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully update", id: ctx.id});
						} 
						else resolve({error: true, message: 'Profile: update item failed'});
					}
				});
		});
	}

	deleteProfile(id: string){
		return new Promise( resolve => {
			this.con.execute<ResultSetHeader>('DELETE FROM Profile WHERE id = ?;', [id], 
				(err, result) => {
					if (err) resolve({error: err.toString()});
					else {
						if(result.affectedRows === 1){
							resolve({message: "Successfully delete", id: id});
						} 
						else resolve({error: true, message: 'Profile: delete item failed'});
					}
			});
		});
	}

	resetProfile() {
		return new Promise( resolve => {
			this.con.execute('DELETE FROM Profile;', 
				(err, result) => {
					if (err) throw err
					resolve(result);
			});
		});
	}
}