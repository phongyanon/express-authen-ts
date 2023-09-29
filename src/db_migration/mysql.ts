import mysql, { ConnectionOptions } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const access: ConnectionOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
};

const conn = mysql.createConnection(access);
// console.log(conn)

//  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci
conn.execute(`
  CREATE TABLE User (
    id INT(255) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    is_sso_user BOOLEAN,
    sso_user_id VARCHAR(255),
    sso_from VARCHAR(255),
    status ENUM('active', 'inactive'),
    password_expires_at TIMESTAMP,
    create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP
  );
`, (err, result) => {
  console.log(result)
  conn.destroy()
});