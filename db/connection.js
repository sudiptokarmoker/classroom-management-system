const pg = require('pg')
require('dotenv').config()

/*
const pool = new pg.Pool({
	host: 	  process.env.DB_HOST || 'localhost',
	database: process.env.DB_NAME || 'visionboarder',
	port: 	  process.env.DB_PORT || 5432,
	user: 	  process.env.DB_USER,
	password: process.env.DB_USER_PASSWORD
});
*/
/*
const connectionString = 'postgres://cjvwbvnpruqzkb:491e7320ecf04eaed747a2d951c794b7234f33b627a3ed7eb857e8c685f3d99a@ec2-3-217-14-181.compute-1.amazonaws.com:5432/de10i46gepbsaq'
*/
const pool = new pg.Pool({
	host: 	  'ec2-3-217-14-181.compute-1.amazonaws.com',
	database: 'de10i46gepbsaq',
	port: 	  5432,
	user: 	  'cjvwbvnpruqzkb',
	password: '491e7320ecf04eaed747a2d951c794b7234f33b627a3ed7eb857e8c685f3d99a'
});
/*
dbname=de10i46gepbsaq host=ec2-3-217-14-181.compute-1.amazonaws.com port=5432 user=cjvwbvnpruqzkb password=491e7320ecf04eaed747a2d951c794b7234f33b627a3ed7eb857e8c685f3d99a sslmode=require
*/
/*
const pool = new pg.Pool({
    connectionString,
  });
*/
pool.on('connect', client => {
	console.log('Successfully connected to Postgre SQL Database.');
});

pool.on('error', function (err) {
	console.log('idle client error', err.message, err.stack)
})

module.exports = {
	pool,
	query: (text, params, callback) => {
		return pool.query(text, params, callback)
	}
}