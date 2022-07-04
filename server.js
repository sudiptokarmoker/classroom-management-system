require('rootpath')();
const express = require('express');
const app = express();
require('dotenv').config({path: __dirname + '/.env'})
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('_helpers/error-handler');
const {db} = require("./db/connection.js");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// api routes
app.use('/users', require('./users/users.controller'));
app.use('/teachers', require('./teachers/teachers.controller'));
app.use('/classroom', require('./classroom/classroom.controller'));
app.use('/students', require('./students/students.controller'));
app.use('/files', require('./test-data/test.controller'));

// global error handler
app.use(errorHandler);

// start server
const port = process.env.NODE_ENV === 'production' ? 80 : 4000;
const server = app.listen(port, function () {
    console.log('Server listening on port ' + port);
});