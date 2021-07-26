import mysql from 'mysql';
 
const db = mysql.createPool({
    host: 'localhost',
    user: 'novameet',
    password: 'dgleeteamnova11!!',
    database: 'novameet'
});
 
export default db;