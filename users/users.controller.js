const express = require('express');
const router = express.Router();
const userService = require('./user.service');
const authorize = require('_helpers/authorize')
const Role = require('_helpers/role');
const {pool} = require('./../db/connection.js');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const config = require('config.json');

// routes
router.post('/authenticate', authenticate);     // public route
router.get('/', authorize(Role.Admin), getAll); // admin only
//router.get('/:id', authorize(), getById);       // all authenticated users
router.post('/signup-admin', signUpAdmin);
router.post('/login', login);
router.post('/token', authorize(), getUserData);

module.exports = router;

// verify token
function getUserData(req, res, next){
    try{
        const beader_token = req.header('authorization');
        if(beader_token){
            const bearer = beader_token.split(' ');
            const bearerToken = bearer[1];
            const decoded = jwt.verify(bearerToken, config.secret);
            res.json(decoded);
        } else throw new Error("Authorization token requierd");
    } catch(error){
        res.json({
            status: false,
            error: {
                message: "Invalid Token Data"
            }
        });
    }
}
// login
async function login(req, res, next){
    try{
        const email = req.body.email;
        const password = req.body.password;
        pool.query("SELECT * FROM users WHERE email = ?", [email] , async (err, data) => {
            if(data && data.length > 0){
                const isValid = await bcrypt.compare(password, data[0].password)
                if(isValid){
                    // generate token here
                    const resDataParam =  {
                        id: data[0].id,
                        name: data[0].name,
                        email: data[0].email,
                        role: data[0].role
                    };
                    //const token = jwt.sign({data: resDataParam}, config.secret);
                    const token = jwt.sign({ sub: data[0].id, role: data[0].role }, config.secret);
                    res.json({
                        status: true,
                        data: {
                            id: data[0].id,
                            name: data[0].name,
                            email: data[0].email,
                            role: data[0].role
                        },
                        token
                    });
                } else {
                    res.json({
                        status: false,
                        error: {
                            message: "password not match"
                        }
                    });
                }
            } else {
                res.json({
                    status: "not found any result"
                })
            }
        });
    } catch(error){
        res.json({
            status: false,
            error: {
                message: error.message
            }
        });
    }
}

function signUpAdmin(req, res, next){
    try{
        const {name, email, password} = req.body;
        pool.query("SELECT * FROM users WHERE email = ?", [email] , async (err, data, field) => {
            if(err) {
                console.error(err);
                return;
            }
            if(data && data.length > 0){
                return res.send({
                    status: false,
                    error: {
                        message: "user already exists"
                    }
                })
            } else {
                // insert into db
                const saltRounds = 10;
                const pass = bcrypt.hashSync(password, saltRounds);
                pool.query("INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, ?)", [name, email, pass, Role.Admin, new Date()], async (err, data, fields) => {
                    if(err) throw new Error(err);
                    const token = jwt.sign({ sub: data.insertId, role: Role.Admin}, config.secret);
                    res.json({
                        status: "success",
                        token 
                    });
                })
            }
        });
    } catch(error){
        throw new Error(error);
    }
}
/**
 * login by email and password 
 */


function authenticate(req, res, next) {
    userService.authenticate(req.body)
        .then(user => user ? res.json(user) : res.status(400).json({ message: 'Username or password is incorrect' }))
        .catch(err => next(err));
}

function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(err => next(err));
}

function getById(req, res, next) {
    const currentUser = req.user;
    const id = parseInt(req.params.id);

    // only allow admins to access other user records
    if (id !== currentUser.sub && currentUser.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(err => next(err));
}