import mysql, { ConnectionOptions } from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const access: ConnectionOptions = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.NODE_ENV === 'test' ? process.env.DB_TEST: process.env.DB_NAME,
};

const conn = mysql.createConnection(access);

const createTableUser = () => {
  return new Promise( resolve => {
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
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableProfile = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE Profile (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(255),
        FOREIGN KEY (user_id) REFERENCES User(id),
        first_name_EN VARCHAR(255),
        last_name_EN VARCHAR(255),
        first_name_TH VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
        last_name_TH VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
        gender VARCHAR(255),
        date_of_birth DATE,
        address_EN VARCHAR(255),
        address_TH VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci,
        zip_code INT(255),
        phone INT(255),
        image_profile VARCHAR(255),
        create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_at TIMESTAMP
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableToken = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE Token (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(255),
        FOREIGN KEY (user_id) REFERENCES User(id),
        refresh_token VARCHAR(255),
        refresh_token_expires_at TIMESTAMP,
        reset_password_token VARCHAR(255),
        reset_password_token_expires_at TIMESTAMP,
        verify_email_token VARCHAR(255),
        verify_email_token_expires_at TIMESTAMP,
        email_verified BOOLEAN,
        enable_opt BOOLEAN,
        otp_secret VARCHAR(255),
        otp_verified BOOLEAN,
        token_salt VARCHAR(255),
        create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_at TIMESTAMP  
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableSetting = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE Setting (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        reset_password_interval INT(255),
        enable_reset_password_interval BOOLEAN,
        enable_verify_email BOOLEAN,
        create_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        update_at TIMESTAMP     
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableRole = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE Role (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255)
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTablePermission = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE Permission (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        database_name VARCHAR(255)
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableUserRole = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE UserRole (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        user_id INT(255),
        FOREIGN KEY (user_id) REFERENCES User(id),
        role_id INT(255), 
        FOREIGN KEY (role_id) REFERENCES Role(id)
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableRolePermission = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE RolePermission (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        role_id INT(255),
        FOREIGN KEY (role_id) REFERENCES Role(id),
        permission_id INT(255),    
        FOREIGN KEY (permission_id) REFERENCES Permission(id)
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const createTableAction = () => {
  return new Promise( resolve => {
    conn.execute(`
      CREATE TABLE Action (
        id INT(255) AUTO_INCREMENT PRIMARY KEY,
        permission_id INT(255),
        FOREIGN KEY (permission_id) REFERENCES Permission(id),
        name ENUM('create', 'read', 'update', 'delete'),
        scope ENUM('own', 'all')
      ) ENGINE=INNODB;
    `, (err, result) => {
      if (err) throw err;
      resolve(result);
    });
  });
}

const migrateDB = async () => {

  await createTableUser();
  await createTableProfile();
  await createTableToken();
  await createTableSetting();

  await createTableRole();
  await createTablePermission();
  await createTableUserRole();

  await createTableRolePermission();
  await createTableAction();

  conn.destroy();
  console.log(`Migrate ${process.env.NODE_ENV} database done...`);
}

migrateDB();