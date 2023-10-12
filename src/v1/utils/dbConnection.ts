import mysql, { PoolOptions, Pool, ConnectionOptions, Connection} from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

export const connectMysql = () => {
	const access: PoolOptions = {
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PWD,
		database: process.env.NODE_ENV === 'test' ? process.env.DB_TEST: process.env.DB_NAME,
	};
		
	try {
		const conn = mysql.createPool(access);
		return conn;
	} catch (err) {
		console.log('Mysql connection error: ', err);
		throw err;
	}
}

export const createMysqlConnection = () => {
	const access: ConnectionOptions = {
		host: process.env.DB_HOST,
		port: Number(process.env.DB_PORT),
		user: process.env.DB_USER,
		password: process.env.DB_PWD,
		database: process.env.NODE_ENV === 'test' ? process.env.DB_TEST: process.env.DB_NAME,
	  };
	  
		try {
			const conn = mysql.createConnection(access);
			return conn;
		} catch (err) {
			console.log('Mysql connection error: ', err);
			throw err;
		}
}

export const disconnectMysql = (conn: Pool) => {
	try {
		conn.getConnection( (err, conns) => {
			conns.destroy();
		})
		return true;		
	} catch (err) {
		if (err) throw err
	}
	// conn.end((err) => {
		// if (err) throw err
		// return true;
	// });
}

export const resetTable = (conn: Connection, name: string) => {
	conn.execute('DELETE FROM ?;', [name], 
		(err, results) => {
			if (err) throw err
			return true;
	});
}
