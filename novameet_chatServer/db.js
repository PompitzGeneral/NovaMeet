import mysql from 'mysql';
import dotinv from 'dotenv';

dotinv.config();
 
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

export default db;