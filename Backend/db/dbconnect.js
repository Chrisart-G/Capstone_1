const mysql = require('mysql');
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', 
  password: '', 
  database: 'municipal_db', 
});

db.connect((err) => {
  if (err) {
    console.log('Error connecting to the database:balda', err);
    return;
  }
  console.log('Connected to MySQL databae ara nasa!');
});

module.exports = db; 